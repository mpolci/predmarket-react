
function initStore() {
  let sagaMiddleware = ReduxSaga.default()
  let enhancers = [Redux.applyMiddleware(sagaMiddleware)]
  if (window.devToolsExtension) {
    enhancers.push(window.devToolsExtension())
  }
  let root = Redux.combineReducers({
    accounts: getAccountsReducer(),
    selectedAccount: getSelectedAccountReducer(),
    markets: getMarketsReducer(),
    marketCreation: getMarketCreationReducer(),
    // marketOperations: 'marketOperationsReducer',
    txInfo: getTxinfoReducer()
  })
  let store = Redux.createStore(root, Redux.compose(...enhancers))

  let sagaRoot = function* sagaRoot() {
    yield [
      ...getSagaAccounts()(),
      ...getSagaMarkets()(),
      // ...sagaMarketOperations(),
      // ...sagaMarketOperationsView(),
    ]
  }
  sagaMiddleware.run(sagaRoot)

  return store
}