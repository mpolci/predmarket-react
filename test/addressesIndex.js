'use strict'

contract('AddressesIndex', accounts => {
  let index
  const from0 = {from: accounts[0]}
  const from1 = {from: accounts[1]}
  before(() => {
    index = AddressesIndex.deployed()
  })

  // WARNING! interdependent tests on singleton contract

  it('should add first address', () => {
    return index.add(accounts[1], from0)
  })
  it('should get first address', () => {
    return index.get.call(from0)
    .then(values => assert.deepEqual(values, [ accounts[1] ]))
  })
  it('should add second address', () => {
    return index.add(accounts[2], from0)
  })
  it('should get first and second addresses', () => {
    return index.get.call(from0)
    .then(values => assert.deepEqual(values, [ accounts[1], accounts[2] ]))
  })
  it('should add first address on account 1', () => {
    return index.add(accounts[2], from1)
  })
  it('should get first address on account 1', () => {
    return index.get.call(from1)
    .then(values => assert.deepEqual(values, [ accounts[2] ]))
  })
  it('should get first and second addresses one more time', () => {
    return index.get.call(from0)
    .then(values => assert.deepEqual(values, [ accounts[1], accounts[2] ]))
  })
})
