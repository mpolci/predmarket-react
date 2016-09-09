// <div className="action" ng-controller="predictionMarketsController as mc">
//   <a href ui-sref="create">Create a new prediction market</a>
//   <h2>Available predictions markets</h2>
//   <div ng-repeat="addr in mc.availMrktAddrs">
//     <a href ng-click="mc.selectMarket(addr)">{{addr}} - {{mc.marketsDetails[addr].question}}</a>
//   </div>
// </div>

class PredictionMarketsList extends React.Component {
  render() {
    const availMrktAddrs = ['0x10000000000000000', '0x20000000000000000', ]
    const marketsDetails = {}

    const _getQuestion = addr => marketsDetails[addr] && marketsDetails[addr].question
    return (
      <div className="action">
        <a href='#' onClick={this.props.onCreate}>Create a new prediction market</a>
        <h2>Available predictions markets</h2>
        {availMrktAddrs.map(addr =>
          <div>
            <a href='#' onClick={() => onSelectMarket(addr)}>{addr} - {_getQuestion(addr)}</a>
          </div>
        )}
      </div>
    )
  }
}

PredictionMarketsList.propTypes = {
  onCreate: React.PropTypes.func.isRequired,
  onSelectMarket: React.PropTypes.func.isRequired,
}
