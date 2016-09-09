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
    return (
      <div className="action" ng-controller="marketOperationsController as opsc" ng-show="opsc.marketOperations.selectedMarket">
        <h2>Prediction market details</h2>
        <div>Address: { opsc.marketOperations.selectedMarket }</div>
        <div>Question: { opsc.details.question }</div>
        <div>Expiration: { opsc.details.expiration | ethereumTimestamp | date }</div>
        <div ng-repeat="field in ['responder', 'owner', 'yes', 'no']">
          <div>{field}: { opsc.details[field] }</div>
        </div>
        <div ng-repeat="field in ['payout', 'getYesPrice', 'getNoPrice', 'prizePool', 'totalFees']">
          <div>{field}: { opsc.details[field] | unitEther | num } eth</div>
        </div>
        <div>Fees rate: { opsc.details.feeRate | marketFeeRate } %</div>
        <div ng-repeat="field in ['yesTotalBids', 'noTotalBids']">
          <div>{field}: { opsc.details[field] | num }</div>
        </div>
        <div>Verdict: { opsc.details.getVerdict | verdict }</div>

        <div>Your bets to yes: { opsc.marketOperations.yesBets | num }</div>
        <div>Your bets to no: { opsc.marketOperations.noBets | num }</div>

        <div className="action" ng-show="opsc.show.bid">
          <h3>Make a bet</h3>
          <label>Amount (eth):
            <input name="amount" type="number" ng-model="_amountInput" required unit-ether />
          </label>
          <button ng-click="opsc.doBid('yes', _amountInput)">Bet on yes</button>
          <button ng-click="opsc.doBid('no', _amountInput)">Bet on no</button>
        </div>

        <div className="action" ng-show="opsc.show.respond">
          <h3>Give a verdict</h3>
          <div>{ opsc.details.question }</div>
          <button ng-click="opsc.doGiveVerdict('yes')">yes</button>
          <button ng-click="opsc.doGiveVerdict('yes')">no</button>
        </div>

        <div className="action" ng-show="opsc.show.withdrawFees">
          <h3>You are the owner of this prediction market</h3>
          <button ng-click="opsc.doWithdrawFees()">Withdraw fees</button>
        </div>

        <div className="action" ng-show="opsc.show.withdrawPrize">
          <h3>Withdraw your prize</h3>
          <button ng-click="opsc.doWithdrawPrize()">Withdraw prize</button>
        </div>

        <div className="action" ng-show="opsc.show.withdrawUnresponded">
          <h3>This market din't receive a response, take back you money</h3>
          <button ng-click="opsc.doWithdrawUnresponded()">withdraw</button>
        </div>

      </div>
    )
  }

}