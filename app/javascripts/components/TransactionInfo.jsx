//
// <div className="action info" ng-controller="transactionInfoController as txInfo">
//   <h2>Status</h2>
//   <div ng-if="txInfo.lastBTx">Created transaction {{txInfo.lastBTx }}</div>
//   <div ng-if="txInfo.lastMinedTx">Transaction mined {{txInfo.lastMinedTx }}</div>
//   <div ng-if="txInfo.lastError">
//     <span className="error">Error:</span>
//     <span className="error-details">{{txInfo.lastError }}</span>
//   </div>
// </div>

class TransactionInfo extends React.Component {
  render () {
    const props = this.props
    const when = (c, node) => c ? node : null
    return (
      <div className="action info">
        <h2>Status</h2>
        {when(props.lastBTx, <div>Created transaction {props.lastBTx }</div>)}
        {when(props.lastMinedTx, <div>Transaction mined {props.lastMinedTx }</div>)}
        {when(props.lastError,
          <div>
            <span className="error">Error:</span>
            <span className="error-details">{props.lastError}</span>
          </div>
        )}
      </div>
    )
  }
}

TransactionInfo.propTypes = {
  lastBTx: React.PropTypes.string,
  lastMinedTx: React.PropTypes.string,
  lastError: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.instanceOf(Error)
  ]),
}

TransactionInfo = ReactRedux.connect(state => state.txInfo)(TransactionInfo)