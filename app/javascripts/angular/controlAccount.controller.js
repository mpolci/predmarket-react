angular.module('predictionMarketApp').controller('controlAccountController', function ($scope, $log, appState, accountsService) {
  var self = this
  angular.extend(this, {
    accounts: appState.accounts,
    selected: appState.selectedAccount,
  })

  $scope.$watch(() => self.selected.address, (newValue, oldValue) => {
    // appState.selectedAccount.address = newValue
    refreshSelectedBalance()
  })

  $scope.$watch(() => self.accounts.localAccounts, (newValue, oldValue) => {
    let change
    if (newValue) {
      // Example of seed 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
      var seed = prompt('Enter your private key seed', 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle')
      // the seed is stored in memory and encrypted by this user-defined password
      var password = prompt('Enter password to encrypt the seed', 'dev_password')
      change = accountsService.setLocalAccounts(seed, password)
    } else {
      change = accountsService.setRemoteAccounts()
    }
    change.then(() => $log.info('local accounts', newValue))
  })

  // accountsService.setRemoveAccounts()
  // .then(() => $scope.$apply())

  /*********************************************************/

  function refreshSelectedBalance () {
    if (!self.selected.address) return
    web3.eth.getBalance(self.selected.address, function (err, value) {
      if (err) return $log.error(err)
      self.selected.balance = value
      $scope.$apply()
    })
  }

})
