
angular.module('predictionMarketApp')
.factory('marketCreationActions', () => ({
  reqNewMarket: (pmArgs) => ({ type: 'REQ_NEW_MARKET', pmArgs }),
  reqPublish: (marketAddress) => ({ type: 'REQ_PUBLISH', marketAddress }),
  chgMarketCreationArgs: (args) => ({ type: 'CHG_MARKET_CREATION_ARGS', args }),
}))
.factory('marketsListActions', () => ({
  reqRefreshMarkets: () => ({ type: 'REQ_REFRESH_MARKETS' }),
}))

.factory('marketCreationReducer', function () {
  const defaultState = {
    created: null,
    question: '',
    expirationTime: Math.floor(Date.now() / 1000) + 60,
    responder: web3.eth.coinbase,
    feeRate: 100,
    initialPrize: 1000000000000000000,
  }
  return function (state = defaultState, action) {
    switch (action.type) {
      case 'CHG_MARKET_CREATION_ARGS':
        let args = action.args
        return Object.assign({}, state, {
          question: args.question,
          expirationTime: args.expirationTime,
          responder: args.responder,
          feeRate: args.feeRate,
          initialPrize: args.initialPrize,
        })
      case 'SET_MARKET_CREATED':
        return Object.assign({}, state, {
          created: action.address,
        })
      default:
        return state
    }
  }
})
.factory('marketsReducer', function () {
  const defaultState = {
    availMrktAddrs: [],
    marketsDetails: { /* '<address>': { ... } */ },
  }
  return function (state = defaultState, action) {
    switch (action.type) {
      case 'SET_MARKETS':
        let list = action.list || Object.keys(action.details)
        return Object.assign({}, state, {
          availMrktAddrs: list,
          marketsDetails: action.details,
        })
      default:
        return state
    }
  }
})

.factory('sagaMarkets', function ($rootScope, $log, $q, predictionMarketService) {
  let effects = ReduxSaga.effects
  let getSelectedAccount = state => state.selectedAccount
  let marketsIndex = PredictionMarketsIndex.deployed()
  return function* () {
    yield [
      ReduxSaga.takeLatest('REQ_NEW_MARKET', reqNewMarket),
      ReduxSaga.takeEvery('REQ_PUBLISH', reqPublish),
      ReduxSaga.takeLatest('REQ_REFRESH_MARKETS', retrieveMarkets),
    ]
  }

  function* reqNewMarket(action) {
    try {
      let from = yield effects.select(getSelectedAccount)
      let args = action.pmArgs

      if(!from.address) throw new Error('Missing selected account for the operation')
      if(!args.question) throw new Error('Missing question')
      if(!args.expirationTime) throw new Error('Invalid expirationTime')
      if(!args.responder) throw new Error('Missing responder address')
      if(!args.initialPrize) throw new Error('Missing initial prize')

      let contract = yield effects.call([PredictionMarket, PredictionMarket.new],
        args.question, args.expirationTime, args.responder, args.feeRate,
        {from: from.address, value: args.initialPrize, gas: from.gasLimit})

      $log.info('New PredictionMarket at address: ', contract.address)
      yield effects.put({type: 'SET_MARKET_CREATED', address: contract.address})
    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_NEW_MARKET', error})
    }
  }

  function* reqPublish(action) {
    try {
      let from = yield effects.select(getSelectedAccount)

      if(!from.address) throw new Error('Missing selected account for the operation')
      if(!action.marketAddress) throw new Error('Missing market address')

      let addMarket = marketsIndex.addMarket
      let txArgs = { from: from.address }
      let simulationRes = yield effects.call([addMarket, addMarket.call],
        action.marketAddress, txArgs)
      $log.debug('addMarket simulation result:', simulationRes)
      let txid = yield effects.call([marketsIndex, addMarket],
        action.marketAddress, txArgs)
      $log.info('MarketsIndex.addMarket() txid:', txid)
      yield [effects.put({type: 'SET_MARKET_CREATED', address: null}),
             effects.put({type: 'SET_PUBLISH_TXID', txid})]
      yield effects.call(predictionMarketService.getTransactionReceiptMined, txid)
      yield* retrieveMarkets()

    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_PUBLISH', error})
    }
  }

  function* retrieveMarkets() {
    let list = yield fetchMarketsList()
    let details = yield fetchMarketsDetails(list)
    yield effects.put({type: 'SET_MARKETS', list, details})
  }

  function fetchMarketsList() {
    return marketsIndex.getAvailableMarketsRawArray.call()
    .then(function (addrs) {
      var markets = []
      for (var i=0; i < addrs.length; i++) {
        if (addrs[i] != 0)
          markets.push(addrs[i])
      }
      return markets
    })
  }

  function fetchMarketsDetails(adressList) {
    return $q.all(adressList.map(function (addr) {
      return loadMarketData(addr)
    }))
    .then(list => list.reduce((map,  obj) => {
      map[obj.address] = obj
      return map
    }, {}))
    .then(data => {
      $rootScope.$emit('market-list-updated')
      return data
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
    var marketData = { address }
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
      return marketData
    })
  }


})
