// <div className="action" ng-controller="createMarketController as create">
//   <h2>Create a new prediction market</h2>
//   <label>Question:
//     <input type="text" ng-model="create.marketCreation.question">
//   </label>
//   <label>Expiration:
//     <input type="datetime-local" ng-model="create.marketCreation.expirationTime" required ethereum-timestamp>
//     <!-- <p>Now + 1 week</p> -->
//   </label>
//   <label>Responder:
//     <input type="text" ng-model="create.marketCreation.responder" required>
//   </label>
//   <label>Fees rate (%):
//     <input type="text" ng-model="create.marketCreation.feeRate" required market-fee-rate>
//   </label>
//   <label>Initial prize (eth):
//     <input type="text" ng-model="create.marketCreation.initialPrize" required unit-ether>
//     <!-- <input type="number" name="myDecimal" placeholder="Decimal" ng-model="myDecimal" ng-pattern="/^[0-9]+(\.[0-9]{1,2})?$/" step="0.01" /> -->
//   </label>
//
//   <button ng-click="create.doCreate()">Create a new PredictionMarket</button>
//
//   <div className="action" ng-show="create.marketCreation.created">
//     <label>Created a new prediction market at address:
//       <span>{{ create.marketCreation.created }}</span>
//     </label>
//     <button ng-click="create.doPublish()">Publish</button>
//   </div>
// </div>

class CreateMarket extends React.Component {
  render() {
    return (
      <div className="action">
        <h2>Create a new prediction market</h2>
        <label>Question:
          <input type="text" ng-model="create.marketCreation.question" />
        </label>
        <label>Expiration:
          <input type="datetime-local" ng-model="create.marketCreation.expirationTime" required ethereum-timestamp />
        </label>
        <label>Responder:
          <input type="text" ng-model="create.marketCreation.responder" required />
        </label>
        <label>Fees rate (%):
          <input type="text" ng-model="create.marketCreation.feeRate" required market-fee-rate />
        </label>
        <label>Initial prize (eth):
          <input type="text" ng-model="create.marketCreation.initialPrize" required unit-ether />
        </label>

        <button ng-click="create.doCreate()">Create a new PredictionMarket</button>

        <div className="action" ng-show="create.marketCreation.created">
          <label>Created a new prediction market at address:
            <span>{ create.marketCreation.created }</span>
          </label>
          <button ng-click="create.doPublish()">Publish</button>
        </div>
      </div>
    )
  }
}

