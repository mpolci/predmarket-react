
// window.addEventListener('load', function() {
//   angular.bootstrap(document, ['predictionMarketApp'])
// })

class PMarketApp extends React.Component {

  render() {
    let subview = null;
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
}
    
ReactDOM.render(<PMarketApp/>, document.getElementById('pmarket-app'))