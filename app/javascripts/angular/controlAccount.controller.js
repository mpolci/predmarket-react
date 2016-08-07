angular.module('predictionMarketApp').controller('controlAccountController', function ($scope, $log, $ngRedux, accountsActions, mistService) {
  var self = this
  angular.extend(this, {
    showLocalAccounts: !mistService.available,
  })

  let unsubscribe = $ngRedux.connect(state => ({
    accounts: state.accounts,
    selected: state.selectedAccount,
   }), accountsActions)(this);
  $scope.$on('$destroy', unsubscribe);


  $scope.$watch(() => self.accounts.localAccounts, (newValue, oldValue) => {
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
