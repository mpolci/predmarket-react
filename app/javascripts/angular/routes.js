angular.module('predictionMarketApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('start', {
    url: "/",
    templateUrl: 'start.html'
  })
  .state('wallet', {
    url: "/",
    templateUrl: 'start.html'
  })
})
