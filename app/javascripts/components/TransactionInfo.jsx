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
    const txInfo = this.props.txInfo
    const when = (c, node) => c ? node : null
    return (
      <div className="action info">
        <h2>Status</h2>
        {when(txInfo.lastBTx, <div>Created transaction {txInfo.lastBTx }</div>)}
        {when(txInfo.lastMinedTx, <div>Transaction mined {txInfo.lastMinedTx }</div>)}
        {when(txInfo.lastError,
          <div>
            <span className="error">Error:</span>
            <span className="error-details">{txInfo.lastError }</span>
          </div>
        )}
      </div>
    )
  }
}

TransactionInfo.propTypes = {
  txInfo: React.PropTypes.object.isRequired,
}
