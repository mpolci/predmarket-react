angular.module('predictionMarketApp').controller('predictionMarketsController', function ($scope, $log, $timeout, $state, $ngRedux, marketsListActions, marketOperationsActions, predictionMarketService) {
  var self = this
  angular.extend(this, {
    selectMarket: selectMarket
  })

  let unsubscribe = $ngRedux.connect(state => ({
    availMrktAddrs: state.markets.availMrktAddrs,
    marketsDetails: state.markets.marketsDetails,
  }), marketsListActions)(this);
  $scope.$on('$destroy', unsubscribe);

  self.reqRefreshMarkets()

  function selectMarket(addr) {
    $ngRedux.dispatch(marketOperationsActions.reqSelectMarket(addr))
    $state.go('market')
  }
})
