
const AccountsSelect = ({onChangeAccount, list, selected}) => (
  <label>Select a control account before interacting with the contract:
    <select value={selected || ''}
            onChange={ ({target}) => onChangeAccount(target.value) } >
      {list.map((a, i) =>
        <option value={a} key={i}>{i}</option>
      )}
    </select>
  </label>
)

const AccountInfo = ({account}) => (
  <div className="info">
    <span>Address: {account.address}</span>
    <span>balance: {Filters.unitEther.toView(account.balance)} eth</span>
  </div>
)

class ControlAccountSelection extends React.Component {

  componentDidMount() {
    this.setState({showLocalAccounts: !MistService.available()})
  }

  render() {
    const props = this.props
    let localAccountsCheckbox = this.state && this.state.showLocalAccounts
      ? <div>
          <label>Use local accounts:
            <input type="checkbox" value={props.localAccounts} onChange={this._onLocalAccounts.bind(this)}/>
            <br/>
          </label>
        </div>
      : null

    return (
      <div className="action">
        <h2>Account</h2>

        {localAccountsCheckbox}

        <AccountsSelect list={props.accountsList}
                        selected={props.selectedAddress}
                        onChangeAccount={props.changeSelectedAccount}
        />

        <AccountInfo account={props.selected}/>

        <label>Gas limit for transactions:
          <input type="text"
                 value={props.selected.gasLimit}
                 onChange={(event) => props.setGasLimit(event.target.value)}
          />
        </label>
      </div>
    )
  }

  _onLocalAccounts ({target}) {
    const uncheck = () => {
      target.checked = false
    }
    if (target.checked) {
      // Example of seed 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
      var seed = prompt('Enter your private key seed', 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle')
      // the seed is stored in memory and encrypted by this user-defined password
      if (!seed) return uncheck()
      var password = prompt('Enter password to encrypt the seed', 'dev_password')
      if (password === null) return uncheck()
      this.props.reqLocalAccounts(seed, password)
    } else {
      this.props.reqRemoteAccounts()
    }
  }
}


;(function () {

  const mapStateToProps = state => ({
    localAccounts: state.accounts.localAccounts,
    accountsList: state.accounts.list,
    selectedAddress: state.selectedAccount.address,
    selected: state.selectedAccount,
  })

  const accountActions = getAccountsActions()

  const mapDispatchToProps = (dispatch) => Object.assign({}, ...Object.keys(accountActions).map(key => ({ [key]: (...args) => dispatch(accountActions[key](...args)) })))

  ControlAccountSelection = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ControlAccountSelection)

})()

