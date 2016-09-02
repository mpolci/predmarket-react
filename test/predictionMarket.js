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

web3.evm = web3.evm || {}
web3.evm.increaseTime = function (time) {
  return rpc('evm_increaseTime', [time])
}
web3.evm.mine = function (time) {
  return rpc('evm_mine', [])
}

function toFinney(bn) {
  return web3.fromWei(bn, 'finney').toNumber()
}

function getBalance(address) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, value) => {
      if (err) return reject(err)
      resolve(value)
    })
  })
}

function getGasUsed(txid) {
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionReceipt(txid, (err, value) => {
      if (err) return reject(err)
      resolve(value.gasUsed)
    })
  })
}

contract('PredictionMarket', accounts => {
  let self = this
  let pMarket
  let yesToken
  let noToken
  let now
  const MAXGAS = 1000000
  const expirationDelta = 60
  const owner = accounts[0]
  const responder = accounts[1]
  const fromOwner = {from: owner, gas: MAXGAS}
  const fromResponder = {from: responder, gas: MAXGAS}
  const from2 = {from: accounts[2], gas: MAXGAS}
  const question = "ETH price will be over 50$"
  const oneFinney = web3.toBigNumber(web3.toWei(1, 'finney'))
  const oneSzabo = web3.toBigNumber(web3.toWei(1, 'szabo'))
  const week = 7 * 24 * 60 * 60

  beforeEach((done) => {
    web3.evm.mine()
    .then(() => { now = web3.eth.getBlock('latest').timestamp })
    .then(() => done())
    .catch((err) => done('Error: ' + err))
  })

  describe('constructor', () => {
    it('should create predictionMarket', () => {
      return PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: oneFinney })
    })
    it('should fail if initial balance is less than 1 finney', () => {
      return shouldFail(PredictionMarket.new(question, now + expirationDelta, responder, 100, {from: owner, value: oneFinney.minus(1)}))
    })
    it('should fail if already expired', () => {
      return shouldFail(PredictionMarket.new(question, now - 1, responder, 100, {from: owner, value: oneFinney}))
    })
    it('should initialize yes and no tokens', () => {
      return PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: oneFinney })
      .then(contract => {pMarket = contract})
      .then(() => pMarket.yes.call())
      .then(address => assert.notEqual(address, 0))
      .then(() => pMarket.no.call())
      .then(address => assert.notEqual(address, 0))
    })
    it('should initialize question', () => {
      return PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: oneFinney })
      .then(contract => contract.question.call())
      .then(value => assert.equal(value, question))
    })
    it('should initialize expiration', () => {
      return PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: oneFinney })
      .then(contract => contract.expiration.call())
      .then(value => assert.equal(value.toNumber(), now + expirationDelta))
    })
    it('should initialize allocate 2 yes and no tokens', () => {
      return PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: oneFinney })
      .then(contract => {pMarket = contract})
      .then(() => pMarket.yes.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 2, 'yes tokens'))
      .then(() => pMarket.no.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 2, 'no tokens'))
    })
    it('should initialize allocate 10 yes and no tokens', () => {
      return PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: 5 * oneFinney })
      .then(contract => {pMarket = contract})
      .then(() => pMarket.yes.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 10, 'yes tokens'))
      .then(() => pMarket.no.call())
      .then(address => AnswerToken.at(address).totalSupply.call())
      .then(value => assert.equal(value.toNumber(), 10, 'no tokens'))
    })
    it('should have no verdict ', () => {
      return pMarket.getVerdict.call()
      .then(value => assert.equal(value, 0))
    })
    it('should have no payout ', () => {
      return pMarket.payout.call()
      .then(value => assert.equal(value, 0))
    })
  })

  describe('operations', () => {
    beforeEach(done => {
      PredictionMarket.new(question, now + expirationDelta, responder, 100, { from: owner, value: 5 * oneFinney })
      .then(contract => { pMarket = contract })
      .then(() => pMarket.yes.call())
      .then(address => { yesToken = AnswerToken.at(address) })
      .then(() => pMarket.no.call())
      .then(address => { noToken = AnswerToken.at(address) })
      .then(() => done()).catch(done)
    })

    describe('bid to yes', () => {
      it('price shoult be 500 szabo', () => {
        return pMarket.getYesPrice.call()
        .then(value => assert.equal(value.toNumber(), 500 * oneSzabo))
      })
      it('price shoult be 666 szabo', () => {
        return pMarket.bidYes({from: accounts[3], value: 5000 * oneSzabo})
        .then(() => pMarket.getYesPrice.call())
        .then(value => assert.equal(value.toNumber(), 666666666666666))
      })
      it('price shoult be 750 szabo', () => {
        return pMarket.bidYes({from: accounts[3], value: 10000 * oneSzabo})
        .then(() => pMarket.getYesPrice.call())
        .then(value => assert.equal(value.toNumber(), 750 * oneSzabo))
      })
      it('should fail with 499 szabo', () => {
        return shouldFail(pMarket.bidYes({from: accounts[2], value: 499 * oneSzabo}))
      })
      it('should bid with 500 szabo', () => {
        return pMarket.bidYes({from: accounts[2], value: 500 * oneSzabo})
      })
      let failingTests = [
        { prebid:  5000, bid: 666 },    // 20 yes 10 no
        { prebid: 10000, bid: 749 },    // 30 yes 10 no
      ]
      failingTests.forEach(testCase => {
        it(`should fail with ${testCase.bid} szabo`, () => {
          return pMarket.bidYes({from: accounts[3], value: testCase.prebid * oneSzabo})
          .then(() => shouldFail(pMarket.bidYes({from: accounts[2], value: testCase.bid * oneSzabo})))
        })
      })
      let tests = [
        { prebid: 0, bid:  500, expectedTokens: 1},      // 10 yes 10 no - price = 500 szabo
        { prebid: 0, bid:  999, expectedTokens: 1},
        { prebid: 0, bid: 1000, expectedTokens: 2},
        { prebid:  5000, bid:  667, expectedTokens: 1}, // 20 yes 10 no - price = 666666666666666 wei
        { prebid:  5000, bid: 1333, expectedTokens: 1},
        { prebid:  5000, bid: 1334, expectedTokens: 2},
        { prebid: 10000, bid:  750, expectedTokens: 1}, // 30 yes 10 no - price = 750 szabo
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
      it('should fail after expiration', () => {
        // return web3.evm.setTimestamp(expiration + 1)
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => shouldFail(pMarket.bidYes({from: accounts[2], value: oneFinney})))
      })
      it('should increase fees', () => {
        return pMarket.bidYes({from: accounts[3], value: 674 * oneSzabo})
        .then(() => pMarket.totalFees.call())
        .then(value => assert.equal(value.toNumber(), 5674 * oneSzabo / 100))
      })
    })

    describe('bid to no', () => {
      // TODO
    })

    describe('answer', () => {
      // beforeEach(done => {
      //   web3.evm.setTimestamp(expiration + 1)
      //   .then(() => done()).catch(done)
      // })
      it('should fail if not responder', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => shouldFail(pMarket.answer(true, from2)))
      })
      it('should fail before expiration', () => {
        return shouldFail(pMarket.answer(true, fromResponder))
      })
      it('should fail after response time', () => {
        return web3.evm.increaseTime(expirationDelta + week + 1)
        .then(() => shouldFail(pMarket.answer(true, fromResponder)))
      })
      it('should accept response', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(true, fromResponder))
      })
      it('should fail if try to change response', () => {
        let vertict
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(true, fromResponder))
        .then(() => shouldFail(pMarket.answer(false, fromResponder)))
      })
      it('should change verdict to 1', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(true, fromResponder))
        .then(() => pMarket.getVerdict.call())
        .then(value => assert.equal(value, 1))
      })
      it('should change verdict to 2', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(false, fromResponder))
        .then(() => pMarket.getVerdict.call())
        .then(value => assert.equal(value, 2))
      })
      it('should set payout to 495 szabo', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(false, fromResponder))
        .then(() => pMarket.payout.call())
        .then(value => assert.equal(value.toNumber(), 495 * oneSzabo))
      })
      it('should set payout to 990 szabo', () => {
        return pMarket.bidYes({from: accounts[2], value: 5 * oneFinney })
        .then(() => web3.evm.increaseTime(expirationDelta + 1))
        .then(() => pMarket.answer(false, fromResponder))
        .then(() => pMarket.payout.call())
        .then(value => assert.equal(value.toNumber(), 990 * oneSzabo))
      })
    }),

    describe('totalFees', () => {
      let expectedFees = 166666666666600
      beforeEach(done => {
        Promise.resolve()
        .then(() => pMarket.bidYes({from: accounts[2], value: 5 * oneFinney}))   // 10 yes tokens -> 20 total supply
        .then(() => pMarket.bidNo({from: accounts[3], value: 6666666666666660}))  // 20 no tokens -> 30 tatal supply
        .then(() => done()).catch(done)
      })

      it('should return X', () => {
        return pMarket.totalFees.call()
        .then(value => assert.equal(value.toNumber(), expectedFees))
      })
      it('should return X even after a prize withdrawal', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(false, fromResponder))
        .then(() => pMarket.withdrawPrize({from: accounts[3]}))
        .then(() => pMarket.totalFees.call())
        .then(value => assert.equal(value.toNumber(), expectedFees))
      })
      it('should return X even after the fee withdrawal', () => {
        return web3.evm.increaseTime(expirationDelta + 1)
        .then(() => pMarket.answer(false, fromResponder))
        .then(() => pMarket.withdrawFees({from: accounts[0]}))
        .then(() => pMarket.totalFees.call())
        .then(value => assert.equal(value.toNumber(), expectedFees))
      })
    })

    describe('withdrawals', () => {
      let balance = []
      let bids = []
      let pmBalance
      let totalFees
      function collectData() {
        function collectBids(idx) {
          return Promise.all([
            yesToken.balanceOf(accounts[idx]),
            noToken.balanceOf(accounts[idx])
          ]).then(values => { bids[idx] = values[0].add(values[1]) })
        }
        return Promise.all([
          collectBids(2),
          collectBids(3),
          collectBids(4),
        ])
        .then(() => pMarket.totalFees.call())
        .then(fees => totalFees = fees)
        .then(() => pmBalance = web3.eth.getBalance(pMarket.address))
        // .then(() => getBalance(pMarket.address))
        // .then(value => pmBalance = value)
        .then(() => Promise.all(
          Array.from({length: 5}, (v, i) => {
            balance[i] = web3.eth.getBalance(accounts[i])
          })
        ))
      }

      describe('prize & fees', () => {
        beforeEach(done => {
          Promise.resolve()
          .then(() => pMarket.bidYes({from: accounts[2], value: 5 * oneFinney}))   // 10 yes tokens -> 20 total supply
          .then(() => pMarket.bidNo({from: accounts[3], value: 6666666666666660}))  // 20 no tokens -> 30 tatal supply
          // contract balance: 16666666666666660 (16 finney)
          // .then(() => pMarket.bidYes({from: accounts[2], value: 995 * oneFinney}))   // 1990 yes tokens -> 2000 total supply
          // .then(() => pMarket.bidNo({from: accounts[3], value: 14875621890550000}))  // 2990 no tokens -> 3000 tatal supply

          // .then(() => pMarket.prizePool.call()).then(value => console.log(value.toNumber()))
          // .then(() => yesToken.totalSupply.call()).then(value => console.log(value.toNumber()))
          // .then(() => noToken.totalSupply.call()).then(value => console.log(value.toNumber()))
          // .then(() => pMarket.getYesPrice.call()).then(value => console.log(value.toNumber()))
          // .then(() => pMarket.getNoPrice.call()).then(value => console.log(value.toNumber()))

          .then(() => web3.evm.increaseTime(expirationDelta + 1))
          .then(() => web3.evm.mine())
          .then(() => collectData())
          .then(() => done()).catch(done)
        })
        describe('withdrawPrize()', () => {
          it('should fail if no verdict', () => {
            return shouldFail(pMarket.withdrawPrize(from2))
          })
          it('should fail if no bids', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => shouldFail(pMarket.withdrawPrize({from: accounts[4]})))
          })
          it('should fail if no winning bids', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => shouldFail(pMarket.withdrawPrize({from: accounts[3]})))
          })
          it('should send X if winner', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => pMarket.withdrawPrize({from: accounts[2]}))
            .then(txid => {
              let actualBalance = web3.eth.getBalance(accounts[2])
              let gasUsed = web3.eth.getTransactionReceipt(txid).gasUsed
              let gasPrice = web3.eth.getTransaction(txid).gasPrice
              let payedForGas = gasPrice.mul(gasUsed)
              assert.notEqual(gasUsed, MAXGAS, 'Out of gas')

              let transfered = actualBalance.minus(balance[2]).plus(payedForGas).toNumber()
              //let expected = '999703231343285800'   // pmBalance.minus(totalFees).div(2000).mul(1990).toNumber() don't have the same approximation
              let expected = '8250000000000030'
              assert.equal(transfered, expected)
            })
          })
          it('should not send ethers two times', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => pMarket.withdrawPrize({from: accounts[2]}))
            .then(() => shouldFail(pMarket.withdrawPrize({from: accounts[2]})))
          })
          it.skip('should fail if send fails', () => {
            // TODO
          })
        })

        describe('withdrawFees()', () => {
          it('should fail if no verdict', () => {
            return shouldFail(pMarket.withdrawFees(fromOwner))
          })
          it('should fail if not owner', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => shouldFail(pMarket.withdrawFees({from: accounts[4]})))
          })
          it('should decrease contract balance', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => pMarket.withdrawFees(fromOwner))
            .then(txid => {
              let delta = pmBalance.minus(web3.eth.getBalance(pMarket.address))
              assert.equal(delta.toString(), totalFees.toString())
            })
          })
          it('should send fees', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => pMarket.withdrawFees(fromOwner))
            .then(txid => {
              let actualBalance = web3.eth.getBalance(accounts[0])
              let gasUsed = web3.eth.getTransactionReceipt(txid).gasUsed
              let gasPrice = web3.eth.getTransaction(txid).gasPrice
              let payedForGas = gasPrice.mul(gasUsed)
              assert.notEqual(gasUsed, MAXGAS, 'Out of gas')
              let transfered = actualBalance.minus(balance[0]).plus(payedForGas).toString()
              assert.equal(transfered, totalFees.toString())
            })
          })
          it('should not send fees two times', () => {
            return pMarket.answer(true, fromResponder)
            .then(() => pMarket.withdrawFees(fromOwner))
            .then(() => shouldFail(pMarket.withdrawFees(fromOwner)))
          })
          it('should send correct fees even after a prize withdrawal', () => {
            let gas
            return pMarket.answer(true, fromResponder)
            .then(() => pMarket.withdrawPrize({from: accounts[2]}))
            .then(() => pMarket.withdrawFees(fromOwner))
            .then(txid => {
              let actualBalance = web3.eth.getBalance(accounts[0])
              let gasUsed = web3.eth.getTransactionReceipt(txid).gasUsed
              let gasPrice = web3.eth.getTransaction(txid).gasPrice
              let payedForGas = gasPrice.mul(gasUsed)
              assert.notEqual(gasUsed, MAXGAS, 'Out of gas')

              let transfered = actualBalance.minus(balance[0]).plus(payedForGas).toNumber()
              assert.equal(transfered, totalFees.toNumber())
            })
          })
          it.skip('should fail if send fails', () => {
            // TODO
          })
        })

      })

      describe('withdraw()', () => {
        let expectedPayout
        beforeEach(done => {
          // add new 20 bids to the already existing 30 bids
          Promise.resolve()
          .then(() => pMarket.bidYes({from: accounts[2], value: 5 * oneFinney}))   // 10 yes tokens -> 20 total supply
          .then(() => pMarket.bidNo({from: accounts[3], value: 6666666666666660}))  // 20 no tokens -> 30 tatal supply
          .then(() => pMarket.bidYes({from: accounts[4], value: 4 * oneFinney}))   // 10 yes tokens -> 30 total supply
          .then(() => pMarket.bidNo({from: accounts[4], value: 5 * oneFinney}))    // 10 no tokens -> 30 total supply
          .then(() => collectData())
          .then(() => { expectedPayout = pmBalance.div(50).trunc() })
          .then(() => web3.evm.increaseTime(expirationDelta + 1))
          .then(() => done()).catch(done)
        })
        it('should fail if there is a verdict', () => {
          return pMarket.answer(true, fromResponder)
          .then(() => shouldFail(pMarket.withdraw(from2)))
        })
        it('should fail before time limit for responder', () => {
          return shouldFail(pMarket.withdraw(from2))
        })
        it('should success after time limit for responder', () => {
          return web3.evm.increaseTime(week + 1)
          .then(() => pMarket.withdraw(from2))
        })
        it('should fail if no bids', () => {
          return web3.evm.increaseTime(week + 1)
          .then(() => shouldFail(pMarket.withdraw({from: accounts[5]})))
        })
        it('owner could not withdraw', () => {
          return web3.evm.increaseTime(week + 1)
          .then(() => shouldFail(pMarket.withdraw(fromOwner)))
        })
        it('should set payout', () => {
          return web3.evm.increaseTime(week + 1)
          .then(() => pMarket.withdraw(from2))
          .then(() => pMarket.payout.call())
          .then(value => assert.equal(value.toNumber(), expectedPayout.toNumber()))
        })
        it('should send 10 times the payout', () => {
          return web3.evm.increaseTime(week + 1)
          .then(() => pMarket.withdraw(from2))
          .then(txid => {
            let actualBalance = web3.eth.getBalance(accounts[2])
            let gasUsed = web3.eth.getTransactionReceipt(txid).gasUsed
            let gasPrice = web3.eth.getTransaction(txid).gasPrice
            assert.notEqual(gasUsed, MAXGAS, 'Out of gas')
            let transfered = actualBalance.minus(balance[2]).plus(gasPrice.mul(gasUsed)).toNumber()
            let expected = expectedPayout.mul(10).toNumber()
            assert.equal(transfered, expected)
          })
        })
        it('should send payout for both yes and no tokens', () => {
          let gas
          return web3.evm.increaseTime(week + 1)
          .then(() => pMarket.withdraw({from: accounts[4]}))
          .then(txid => {
            let actualBalance = web3.eth.getBalance(accounts[4])
            let gasUsed = web3.eth.getTransactionReceipt(txid).gasUsed
            let gasPrice = web3.eth.getTransaction(txid).gasPrice
            assert.notEqual(gasUsed, MAXGAS, 'Out of gas')
            let transfered = actualBalance.minus(balance[4]).plus(gasPrice.mul(gasUsed)).toNumber()
            let expected = expectedPayout.mul(20).toNumber()
            assert.equal(transfered, expected)
          })
        })
        it('should not send ethers two times', () => {
          return web3.evm.increaseTime(week + 1)
          .then(() => pMarket.withdraw(from2))
          .then(() => shouldFail(pMarket.withdraw(from2)))
        })
        it.skip('should fail if send fails', () => {
          // TODO
        })
      })
    })
  })

})
