
class ControlAccountSelection extends React.Component {

  render() {
    let showLocalAccounts = true; // !mistService.available,
    let localAccountsCheckbox = showLocalAccounts
      ? <div>
          <label>Use local accounts:
            <input id="local" type="checkbox" /><br/>
          </label>
        </div>
      : null

    let accounts = ['0x000000000000', '0x000000000001']

    return (
      <div className="action">
        <h2>Account</h2>

        {localAccountsCheckbox}

        <label>Select a control account before interacting with the contract:
          <select>
            {accounts.map((a, i) =>
              <option value={a} key={i}>{i}</option>
            )}
          </select>
        </label>

        <div className="info">
          <span>Address: control.selected.address </span>
          <span>balance: control.selected.balance | unitEther  eth</span>
        </div>
        <label>Gas limit for transactions:
          <input type="text" />
        </label>
      </div>
    )
  }
}

// <div className="action" ng-controller="controlAccountController as control">
//   <h2>Account</h2>
//   <div ng-if="control.showLocalAccounts">
//     <label for="local">Use local accounts:</label>
//     <input id="local" type="checkbox" ng-model="control.localAccounts"><br>
//   </div>
//   <label for="account">Select a control account before interacting with the contract: </label>
//   <select id="account"
//           ng-model="control.selectedAddress"
//           ng-change="control.changeSelectedAccount(control.selectedAddress)">
//     <option ng-repeat="a in control.accountsList" value="{{a}}">{{$index}}</option>
//   </select>
//   <div className="info">
//     <span>Address: {{control.selected.address }}</span>
//     <span>balance: {{control.selected.balance | unitEther }} eth</span>
//   </div>
//   <label>Gas limit for transactions:
//     <input type="text" ng-model="control.selected.gasLimit">
//   </label>
// </div>


// <div ng-controller="mistController"></div>
