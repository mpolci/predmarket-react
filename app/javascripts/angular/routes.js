angular.module('predictionMarketApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('create', {
    templateUrl: 'views/create.html'
  })
  .state('market', {
    templateUrl: 'views/market.html'
  })
})
