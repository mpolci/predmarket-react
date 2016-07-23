angular.module('predictionMarketApp').controller('predictionMarketsController', function ($scope, $log, $timeout, appState, predictionMarketService) {
  var self = this
  angular.extend(this, {
    availMrktAddrs: appState.markets.availMrktAddrs,
    marketsDetails: appState.markets.marketsDetails,

    selectMarket: selectMarket
  })

  predictionMarketService.retrieveMarkets()
  .then(() =>
    $timeout(() => $scope.$apply())
  ).catch($log.error)

  function selectMarket(addr) {
    appState.marketOperations.selectedMarket = addr
  }
})
