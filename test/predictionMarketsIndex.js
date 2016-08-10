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
    console.log('PredictionMarketsIndex address', index.address)
  })

  // WARNING! interdependent tests on singleton contract

  it('simulation should add first address', () => {
    return index.addMarket.call(accounts[1])
    .then(value => assert.equal(value, true))
  })
  it('should add first address', () => {
    return index.addMarket(accounts[1], from0)
    // .then(value => assert.deepEqual(value, false))
  })
  it('simulation should not add first address', () => {
    return index.addMarket.call(accounts[1])
    .then(value => assert.equal(value, false))
  })
  it('raw array should contain first address ', () => {
    return index.getAvailableMarketsRawArray.call()
    .then(value => assert.deepEqual(value, [accounts[1]]))
  })
  it('simulation should add second address', () => {
    return index.addMarket.call(accounts[2])
    .then(value => assert.equal(value, true))
  })
  it('should add second address', () => {
    return index.addMarket(accounts[2], from0)
    // .then(value => assert.deepEqual(value, false))
  })
  it('simulation should not add second address', () => {
    return index.addMarket.call(accounts[2])
    .then(value => assert.equal(value, false))
  })
  // TODO: more tests

})
