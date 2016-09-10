// <div className="action" ng-controller="predictionMarketsController as mc">
//   <a href ui-sref="create">Create a new prediction market</a>
//   <h2>Available predictions markets</h2>
//   <div ng-repeat="addr in mc.availMrktAddrs">
//     <a href ng-click="mc.selectMarket(addr)">{{addr}} - {{mc.marketsDetails[addr].question}}</a>
//   </div>
// </div>

class PredictionMarketsList extends React.Component {

  render() {
    const marketsDetails = this.props.marketsDetails

    const _getQuestion = addr => marketsDetails[addr] && marketsDetails[addr].question
    return (
      <div className="action">
        <a href='#' onClick={this.props.onCreate}>Create a new prediction market</a>
        <h2>Available predictions markets</h2>
        {this.props.availMrktAddrs.map(addr =>
          <div key={addr}>
            <a href='#' onClick={() => this.props.onSelectMarket(addr)}>{addr} - {_getQuestion(addr)}</a>
          </div>
        )}
      </div>
    )
  }
}

PredictionMarketsList.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  onSelectMarket: React.PropTypes.func.isRequired,
  availMrktAddrs: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
  marketsDetails: React.PropTypes.objectOf(React.PropTypes.shape({
    question: React.PropTypes.string,
  }))
}

;(function () {

  getMarketsListActions

  const mapStateToProps = state => ({
    availMrktAddrs: state.markets.availMrktAddrs,
    marketsDetails: state.markets.marketsDetails,
  })

  const marketOperationsViewActions = getMarketOperationsViewActions()

  PredictionMarketsList = ReactRedux.connect(mapStateToProps)(PredictionMarketsList)

})()
