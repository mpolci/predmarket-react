
class PMarketApp extends React.Component {

  render() {

    let subview
    if (!this.props.route) {
      subview = null
    } else if (this.props.route === 'create') {
      subview = <CreateMarket />
    } else {
      subview = <Market />
    }

    return (
      <div>
        <h1>PredictionMarket</h1>

        <ControlAccountSelection />

        <TransactionInfo />

        <PredictionMarketsList
          onCreate={this.props.onCreate}
          onSelectMarket={this.props.onSelectMarket}
        />

        {subview}

      </div>
    )
  }
}

;(function () {
  const routeAction = getRouteAction()
  const marketOperationsViewActions = getMarketOperationsViewActions()

  const mapStateToProps = state => ({
    route: state.route
  })

  const mapDispatchToProps = (dispatch) => ({
    onCreate: () => dispatch(routeAction.setView('create')),
    onSelectMarket: (addr) => {
      dispatch(routeAction.setView('market'))
      dispatch(marketOperationsViewActions.reqSelectMarket(addr))
    }
  })

  PMarketApp = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(PMarketApp)

})()

window.addEventListener('load', function() {
  let store = initStore()

  store.dispatch(getAccountsActions().reqRemoteAccounts())
  store.dispatch(getMarketsListActions().reqRefreshMarkets())

  ReactDOM.render(
    <ReactRedux.Provider store={store}>
      <PMarketApp/>
    </ReactRedux.Provider>
    , document.getElementById('pmarket-app')
  )
})