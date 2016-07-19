'use strict';

function shouldFail(promise) {
  return new Promise((resolve, reject) => {
    promise
    .then(() => reject('testrpc should fail'))
    .catch(() => resolve())
  })
}

function rpc(method, arg) {
  var req = {
    jsonrpc: "2.0",
    method: method,
    id: new Date().getTime()
  };
  if (arg) req.params = arg;

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(req, (err, result) => {
      if (err) return reject(err)
      if (result && result.error) {
        return reject(new Error("RPC Error: " + (result.error.message || result.error)))
      }
      resolve(result)
    })
  })
}

// Change block time using the rpc call "evm_setTimestamp" available in the testrpc fork https://github.com/Georgi87/testrpc
web3.evm = web3.evm || {}
web3.evm.setTimestamp = function (time) {
  return rpc('evm_setTimestamp', [time])
}



contract('PredictionMarket', accounts => {
  let self = this
  let pMarket
  let yesToken
  let noToken
  let expiration
  let now
  const owner = accounts[0]
  const responder = accounts[1]
  const fromOwner = {from: owner}
  const fromResponder = {from: responder}
  const from2 = {from: accounts[2]}
  const question = "ETH price will be over 50$"
  const oneFinney = web3.toBigNumber(web3.toWei(1, 'finney'))
  const oneSzabo = web3.toBigNumber(web3.toWei(1, 'szabo'))

  beforeEach((done) => {
    now = Math.floor(Date.now()/1000)
    web3.evm.setTimestamp(now)
    .then(() => done()).catch(done)
  })

  describe('constructor', () => {
    it('should create predictionMarket', () => {
      return PredictionMarket.new(question, now + 1, responder, { from: owner, value: oneFinney })
    })
    it('should fail if initial balance is less than 1 finney', () => {
      return shouldFail(PredictionMarket.new(question, now + 1, responder, {from: owner, value: oneFinney.minus(1)}))
    })
    it('should fail if already expired', () => {
      return shouldFail(PredictionMarket.new(question, now - 1, responder, {from: owner, value: oneFinney}))
    })
    it('should initialize yes and no tokens', () => {
      return PredictionMarket.new(question, now + 1, responder, { from: owner, value: oneFinney })
      .then(contract => {pMarket = contract})
      .then(() => pMarket.yes.call())
      .then(address => assert.notEqual(address, 0))
      .then(() => pMarket.no.call())
      .then(address => assert.notEqual(address, 0))
    })
    it('should initialize question', () => {
      return PredictionMarket.new(question, now + 1, responder, { from: owner, value: oneFinney })
      .then(contract => contract.question.call())
      .then(value => assert.equal(value, question))
    })
    it('should initialize expiration', () => {
      return PredictionMarket.new(question, now + 1, responder, { from: owner, value: oneFinney })
      .then(contract => contract.expiration.call())
      .then(value => assert.equal(value.toNumber(), now + 1))
    })
    it('should initialize allocate 2 yes tokens', () => {
      return PredictionMarket.new(question, now + 1, responder, { from: owner, value: oneFinney })
      .then(contract => {pMarket = contract})
      .then(() => pMarket.yes.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 2, 'yes tokens'))
      .then(() => pMarket.no.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 2, 'no tokens'))
    })
    it('should initialize allocate 10 yes tokens', () => {
      return PredictionMarket.new(question, now + 1, responder, { from: owner, value: 5 * oneFinney })
      .then(contract => {pMarket = contract})
      .then(() => pMarket.yes.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 10, 'yes tokens'))
      .then(() => pMarket.no.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 10, 'no tokens'))
    })
  })

  describe('operations', () => {
    beforeEach(done => {
      expiration = now + 1
      PredictionMarket.new(question, expiration, responder, { from: owner, value: 5 * oneFinney })
      .then(contract => { pMarket = contract })
      .then(() => pMarket.yes.call())
      .then(address => { yesToken = AnswerToken.at(address) })
      .then(() => pMarket.no.call())
      .then(address => { noToken = AnswerToken.at(address) })
      .then(() => done()).catch(done)
    })
    // describe('xxx', () => {
    //   it('prova', (done) => {
    //     var block = web3.eth.getBlock('latest')
    //     console.log(block.timestamp);
    //     console.log(now);
    //     web3.evm.setTimestamp(now)
    //     .then(() => {
    //       var block = web3.eth.getBlock('latest')
    //       console.log(block.timestamp);
    //       done()
    //     })
    //   })
    // })

    describe.only('bid', () => {
      it('price shoult be 500 szabo', () => {
        return pMarket.getYesPrice.call()
        .then(value => assert.equal(value.toNumber(), 500 * oneSzabo))
      })
      it('price shoult be 666 szabo', () => {
        //return pMarket.bidYes({from: accounts[3], value: 5051 * oneSzabo})
        return pMarket.bidYes({from: accounts[3], value: 5051 * oneSzabo})
        .then(() => pMarket.getYesPrice.call())
        .then(value => assert.equal(value.toNumber(), 666666666666666))
      })
      it('price shoult be 750 szabo', () => {
        return pMarket.bidYes({from: accounts[3], value: 10102 * oneSzabo})
        .then(() => pMarket.getYesPrice.call())
        .then(value => assert.equal(value.toNumber(), 750 * oneSzabo))
      })
      it('should fail with 505 szabo', () => {
        return shouldFail(pMarket.bidYes({from: accounts[2], value: 505 * oneSzabo}))
      })
      it('should bid with 506 szabo', () => {
        return pMarket.bidYes({from: accounts[2], value: 506 * oneSzabo})
      })
      let failingTests = [
        { prebid:  5051, bid: 666 },    // 20 yes 10 no
        { prebid: 10102, bid: 757 },    // 30 yes 10 no
      ]
      failingTests.forEach(testCase => {
        it(`should fail with ${testCase.bid} szabo`, () => {
          return pMarket.bidYes({from: accounts[3], value: testCase.prebid * oneSzabo})
          .then(() => shouldFail(pMarket.bidYes({from: accounts[2], value: testCase.bid * oneSzabo})))
        })
      })

      let tests = [
        { prebid: 0, bid: 506, expectedTokens: 1},     // 10 yes 10 no
        { prebid: 0, bid: 1010, expectedTokens: 1},
        { prebid: 0, bid: 1011, expectedTokens: 2},
        { prebid: 5051, bid:  667, expectedTokens: 1}, // 20 yes 10 no
        { prebid: 5051, bid: 1333, expectedTokens: 1},
        { prebid: 5051, bid: 1334, expectedTokens: 2},

      ]
      tests.forEach(testCase => {
        it(`should get ${testCase.expectedTokens} tokens with ${testCase.bid} szabo`, () => {
          let prebid = testCase.prebid > 0 ? pMarket.bidYes({from: accounts[3], value: testCase.prebid * oneSzabo}) : null
          return Promise.resolve(prebid)
          .then(() => pMarket.bidYes({from: accounts[2], value: testCase.bid * oneSzabo}))
          .then(() => yesToken.balanceOf(accounts[2]))
          .then(value => assert.equal(value.toNumber(), testCase.expectedTokens))
        })
      })


    })

  })

})
