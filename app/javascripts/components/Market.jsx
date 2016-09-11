  //
  // <div className="action" ng-controller="marketOperationsController as opsc" ng-show="opsc.marketOperations.selectedMarket">
  //   <h2>Prediction market details</h2>
  //   <div>Address: { opsc.marketOperations.selectedMarket }</div>
  //   <div>Question: { opsc.details.question }</div>
  //   <div>Expiration: { opsc.details.expiration | ethereumTimestamp | date:'medium' }</div>
  //   <div ng-repeat="field in ['responder', 'owner', 'yes', 'no']">
  //     <div>{field}: { opsc.details[field] }</div>
  //   </div>
  //   <div ng-repeat="field in ['payout', 'getYesPrice', 'getNoPrice', 'prizePool', 'totalFees']">
  //     <div>{field}: { opsc.details[field] | unitEther | num } eth</div>
  //   </div>
  //   <div>Fees rate: { opsc.details.feeRate | marketFeeRate } %</div>
  //   <div ng-repeat="field in ['yesTotalBids', 'noTotalBids']">
  //     <div>{field}: { opsc.details[field] | num }</div>
  //   </div>
  //   <div>Verdict: { opsc.details.getVerdict | verdict }</div>
  //
  //   <!-- <div ng-repeat="(field, value) in opsc.details">{field}: { value }</div> -->
  //   <div>Your bets to yes: { opsc.marketOperations.yesBets | num }</div>
  //   <div>Your bets to no: { opsc.marketOperations.noBets | num }</div>
  //
  //   <div className="action" ng-show="opsc.show.bid">
  //     <h3>Make a bet</h3>
  //     <label>Amount (eth):
  //       <input name="amount" type="number" ng-model="_amountInput" required unit-ether>
  //     </label>
  //     <button ng-click="opsc.doBid('yes', _amountInput)">Bet on yes</button>
  //     <button ng-click="opsc.doBid('no', _amountInput)">Bet on no</button>
  //   </div>
  //
  //   <div className="action" ng-show="opsc.show.respond">
  //     <h3>Give a verdict</h3>
  //     <div>{ opsc.details.question }</div>
  //     <button ng-click="opsc.doGiveVerdict('yes')">yes</button>
  //     <button ng-click="opsc.doGiveVerdict('yes')">no</button>
  //   </div>
  //
  //   <div className="action" ng-show="opsc.show.withdrawFees">
  //     <h3>You are the owner of this prediction market</h3>
  //     <button ng-click="opsc.doWithdrawFees()">Withdraw fees</button>
  //   </div>
  //
  //   <div className="action" ng-show="opsc.show.withdrawPrize">
  //     <h3>Withdraw your prize</h3>
  //     <button ng-click="opsc.doWithdrawPrize()">Withdraw prize</button>
  //   </div>
  //
  //   <div className="action" ng-show="opsc.show.withdrawUnresponded">
  //     <h3>This market din't receive a response, take back you money</h3>
  //     <button ng-click="opsc.doWithdrawUnresponded()">withdraw</button>
  //   </div>
  //
  //
  // </div>
  //

class Market extends React.Component {
  render() {
    const props = this.props
    if (!props.marketOperations.selectedMarket) {
      console.error('No selected market')
      return null
    }
    const mktAddr = props.marketOperations.selectedMarket
    const expiration = Filters.ethereumTimestamp.toView(props.details.expiration) 
    const show = props.marketOperations.show 
    const _ether = bn => Filters.num.toView(Filters.unitEther.toView(bn))
    const _num = Filters.num.toView
    const _feeRate = Filters.marketFeeRate.toView
    const _verdict = Filters.verdict.toView
    const _time = timestamp => Filters.ethereumTimestamp.toView(timestamp).toISOString().slice(0,-5)
    return (
      <div className="action" >
        <h2>Prediction market details</h2>
        <div>Address: { mktAddr }</div>
        <div>Question: { props.details.question }</div>
        <div>Expiration: { _time(props.details.expiration) }</div>
        {['responder', 'owner', 'yes', 'no'].map(field =>
          <div>{field}: { props.details[field] }</div>
        )}
        {['payout', 'getYesPrice', 'getNoPrice', 'prizePool', 'totalFees'].map(field =>
          <div>{field}: { _ether(props.details[field]) } eth</div>
        )}
        <div>Fees rate: { _feeRate(props.details.feeRate) } %</div>
        {['yesTotalBids', 'noTotalBids'].map(field =>
          <div>{field}: { _num(props.details[field]) }</div>
        )}
        <div>Verdict: { _verdict(props.details.getVerdict) }</div>

        <div>Your bets to yes: { _num(props.marketOperations.yesBets) }</div>
        <div>Your bets to no: { _num(props.marketOperations.noBets) }</div>

        <DoubleAction when={show.bid}
                      onButtonClick={(what) => props.reqBet(mktAddr, what, Filters.unitEther.fromView(this.refs.amountInput.value))}>
          <h3>Make a bet</h3>
          <label>Amount (eth):
            <input type="number" ref="amountInput" />
          </label>
        </DoubleAction>

        <DoubleAction when={show.respond}
                      onButtonClick={(what) => props.reqGiveVerdict(mktAddr, what)}>
          <h3>Give a verdict</h3>
          <div>{ props.details.question }</div>
        </DoubleAction>

        <SingleAction when={show.withdrawFees}
                      title="You are the owner of this prediction market"
                      button="Withdraw fees"
                      onButtonClick={() => props.reqWithdrawFees(mktAddr)}
        />
        <SingleAction when={show.withdrawUnresponded}
                      title="Withdraw your prize"
                      button="Withdraw prize"
                      onButtonClick={() => props.reqWithdrawPrize(mktAddr)}
        />
        <SingleAction when={show.withdrawUnresponded}
                      title="This market din't receive a response, take back you money"
                      button="withdraw"
                      onButtonClick={() => props.reqWithdraw(mktAddr)}
        />

      </div>
    )
  }
}

class DoubleAction extends React.Component {
  render () {
    if (!this.props.when) return null
    return (
      <div className="action">
        {this.props.children}
        <button onClick={() => this.props.onButtonClick('yes')} >yes</button>
        <button onClick={() => this.props.onButtonClick('no')} >no</button>
      </div>
    )
  }
}

class SingleAction extends React.Component {
  render() {
    if (!this.props.when)
      return null
    else
      return (
        <div className="action">
          <h3>{this.props.title}</h3>
          <button onClick={this.props.onButtonClick}>{this.props.button}</button>
        </div>
      )
  }
}

;(function () {
  const marketOperationsViewActions = getMarketOperationsViewActions()
  const marketOperationsActions = getMarketOperationsActions()
  const mapStateToProps = (state) => ({
    // show: state.marketOperations.show
    marketOperations: state.marketOperations,
    details: state.markets.marketsDetails[state.marketOperations.selectedMarket]
  })
  const mapDispatchToProps = (dispatch) => Object.assign({},
    ...Object.keys(marketOperationsActions).map(key => ({ [key]: (...args) => dispatch(marketOperationsActions[key](...args)) })),
    {
      reqRefreshBets: (addr) => dispatch(marketOperationsViewActions.reqRefreshBets(addr))
    }
  )
  Market = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Market)
})()