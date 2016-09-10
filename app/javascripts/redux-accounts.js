
function getAccountsActions () {
  return {
    reqRemoteAccounts: () => ({ type: 'REQ_REMOTE_ACCOUNTS' }),
    reqLocalAccounts: (seed, password) => ({ type: 'REQ_LOCAL_ACCOUNTS', seed, password }),
    changeSelectedAccount: (address) => ({ type: 'CHG_SELECTED_ACCOUNT', address}),
    setGasLimit: (gasLimit) => ({ type: 'SET_GAS_LIMIT', gasLimit}),
  }
}

function getAccountsReducer () {
  const defaultState = {
    localAccounts: false,
    list: []
  }
  return function (state = defaultState, action) {
    switch (action.type) {
      case 'SET_ACCOUNTS_LIST':
        return Object.assign({}, state, {
          list: action.accounts,
          localAccounts: action.local
        })
      default:
        return state
    }
  }
}

function getSelectedAccountReducer () {
  const defaultState = {
    address: null,
    balance: '',
    gasLimit: 2000000
  }
  return function (state = defaultState, action) {
    switch (action.type) {
      case 'SET_SELECTED_ACCOUNT':
        return Object.assign({}, state, {
          address: action.address,
          balance: action.balance
        })
      case 'SET_GAS_LIMIT':
        return Object.assign({}, state, {
          gasLimit: action.gasLimit,
        })
      default:
        return state
    }
  }
}

function getSagaAccounts () {
  const $log = console
  var defaultWeb3Provider = web3.currentProvider
  var passwordProvider = function (callback) {
    var pw = prompt("Please enter password to sign your transaction", "dev_password")
    callback(null, pw)
  }
  let effects = ReduxSaga.effects
  return function* () {
    yield [
      ReduxSaga.takeLatest('REQ_REMOTE_ACCOUNTS', reqRemoteAccounts),
      ReduxSaga.takeLatest('REQ_LOCAL_ACCOUNTS', reqLocalAccounts),
      ReduxSaga.takeLatest('CHG_SELECTED_ACCOUNT', fetchAccountDetails),
    ]
  }

  function* reqRemoteAccounts() {
    try {
      let accounts = yield effects.cps(getRemoteAccounts)
      yield effects.put({type: 'SET_ACCOUNTS_LIST', accounts, local: false})
      if (accounts.length > 0) {
        yield effects.put({type: 'CHG_SELECTED_ACCOUNT', address: accounts[0]})
      }
    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_REMOTE_ACCOUNTS', error})
    }
  }

  function getRemoteAccounts(callback) {
    web3.setProvider(defaultWeb3Provider)
    web3.eth.getAccounts(callback)
  }

  function* fetchAccountDetails(action) {
    try {
      let balance = yield effects.cps([web3.eth, web3.eth.getBalance], action.address)
      yield effects.put({type: 'SET_SELECTED_ACCOUNT', address: action.address, balance})
    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_SELECTED_ACCOUNT_BALANCE', error})
    }
  }

  function* reqLocalAccounts(action) {
    try {
      let accounts = yield effects.call(setLocalAccounts, action.seed, action.password)

      yield effects.put({type: 'SET_ACCOUNTS_LIST', accounts, local: true})
      if (accounts.length > 0) {
        yield effects.put({type: 'CHG_SELECTED_ACCOUNT', address: accounts[0]})
      }
    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_LOCAL_ACCOUNTS', error})
    }
  }

  function setLocalAccounts (seed, password) {
    return new Promise((resolve, reject) => {
      lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {
        if (err) return reject(err)

        var ks = new lightwallet.keystore(seed, pwDerivedKey)
        ks.passwordProvider = passwordProvider
        var provider = new HookedWeb3Provider({
            host: web3.currentProvider.host,
            transaction_signer: ks
        });
        web3.setProvider(provider);

        // Generate the addresses out of the seed
        ks.generateNewAddress(pwDerivedKey, 5)
        resolve(ks.getAddresses())
      })
    })
  }
  
}
