angular.module('predictionMarketApp').controller('marketOperationsController', function ($scope, $log, $timeout, $ngRedux, predictionMarketService, marketOperationsActions, marketOperationsViewActions) {
  var is = predictionMarketService.is
  var self = this
  angular.extend(this, {
    details: null,
    doBid,
    doRefresh,
    doGiveVerdict,
    doWithdrawFees,
    doWithdrawPrize,
    doWithdrawUnresponded,
  })

  let unsubscribe = $ngRedux.connect(state => ({
    marketOperations: state.marketOperations,
    details: state.markets.marketsDetails[state.marketOperations.selectedMarket],
    show: state.marketOperations.show
  }), Object.assign({}, marketOperationsActions, marketOperationsViewActions))(this);
  $scope.$on('$destroy', unsubscribe);

  function refreshBets() {
    self.reqRefreshBets()
  }

  function doBid(what, value) {
    self.reqBet(self.marketOperations.selectedMarket, what, value)
  }

  function doRefresh() {
    self.reqRefreshMarket(self.marketOperations.selectedMarket)
  }

  function doGiveVerdict(what) {
    self.reqGiveVerdict(self.marketOperations.selectedMarket, what)
  }

  function doWithdrawFees() {
    self.reqWithdrawFees(self.marketOperations.selectedMarket)
  }

  function doWithdrawPrize() {
    self.reqWithdrawPrize(self.marketOperations.selectedMarket)
  }

  function doWithdrawUnresponded() {
    self.reqWithdraw(self.marketOperations.selectedMarket)
  }

})
