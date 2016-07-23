'use strict'

angular.module('predictionMarketApp').service('predictionMarketService', function ($q, $log, appState) {
  var self = this
  const WEEK = 7 * 24 * 60 * 60
  angular.extend(this, {
    retrieveMarkets: retrieveMarkets,
    createMarket: createMarket,
    loadMarketData: loadMarketData,
    publishMarket: publishMarket,
    bid: bid,
    getBets: getBets,
    is: {
      yes: (verdict) => verdict == 1,
      no: (verdict) => verdict == 2,
      unresponded: (verdict) => verdict == 0,
      expiredMarket: (expiration) => (Date.now()/1000) >= expiration.toNumber(),
      expiredResponseTime: (expiration) => (Date.now()/1000) >= expiration.toNumber() + WEEK,
      expiredWithdraw: (expiration) => (Date.now()/1000) >= expiration.toNumber() + 4 * WEEK,
    },
  })

  var marketsIndex = PredictionMarketsIndex.deployed()
  $log.info('PredictionMarketsIndex address:', PredictionMarketsIndex.deployed_address)

  function retrieveMarkets() {
    return marketsIndex.getAvailableMarketsRawArray.call()
    .then(function (addrs) {
      var markets = appState.markets.availMrktAddrs
      markets.splice(0, markets.length)
      // var markets = []
      for (var i=0; i < addrs.length; i++) {
        if (addrs[i] != 0)
          markets.push(addrs[i])
      }
      // appState.markets.availMrktAddrs = markets
    })
    .then(function () {
      return $q.all(appState.markets.availMrktAddrs.map(function (addr) {
        return loadMarketData(addr)
      }))
    })
  }

  function createMarket(question, expirationTime, responder, feeRate, initialPrize) {
    // var newMarket
    return $q.all([
      !appState.selectedAccount.address && $q.reject('Missing selected account for the operation'),
      !question && $q.reject('Missing question'),
      !expirationTime && $q.reject('Invalid expirationTime'),
      !responder && $q.reject('Missing responder address'),
      !initialPrize && $q.reject('Missing initial prize'),
    ])
    .then(function () {
      return PredictionMarket.new(question, expirationTime, responder, feeRate, {from: appState.selectedAccount.address, value: initialPrize, gas: appState.selectedAccount.gasLimit})
    })
    .then(function (contract) {
      $log.info('New PredictionMarket at address: ', contract.address)
      appState.marketCreation.created = contract.address
      return contract
    })
  }

  function loadMarketData(address) {
    var market = PredictionMarket.at(address)
    var marketData = {}
    return $q.all([
      !address && $q.reject('Missing market address'),
    ])
    .then(function () {
      return $q.all([
        market.question.call(),
        market.expiration.call(),
        market.responder.call(),
        market.owner.call(),
        market.yes.call(),
        market.no.call(),
        market.payout.call(),
        market.feeRate.call(),
        market.getYesPrice.call(),
        market.getNoPrice.call(),
        market.prizePool.call(),
        market.totalFees.call(),
        market.getVerdict.call(),
      ])
    })
    .then(function (data) {
      angular.extend(marketData, {
        question: data[0],
        expiration: data[1],
        responder: data[2],
        owner: data[3],
        yes: data[4],
        no: data[5],
        payout: data[6],
        feeRate: data[7],
        getYesPrice: data[8],
        getNoPrice: data[9],
        prizePool: data[10],
        totalFees: data[11],
        getVerdict: data[12],
      })
      return $q.all([
        AnswerToken.at(marketData.yes).totalSupply.call(),
        AnswerToken.at(marketData.no).totalSupply.call(),
      ])
    })
    .then(function (data) {
      angular.extend(marketData, {
        yesTotalBids: data[0],
        noTotalBids: data[1],
      })
      var marketsDetails = appState.markets.marketsDetails
      marketsDetails[address] = angular.extend(marketsDetails[address] || {}, marketData)
    })
  }

  // Temporary function. An alternative idea is that PredictionMarket contract register itself in the index at the creation.
  function publishMarket() {
    return $q.all([
      !appState.selectedAccount.address && $q.reject('Missing selected account for the operation'),
      !appState.marketCreation.created && $q.reject('No unpublished market'),
    ])
    .then(function () {
      return marketsIndex.addMarket(appState.marketCreation.created, {from: appState.selectedAccount.address})
    })
    .then(function (txid) {
      $log.info('MarketsIndex.addMarket() txid:', txid)
      appState.marketCreation.created = null
    })
    .then(retrieveMarkets)
  }

  function bid(marketAddress, what, value) {
    return $q.all([
      !appState.selectedAccount.address && $q.reject('Missing selected account for the operation'),
      !marketAddress && $q.reject('Market address missing'),
      what!=='yes' && what!=='no' && $q.reject('Only yes or no allowed bids'),
      !value && $q.reject('Bid amount missing'),
    ])
    .then(function () {
      market = PredictionMarket.at(marketAddress)
      bidfn = what === 'yes' ? 'bidYes' : 'bidNo'
      return market[bidfn]({from: appState.selectedAccount.address, value: value})
    })
    .then(function (txid) {
      $log.info('bid', value, 'for', what, 'to', marketAddress, 'txid:', txid)
      return loadMarketData(marketAddress)
    })
  }

  function getBets(marketAddr, address) {
    market = PredictionMarket.at(marketAddr)
    return $q.all([
      market.yes.call(),
      market.no.call()
    ])
    .then(tokens => $q.all([
      AnswerToken.at(tokens[0]).balanceOf.call(address),
      AnswerToken.at(tokens[1]).balanceOf.call(address),
    ]))
  }


})
