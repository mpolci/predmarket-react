angular.module('predictionMarketApp').controller('marketOperationsController', function ($scope, $log, $timeout, $ngRedux, predictionMarketService, marketOperationsActions) {
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
    show: {
      bid: false,
      respond: false,
      withdrawFees: false,
      withdrawPrize: false,
      withdrawUnresponded: false,
      destroy: false,
    },
  })
  var show = self.show

  let unsubscribe = $ngRedux.connect(state => ({
    marketOperations: state.marketOperations,
    details: state.markets.marketsDetails[state.marketOperations.selectedMarket]
  }), marketOperationsActions)(this);
  $scope.$on('$destroy', unsubscribe);

  function setShowsWithdrawPrize() {
    show.withdrawPrize = (is.yes(self.details.getVerdict) && self.marketOperations.yesBets > 0) || (is.no(self.details.getVerdict) && self.marketOperations.noBets > 0)
  }

  function setShows() {
    let details = self.details
    let selectedAccountAddress = $ngRedux.getState().selectedAccount.address
    if (!details) {
      show.bid = show.respond = show.withdrawFees = show.bid = show.withdrawUnresponded = show.destroy = false
    } else {
      show.bid = !is.expiredMarket(details.expiration)
      show.respond =
        selectedAccountAddress === details.responder
        && is.unresponded(details.getVerdict)
        && is.expiredMarket(details.expiration)
        && !is.expiredResponseTime(details.expiration)
      show.withdrawFees =
        selectedAccountAddress === details.owner
        && !is.unresponded(details.getVerdict)
        && details.feeRate > 0
      show.withdrawUnresponded = is.unresponded(details.getVerdict) && is.expiredResponseTime(details.expiration),
      show.destroy =
        selectedAccountAddress === details.owner
        && is.expiredWithdraw(details.expiration)
      setShowsWithdrawPrize()
    }
  }

  $scope.$watch(() => self.marketOperations.selectedMarket, (newv, oldv) => { setShows(); } )
  $scope.$watch(() => $ngRedux.getState().selectedAccount.address, (newv, oldv) => {
    if ($ngRedux.getState().selectedAccount.address && self.marketOperations.selectedMarket)
      refreshBets();
    setShows();
  })
  $scope.$watch(() => self.marketOperations.selectedMarket && $ngRedux.getState().markets.marketsDetails[self.marketOperations.selectedMarket], setShows)

  function refreshBets() {
    if ($ngRedux.getState().selectedAccount.address) self.reqRefreshBets()
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
