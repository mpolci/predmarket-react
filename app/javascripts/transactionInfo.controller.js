angular.module('predictionMarketApp').controller('transactionInfoController', function ($scope, $log, $ngRedux) {
  // var self = this
  // angular.extend(this, {
  // })

  let unsubscribe = $ngRedux.connect(state => state.txInfo)(this);
  $scope.$on('$destroy', unsubscribe);

})
