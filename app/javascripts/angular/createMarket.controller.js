angular.module('predictionMarketApp').controller('createMarketController', function ($scope, $timeout, $log, appState, predictionMarketService) {
  var self = this
  angular.extend(this, {
    marketCreation: appState.marketCreation,

    doCreate: doCreate,
    doPublish: doPublish,
  })
  var marketCreation=self.marketCreation
  $log.debug('createMarketController initialization')
  marketCreation.question = 'prova'
  marketCreation.expirationTime = 1469295702
  marketCreation.responder = '0xf30c3ab7075925e5d11e066c3b91894ad769f4c6'
  marketCreation.feeRate = 100
  marketCreation.initialPrize = 1000000000000000000

  function doCreate() {
    predictionMarketService.createMarket(marketCreation.question, marketCreation.expirationTime, marketCreation.responder, marketCreation.feeRate, marketCreation.initialPrize)
    .then(() =>
      $timeout(() => $scope.$apply())
    ).catch($log.error)
  }

  function doPublish() {
    predictionMarketService.publishMarket()
    .then(() =>
      $timeout(() => $scope.$apply())
    ).catch($log.error)
  }

})
