angular.module('predictionMarketApp').controller('controlAccountController', function ($scope, $log, $ngRedux, accountsActions, mistService) {
  var self = this
  angular.extend(this, {
    showLocalAccounts: !mistService.available,
  })

  let unsubscribe = $ngRedux.connect(state => ({
    localAccounts: state.accounts.localAccounts,
    accountsList: state.accounts.list,
    selectedAddress: state.selectedAccount.address,
    selected: state.selectedAccount,
   }), accountsActions)(this);
  $scope.$on('$destroy', unsubscribe);


  $scope.$watch(() => self.localAccounts, (newValue, oldValue) => {
    if (newValue) {
      // Example of seed 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
      var seed = prompt('Enter your private key seed', 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle')
      // the seed is stored in memory and encrypted by this user-defined password
      var password = prompt('Enter password to encrypt the seed', 'dev_password')
      self.reqLocalAccounts(seed, password)
    } else {
      self.reqRemoteAccounts()
    }
  })

})
