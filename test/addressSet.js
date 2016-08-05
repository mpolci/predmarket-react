'use strict'

contract('AddressSet library', accounts => {
  let set
  const from0 = {from: accounts[0], gas: 4000000}
  const from1 = {from: accounts[1], gas: 4000000}
  before(done => {
    AddressSetTest.new(from0)
    .then(contract => {
      set = contract
      done()
    })
    // set = AddressSetTest.deployed()
    // done()
  })

  let waitTx = function (txid) {
    return new Promise(function (resolve, reject) {
      let gas = web3.eth.getTransaction(txid).gas
      let counter = 20
      ;(function checkMined() {
        let r = web3.eth.getTransactionReceipt(txid)
        if (r) {
          if (r.gasUsed < gas) resolve(txid)
          else reject('All gas used (' + gas + '): ' + r.gasUsed + ' gas units consumed by transaction ' + txid)
        } else if (counter--) setTimeout(checkMined, 6)
        else reject('Transaction not mined within 2 minutes: ' + txid)
      })()
    })
  }

  // WARNING! interdependent tests on singleton contract

  it('should not contain first address', () => {
    return set.contains.call(accounts[1])
    .then(value => assert.deepEqual(value, false))
  })
  it('should simulate add first address', () => {
    return set.insert.call(accounts[1], from0)
    .then(result => assert.equal(result.toNumber(), 2))
  })
  it('should add first address', () => {
    return set.insert(accounts[1], from0)
    .then(waitTx)
  })
  it('should contain first address', () => {
    return set.contains.call(accounts[1])
    .then(value => assert.equal(value, true))
  })
  it('should add second address', () => {
    return set.insert(accounts[2], from1)
    .then(waitTx)
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
    .then(waitTx)
  })
  it('should remove first address', () => {
    return set.remove(accounts[1], from1)
    .then(waitTx)
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
