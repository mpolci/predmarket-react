angular.module('predictionMarketApp').controller('controlAccountController', function ($scope, $log, appState) {
  var self = this
  angular.extend(this, {
    accounts: [],
    selected: appState.selectedAccount,
  })

  $scope.$watch(() => self.selected.address, (newValue, oldValue) => {
    // appState.selectedAccount.address = newValue
    refreshSelectedBalance()
  })

  web3.eth.getAccounts(function (err, accounts) {
    if (err) return $log.error(err)
    self.accounts = accounts
    $scope.$apply()
  })

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
