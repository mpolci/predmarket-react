'use strict'

angular.module('predictionMarketApp').service('predictionMarketService', function ($rootScope, $q, $log, appState) {
  var self = this
  const WEEK = 7 * 24 * 60 * 60
  angular.extend(this, {
    retrieveMarkets: retrieveMarkets,
    createMarket: createMarket,
    loadMarketData: loadMarketData,
    publishMarket: publishMarket,
    getTransactionReceiptMined,
    bid: bid,
    getBets: getBets,
    giveVerdict: giveVerdict,
    withdrawPrize,
    withdrawFees,
    withdraw,
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
    .then(() => {
      $rootScope.$emit('market-list-updated')
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

  function fetchContractData(contract, fields) {
    return () => $q.all(fields.map(f => contract[f].call()))
    .then(values => {
      data = {}
      values.forEach((v,i) => {
        data[fields[i]] = v
      })
      return data
    })
  }

  function loadMarketData(address) {
    var market = PredictionMarket.at(address)
    var marketData = {}
    return $q.all([
      !address && $q.reject('Missing market address'),
    ])
    .then(fetchContractData(market, [
      'question',
      'expiration',
      'responder',
      'owner',
      'yes',
      'no',
      'payout',
      'feeRate',
      'getYesPrice',
      'getNoPrice',
      'prizePool',
      'totalFees',
      'getVerdict',
    ]))
    .then(function (data) {
      angular.extend(marketData, data)
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


  function getTransactionReceiptMined (txnHash, interval, maxwait) {
    interval |=  5000  // 5 seconds
    maxwait |= 300000  // 5 minutes
    return new Promise(function (resolve, reject) {
      var counter = parseInt(maxwait / interval)
      ;(function checkMined() {
        var receipt = web3.eth.getTransactionReceipt(txnHash);
        if (receipt) resolve(receipt)
        else if (counter--) setTimeout(checkMined, interval)
        else reject(new Error('Transaction not mined within ' + maxwait + 'minutes: ' + txid))
      })()
    })
  }

  // Temporary function. An alternative idea is that PredictionMarket contract register itself in the index at the creation.
  function publishMarket() {
    return $q.all([
      !appState.selectedAccount.address && $q.reject('Missing selected account for the operation'),
      !appState.marketCreation.created && $q.reject('No unpublished market'),
    ])
    .then(function () {
      return marketsIndex.addMarket.call(appState.marketCreation.created, {from: appState.selectedAccount.address})
    })
    .then(function (result) {
      $log.debug('addMarket simulation result:', result)
    })
    .then(function () {
      return marketsIndex.addMarket(appState.marketCreation.created, {from: appState.selectedAccount.address})
    })
    .then(function (txid) {
      $log.info('MarketsIndex.addMarket() txid:', txid)
      appState.marketCreation.created = null
      return txid
    })
    .then(txid => getTransactionReceiptMined(txid))
    .then(() => retrieveMarkets())
  }

  function bid(marketAddress, what, value) {
    let details = appState.markets.marketsDetails[marketAddress]
    let price = what === 'yes' ? details.getYesPrice : details.getNoPrice
    return $q.all([
      !appState.selectedAccount.address && $q.reject('Missing selected account for the operation'),
      !marketAddress && $q.reject('Market address missing'),
      what!=='yes' && what!=='no' && $q.reject('Only yes or no allowed bids'),
      !value && $q.reject('Bid amount missing'),
      price.greaterThan(value) && $q.reject('Too low amount'),
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
    .then(tokens => {
      return $q.all([
      AnswerToken.at(tokens[0]).balanceOf.call(address),
      AnswerToken.at(tokens[1]).balanceOf.call(address),
    ])})
  }

  function giveVerdict(marketAddress, what) {
    var selected = appState.selectedAccount.address
    var responder = appState.markets.marketsDetails[marketAddress].responder
    return $q.all([
      !selected && $q.reject('Missing selected account for the operation'),
      selected != responder && $q.reject('Only responder il allowed to give verdict'),
      !marketAddress && $q.reject('Market address missing'),
      what!=='yes' && what!=='no' && $q.reject('Only yes or no allowed verdict'),
    ])
    .then(function () {
      var market = PredictionMarket.at(marketAddress)
      return market.answer(what === 'yes', {from: selected})
    })
  }

  function withdrawFees(marketAddress) {
    var selected = appState.selectedAccount.address
    var owner = appState.markets.marketsDetails[marketAddress].owner
    return $q.all([
      !selected && $q.reject('Missing selected account for the operation'),
      selected != owner && $q.reject('Only owner il allowed to withdraw fees'),
      !marketAddress && $q.reject('Market address missing'),
    ])
    .then(function () {
      var market = PredictionMarket.at(marketAddress)
      return market.withdrawFees({from: selected})
    })
  }

  function withdrawPrize(marketAddress) {
    var selected = appState.selectedAccount.address
    return $q.all([
      !selected && $q.reject('Missing selected account for the operation'),
      !marketAddress && $q.reject('Market address missing'),
    ])
    .then(function () {
      var market = PredictionMarket.at(marketAddress)
      return market.withdrawPrize({from: selected})
    })
  }

  function withdraw(marketAddress) {
    var selected = appState.selectedAccount.address
    return $q.all([
      !selected && $q.reject('Missing selected account for the operation'),
      !marketAddress && $q.reject('Market address missing'),
    ])
    .then(function () {
      var market = PredictionMarket.at(marketAddress)
      return market.withdraw({from: selected})
    })
  }
})
