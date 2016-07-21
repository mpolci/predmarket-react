'use strict'

contract('AddressSet library', accounts => {
  let set
  const from0 = {from: accounts[0]}
  const from1 = {from: accounts[1]}
  before(done => {
    AddressSetTest.new(from0)
    .then(contract => {
      set = contract
      done()
    })
  })

  // WARNING! interdependent tests on singleton contract

  it('should not contain first address', () => {
    return set.contains.call(accounts[1])
    .then(value => assert.deepEqual(value, false))
  })
  it('should add first address', () => {
    return set.insert(accounts[1], from0)
  })
  it('should contain first address', () => {
    return set.contains.call(accounts[1])
    .then(value => assert.deepEqual(value, true))
  })
  it('should add second address', () => {
    return set.insert(accounts[2], from1)
  })
  it('should iterate 2 addresses', () => {
    let idx;
    return set.iterate_start.call()
    .then(i => {idx = i})
    .then(() => set.iterate_valid.call(idx)).then(valid => assert.equal(valid, true))
    .then(() => set.iterate_get.call(idx))
    .then(value => assert.equal(value, accounts[1]))
    .then(() => set.iterate_advance.call(idx))
    .then(i => idx = i)
    .then(() => set.iterate_valid.call(idx)).then(valid => assert.equal(valid, true))
    .then(() => set.iterate_get.call(idx))
    .then(value => assert.equal(value, accounts[2]))
    .then(() => set.iterate_advance.call(idx))
    .then(i => set.iterate_valid.call(i)).then(valid => assert.equal(valid, false))
  })
  it('should add third address', () => {
    return set.insert(accounts[3], from1)
  })
  it('should remove first address', () => {
    return set.remove(accounts[1], from1)
    .then(() => set.iterate_get.call(0))
    .then(value => assert.equal(value, 0))
  })
  it('should iterate second and third addresses', () => {
    let idx;
    return set.iterate_start.call()
    .then(i => {idx = i})
    .then(() => set.iterate_valid.call(idx)).then(valid => assert.equal(valid, true))
    .then(() => set.iterate_get.call(idx))
    .then(value => assert.equal(value, accounts[2]))
    .then(() => set.iterate_advance.call(idx))
    .then(i => idx = i)
    .then(() => set.iterate_valid.call(idx)).then(valid => assert.equal(valid, true))
    .then(() => set.iterate_get.call(idx))
    .then(value => assert.equal(value, accounts[3]))
    .then(() => set.iterate_advance.call(idx))
    .then(i => set.iterate_valid.call(i)).then(valid => assert.equal(valid, false))
  })
})
