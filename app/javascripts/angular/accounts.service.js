angular.module('predictionMarketApp').service('accountsService', function ($q, $log, appState) {
  angular.extend(this, {
    setLocalAccounts: setLocalAccounts,
    setRemoteAccounts: setRemoteAccounts,
  })

  var defaultWeb3Provider = web3.currentProvider
  var passwordProvider = function (callback) {
    var pw = prompt("Please enter password to sign your transaction", "dev_password")
    callback(null, pw)
  }

  setRemoteAccounts().finally()

/*************************************************************/

  function setRemoteAccounts (seed, password) {
    web3.setProvider(defaultWeb3Provider)
    return $q(function (resolve, reject) {
      web3.eth.getAccounts(function (err, accounts) {
        if (err) return reject(err)
        appState.accounts.list = accounts
        appState.selectedAccount.address = accounts[0]
        appState.accounts.localAccounts = false
        resolve()
      })
    })
  }

  function setLocalAccounts (seed, password) {
    return $q(function (resolve, reject) {
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
        var accounts = appState.accounts.list = ks.getAddresses()
        appState.selectedAccount.address = accounts[0]
        var account = "0x" + accounts[0]
        $log.info("Your local account is " + account)
        appState.accounts.localAccounts = true
        resolve()
      })
    })
  }

})
