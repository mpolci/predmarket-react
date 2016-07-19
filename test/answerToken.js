'use strict';

function shouldFail(promise) {
  return new Promise((resolve, reject) => {
    promise
    .then(() => reject('testrpc should fail'))
    .catch(() => resolve())
  })
}

contract('AnswerToken', accounts => {
  let token
  const fromCreator = {from: accounts[0]}
  const from1 = {from: accounts[1]}
  const from2 = {from: accounts[2]}
  beforeEach(done => {
    AnswerToken.new(1, fromCreator)
    .then(contract => { token = contract })
    .then(() => done())
    .catch(done)
  })

  describe('constructor', () => {
    it('should init totalSupply', () => {
      return token.totalSupply.call()
      .then(value => assert.equal(value, 1))
    })
    it('creator should not have balance', () => {
      return token.balanceOf.call(accounts[0])
      .then(value => assert.equal(value, 0))
    })
    it('account 1 should not have balance', () => {
      return token.balanceOf.call(accounts[1])
      .then(value => assert.equal(value, 0))
    })
  })

  describe('.assignTo()', () => {
    it('should fail if not owner', () => {
      return shouldFail(token.assignTo(accounts[1], 10, {from: accounts[2]}))
    })
    it('should assign 10 token to account 1', () => {
      return token.assignTo(accounts[1], 10, fromCreator)
      .then(() => token.balanceOf.call(accounts[1]))
      .then(value => assert.equal(value, 10))
    })
    it('creator should not have balance', () => {
      return token.assignTo(accounts[1], 10, fromCreator)
      .then(() => token.balanceOf.call(accounts[0]))
      .then(value => assert.equal(value, 0))
    })
    it('should increment total supply', () => {
      return token.assignTo(accounts[1], 10, fromCreator)
      .then(() => token.totalSupply.call())
      .then(value => assert.equal(value, 11))
    })
  })

  describe('.transfer()', () => {
    beforeEach(done => {
      token.assignTo(accounts[1], 10, fromCreator)
      .then(() => done())
      .catch(done)
    })
    it('should fail if transfer 0', () => {
      return shouldFail(token.transfer(accounts[2], 0, from1))
    })
    it('should fail if transfer more than balance', () => {
      return shouldFail(token.transfer(accounts[2], 11, from1))
    })
    it('should assign 6 token to account 2', () => {
      return token.transfer(accounts[2], 6, from1)
      .then(() => token.balanceOf.call(accounts[2]))
      .then(value => assert.equal(value, 6))
    })
    it('should leave 4 token to account 1', () => {
      return token.transfer(accounts[2], 6, from1)
      .then(() => token.balanceOf.call(accounts[1]))
      .then(value => assert.equal(value, 4))
    })
    it('should increment tokens to account 2', () => {
      return token.assignTo(accounts[2], 10, fromCreator)
      .then(() => token.transfer(accounts[2], 6, from1))
      .then(() => token.balanceOf.call(accounts[2]))
      .then(value => assert.equal(value, 16))
    })
  })

  describe('.takeAway()', () => {
    let startingSupply
    beforeEach(done => {
      token.assignTo(accounts[1], 10, fromCreator)
      .then(() => token.totalSupply.call())
      .then(value => { startingSupply = value })
      .then(() => done())
      .catch(done)
    })
    it('should fail if not owner', () => {
      return shouldFail(token.takeAway(accounts[1], from2))
    })
    it('should set to zero account 1 balance', () => {
      return token.takeAway(accounts[1], fromCreator)
      .then(() => token.balanceOf.call(accounts[1]))
      .then(value => assert.equal(value, 0))
    })
    it('should decrement total supply', () => {
      return token.takeAway(accounts[1], fromCreator)
      .then(() => token.totalSupply.call())
      .then(value => assert.equal(value, startingSupply - 10))
    })
  })

})
