'use strict'

angular.module('predictionMarketApp').service('predictionMarketService', function ($rootScope, $q, $log) {
  var self = this
  const WEEK = 7 * 24 * 60 * 60
  angular.extend(this, {
    transactionReceiptMined,
    deployContract,
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

  function* transactionReceiptMined (txnHash, interval, maxwait) {
    interval |=  5000  // 5 seconds
    maxwait |= 300000  // 5 minutes
    var counter = parseInt(maxwait / interval)
    let receipt = yield ReduxSaga.effects.cps([web3.eth, web3.eth.getTransactionReceipt], txnHash)
    while (!receipt && counter--) {
      yield ReduxSaga.delay(interval)
      receipt = yield ReduxSaga.effects.cps([web3.eth, web3.eth.getTransactionReceipt], txnHash)
    }
    if (receipt) return receipt
    throw new Error('Transaction not mined within ' + maxwait + 'minutes: ' + txid)
  }

  function deployContract(truffleContract, ...args) {
    args[args.length-1] = Object.assign({}, args[args.length-1], {
      data: truffleContract.binary
    })
    let res
    let rej
    function callback(err, myContract){
      if(err) rej(err)
      if(!myContract.address) {
        res({
          txid: myContract.transactionHash,
          getContractAddress: new Promise(function(resolve, reject) {
            res = resolve
            rej = reject
          })
        })
      } else {
        res(myContract.address)
      }
    }
    return new Promise(function(resolve, reject) {
      res = resolve
      rej = reject
      let Contract = web3.eth.contract(truffleContract.abi)
      Contract.new(...args, callback)
    })
  }

})
