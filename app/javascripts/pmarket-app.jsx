
// window.addEventListener('load', function() {
//   angular.bootstrap(document, ['predictionMarketApp'])
// })

class PMarketApp extends React.Component {

  render() {
    const selectedMarket = null

    let txInfo = {}
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

        <TransactionInfo txInfo={txInfo}/>

        <PredictionMarketsList />

        {subview}

      </div>
    )
  }
}

let store = initStore()

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <PMarketApp/>
  </ReactRedux.Provider>
  , document.getElementById('pmarket-app')
)