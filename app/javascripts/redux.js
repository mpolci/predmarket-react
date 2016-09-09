
function initStore() {
  let sagaMiddleware = ReduxSaga.default()
  let enhancers = [Redux.applyMiddleware(sagaMiddleware)]
  if (window.devToolsExtension) {
    enhancers.push(window.devToolsExtension())
  }
  let root = Redux.combineReducers({
    // accounts: 'accountsReducer',
    // selectedAccount: 'selectedAccountReducer',
    // markets: 'marketsReducer',
    // marketCreation: 'marketCreationReducer',
    // marketOperations: 'marketOperationsReducer',
    txInfo: getTxinfoReducer()
  })
  let store = Redux.createStore(root, Redux.compose(...enhancers))

  let sagaRoot = function* sagaRoot() {
    yield [
      // ...sagaAccounts(),
      // ...sagaMarkets(),
      // ...sagaMarketOperations(),
      // ...sagaMarketOperationsView(),
    ]
  }
  sagaMiddleware.run(sagaRoot)

  return store
}