angular.module('predictionMarketApp')
.factory('marketOperationsViewActions', () => ({
  reqSelectMarket: (marketAddress) => ({ type: 'REQ_SELECT_MARKET', marketAddress }),
  reqRefreshBets: (marketAddress) => ({ type: 'REQ_REFRESH_BETS' }),
}))

.factory('marketOperationsReducer', function () {
  const defaultState = {
    selectedMarket: null, // address
    yesBets: null,
    noBets: null,
    show: {
      bid: false,
      respond: false,
      withdrawFees: false,
      withdrawPrize: false,
      withdrawUnresponded: false,
      destroy: false,
    },
  }
  return function (state = defaultState, action) {
    switch (action.type) {
      case 'SET_SELECTED_MARKET':
        return Object.assign({}, state, {
          selectedMarket: action.marketAddress,
          yesBets: action.yesBets,
          noBets: action.noBets
        })
      case 'SET_MARKET_OPERATIONS_SHOWS':
        return Object.assign({}, state, {
          show: action.show
        })
      default:
        return state
    }
  }
})

.factory('sagaMarketOperationsView', function ($rootScope, $log, predictionMarketService, marketsListActions) {
  let effects = ReduxSaga.effects
  let getSelectedAccountAddress = state => state.selectedAccount.address
  let getMarketDetails = (state, marketAddress) => state.markets.marketsDetails[marketAddress]
  let getSelectedMarket = state => state.marketOperations.selectedMarket
  let is = predictionMarketService.is
  return function* () {
    yield [
      ReduxSaga.takeLatest('REQ_SELECT_MARKET', reqSelectMarket),
      ReduxSaga.takeLatest('REQ_REFRESH_BETS', reqRefreshBets),
      // ReduxSaga.takeEvery('NEW_TX_MARKET_CALL', newTxMarketCall),
      ReduxSaga.takeEvery('SET_MARKET_DETAILS', setMarketDetails),
      ReduxSaga.takeLatest('SET_SELECTED_ACCOUNT', setSelectedAccount),
    ]
  }

  function* reqSelectMarket({marketAddress}) {
    try {
      yield* refreshBets({marketAddress})
      yield* refreshShows()
    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_SELECT_MARKET', error})
    }
  }

  function* reqRefreshBets() {
    try {
      let marketAddress = yield effects.select(getSelectedMarket)
      yield* refreshBets({marketAddress})
    } catch (error) {
      $log.error(error)
      yield effects.put({type: 'ERR_REFRESH_BETS', error})
    }
  }

  function* refreshBets({marketAddress}) {
    let forAddress = yield effects.select(getSelectedAccountAddress)
    if (forAddress) {
      let details = yield effects.select(getMarketDetails, marketAddress)
      let tokens = yield [
        effects.call(AnswerToken.at(details.yes).balanceOf.call, forAddress),
        effects.call(AnswerToken.at(details.no).balanceOf.call, forAddress),
      ]
      yield effects.put({type: 'SET_SELECTED_MARKET', marketAddress, yesBets: tokens[0], noBets: tokens[1]})
    } else {
      yield effects.put({type: 'SET_SELECTED_MARKET', marketAddress, yesBets: null, noBets: null})
    }
  }

  function* refreshShows() {
    let marketAddress = yield effects.select(getSelectedMarket)
    let details = yield effects.select(getMarketDetails, marketAddress)
    let selectedAccountAddress = yield effects.select(getSelectedAccountAddress)
    let marketOperations = yield effects.select(state => state.marketOperations)
    let show = {}
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
      show.withdrawPrize =
        (is.yes(details.getVerdict) && marketOperations.yesBets > 0)
        || (is.no(details.getVerdict) && marketOperations.noBets > 0)
    }
    yield effects.put({type: 'SET_MARKET_OPERATIONS_SHOWS', show})
  }

  function* setMarketDetails({marketDetails}) {
    let selectedMarket = yield effects.select(getSelectedMarket)
    if (marketDetails.address === selectedMarket) {
      yield effects.put({type: 'REQ_REFRESH_BETS'})
      yield* refreshShows()
    }
  }

  function* setSelectedAccount() {
    let selectedMarket = yield effects.select(getSelectedMarket)
    if (selectedMarket) {
      yield effects.put({type: 'REQ_REFRESH_BETS'})
      yield* refreshShows()
    }
  }

})
