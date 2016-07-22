angular.module('predictionMarketApp').controller('predictionMarketsController', function ($scope, $log, $timeout, appState, predictionMarketService) {
  var self = this
  angular.extend(this, {
    markets: appState.markets,
  })

  predictionMarketService.retrieveMarkets()
  .then(() =>
    $timeout(() => $scope.$apply())
  ).catch($log.error)


})
