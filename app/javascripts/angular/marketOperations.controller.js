angular.module('predictionMarketApp').controller('marketOperationsController', function ($scope, $log, $timeout, appState, predictionMarketService) {
  var is = predictionMarketService.is
  var mktOps = appState.marketOperations
  var self = this
  angular.extend(this, {
    marketOperations: mktOps,
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

  function setShowsWithdrawPrize() {
    show.withdrawPrize = (is.yes(self.details.getVerdict) && mktOps.yesBets > 0) || (is.no(self.details.getVerdict) && mktOps.noBets > 0)
  }

  function setShows() {
    var details = self.details
    if (!details) {
      show.bid = show.respond = show.withdrawFees = show.bid = show.withdrawUnresponded = show.destroy = false
    } else {
      show.bid = !is.expiredMarket(details.expiration)
      show.respond =
        appState.selectedAccount.address === details.responder
        && is.unresponded(details.getVerdict)
        && is.expiredMarket(details.expiration)
        && !is.expiredResponseTime(details.expiration)
      show.withdrawFees =
        appState.selectedAccount.address === details.owner
        && !is.unresponded(details.getVerdict)
      show.withdrawUnresponded = is.unresponded(details.getVerdict) && is.expiredResponseTime(details.expiration),
      show.destroy =
        appState.selectedAccount.address === details.owner
        && is.expiredWithdraw(details.expiration)
      setShowsWithdrawPrize()
    }
  }

  var updateDetails = function () {
    self.details = appState.markets.marketsDetails[mktOps.selectedMarket]
    setShows()
  }

  $scope.$watch(() => mktOps.selectedMarket, (newv, oldv) => { updateDetails(); refreshBets() } )
  $scope.$watch(() => appState.selectedAccount.address, (newv, oldv) => { refreshBets(); setShows(); } )
  $scope.$watch(() => mktOps.selectedMarket && appState.markets.marketsDetails[mktOps.selectedMarket], updateDetails)

  function refreshBets() {
    return !mktOps.selectedMarket || !appState.selectedAccount.address ? null :
      predictionMarketService.getBets(mktOps.selectedMarket, appState.selectedAccount.address)
      .then(values => {
        mktOps.yesBets = values[0]
        mktOps.noBets = values[1]
        setShowsWithdrawPrize()
      })
  }

  function doBid(what, value) {
    predictionMarketService.bid(mktOps.selectedMarket, what, value)
    .then(refreshBets)
    .then(() => {
      $timeout(() => $scope.$apply())
    })
    .catch($log.error)
  }

  function doRefresh() {
    return refreshBets()
    .then(() => predictionMarketService.loadMarketData(mktOps.selectedMarket))
    .then(() => {
      $timeout(() => $scope.$apply())
    })
    .catch($log.error)
  }

  function doGiveVerdict(what) {
      predictionMarketService.giveVerdict(mktOps.selectedMarket, what)
      .then(txid => {
        $log.info('Verdict given, txid:', txid)
        doRefresh()
      })
      .catch($log.error)
  }

  function _withdraw(type) {
    predictionMarketService[type](mktOps.selectedMarket)
    .then(txid => {
      $log.info(type, 'txid:', txid)
      doRefresh()
    })
    .catch($log.error)
  }

  function doWithdrawFees() {
    _withdraw('withdrawFees')
  }

  function doWithdrawPrize() {
    _withdraw('withdrawPrize')
  }

  function doWithdrawUnresponded() {
    _withdraw('withdraw')
  }

})
