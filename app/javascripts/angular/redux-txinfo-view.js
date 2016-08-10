angular.module('predictionMarketApp')
.factory('txinfoReducer', function () {
  const defaultState = {
    lastBTx: null,
    lastMinedTx: null,
    lastError: null,
  }
  return function (state = defaultState, action) {
    if (action.type.startsWith('ERR_')) {
      let msg
      if (!action.error) msg = 'Internal error'
      else if (typeof action.error === 'string') msg = action.error
      else if (action.error.message === 'string') msg = action.error.message
      else msg = action.error.toString()
      return Object.assign({}, state, {
        lastError: msg
      })
    } else if (action.type.startsWith('REQ_')) {
      return Object.assign({}, state, {
        lastBTx: null,
        lastMinedTx: null,
        lastError: null,
      })
    }
    switch (action.type) {
      case 'SET_BROADCASTED_TXID':
        return Object.assign({}, state, {
          lastBTx: action.txid,
          lastMinedTx: null,
          lastError: null
        })
      case 'SET_MINED_TXID':
        return Object.assign({}, state, {
          lastBTx: null,
          lastMinedTx: action.txid,
          lastError: null
        })
      default:
        return state
    }
  }
})
