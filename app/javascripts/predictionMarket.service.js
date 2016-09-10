'use strict'

function getPredictionMarketService() {
  if (!getPredictionMarketService.serviceInstance) {
    // ', function ($rootScope, $q, $log) {
    var $log = console
    const WEEK = 7 * 24 * 60 * 60
    getPredictionMarketService.serviceInstance = {
      transactionReceiptMined,
      deployContract,
      is: {
        yes: (verdict) => verdict == 1,
        no: (verdict) => verdict == 2,
        unresponded: (verdict) => verdict == 0,
        expiredMarket: (expiration) => (Date.now() / 1000) >= expiration.toNumber(),
        expiredResponseTime: (expiration) => (Date.now() / 1000) >= expiration.toNumber() + WEEK,
        expiredWithdraw: (expiration) => (Date.now() / 1000) >= expiration.toNumber() + 4 * WEEK,
      },
    }

    // var marketsIndex = PredictionMarketsIndex.deployed()
    $log.info('PredictionMarketsIndex address:', PredictionMarketsIndex.deployed_address)
  }

  return getPredictionMarketService.serviceInstance

  /************************************************************************************************/

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

  /**
   * Returns a promise for deploying a contract.
   * The promise is resolved with an object {txid, getContractAddress}
   * txid: the broadcasted transaction id
   * getContractAddress: a new promise that is resolved with the created contract address
   **/
  function deployContract(truffleContract, ...args) {
    args[args.length-1] = Object.assign({}, args[args.length-1], {
      data: truffleContract.binary
    })
    return new Promise(function(resolve, reject) {
      let res
      let rej = reject
      let address
      let error
      function callback(err, myContract){
        if(err) {
          if (rej) rej(err)
          else error = err
        } else {
          rej = null
          if(!myContract.address) {
            resolve({
              txid: myContract.transactionHash,
              getContractAddress: new Promise(function(resolve, reject) {
                if (address) resolve(address)
                else if (error) reject(error)
                else {
                  res = resolve
                  rej = reject
                }
              })
            })
          } else {
            if (res) res(myContract.address)
            else address = myContract.address
          }
        }
      }
      let Contract = web3.eth.contract(truffleContract.abi)
      Contract.new(...args, callback)
    })
  }

}
