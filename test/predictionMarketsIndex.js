'use strict';

function shouldFail(promise) {
  return new Promise((resolve, reject) => {
    promise
    .then(() => reject('testrpc should fail'))
    .catch(() => resolve())
  })
}

contract('PredictionMarketsIndex', accounts => {
  let index
  const from0 = {from: accounts[0]}
  const from1 = {from: accounts[1]}
  before(() => {
    index = PredictionMarketsIndex.deployed()
  })

  // WARNING! interdependent tests on singleton contract

  it('should add first address', () => {
    return index.addMarket(accounts[1], from0)
    // .then(value => assert.deepEqual(value, false))
  })
  it('should contain first address', () => {
    return index.addMarket.call(accounts[1])
    .then(value => assert.equal(value, true))
  })
  it('raw array should contain first address ', () => {
    return index.getAvailableMarketsRawArray.call()
    .then(value => assert.deepEqual(value, [accounts[1]]))
  })
  it('should not contain second address', () => {
    return index.addMarket.call(accounts[2])
    .then(value => assert.equal(value, false))
  })

  // TODO: more tests

})
