angular.module('predictionMarketApp').controller('createMarketController', function ($scope, $timeout, $log, $ngRedux, marketCreationActions) {
  var self = this
  angular.extend(this, {
    doCreate: doCreate,
    doPublish: doPublish,
  })

  // TODO: the marketCreate state object is not useful. Think how to use it or remove it.

  let unsubscribe = $ngRedux.connect(state => ({
    marketCreation: angular.copy(state.marketCreation),
  }), marketCreationActions)(this);
  $scope.$on('$destroy', unsubscribe);

  $log.debug('createMarketController initialization')
  web3.eth.getCoinbase(function (coinbase) {
    self.chgMarketCreationArgs({
      question: 'prova',
      expirationTime: Math.floor(Date.now() / 1000) + 60,
      responder: coinbase,
      feeRate: 100,
      initialPrize: 1000000000000000000,
    })
  })
  
  function doCreate() {
    self.reqNewMarket(self.marketCreation)
  }

  function doPublish() {
    self.reqPublish(self.marketCreation.created)
  }

})
