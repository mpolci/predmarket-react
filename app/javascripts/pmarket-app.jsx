
class PMarketApp extends React.Component {

  render() {
    const selectedMarket = null

    let subview
    if (!selectedMarket) {
      subview = null
    } else if (selectedMarket === 'create') {
      subview = <CreateMarket />
    } else {
      subview = <Market />
    }

    return (
      <div>
        <h1>PredictionMarket</h1>

        <ControlAccountSelection />

        <TransactionInfo />

        <PredictionMarketsList />

        {subview}

      </div>
    )
  }

  _onCreate () {

  }

}

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