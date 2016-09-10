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

const InputFiltered = ({type, onChangeModel, valueModel, filter}) => (
  <input type={type}
         defaultValue={filter.toView(valueModel)}
         onBlur={e => onChangeModel(filter.fromView(e.target.value))}/>
)

const DateTimeEth = ({value, onNewValue, ...props}) => (
  <input type="datetime-local"
         value={Filters.ethereumTimestamp.toView(value).toISOString().slice(0, -1)}
         onChange={e => onNewValue(Filters.ethereumTimestamp.fromView(new Date(e.target.value)))}/>
)

class CreateMarket extends React.Component {
  componentDidMount () {
    //FIXME coinbase risulta sempre null. Gli input di che usano defaultValue non si aggiornano qui
    web3.eth.getCoinbase((coinbase) => {
      this.props.onChangeParams({
        question: 'prova',
        expirationTime: Math.floor(Date.now() / 1000) + 60,
        responder: coinbase,
        feeRate: 150,
        initialPrize: 2000000000000000000,
      })
    })
  }

  render() {
    const marketCreation = this.props.marketCreation
    const onChangeParams = this.props.onChangeParams
    const _change = (args) => onChangeParams(Object.assign({}, marketCreation, args))
    return (
      <div className="action">
        <h2>Create a new prediction market</h2>
        <label>Question:
          <input type="text" value={marketCreation.question} onChange={e => _change({ question: e.target.value })} />
        </label>
        <label>Expiration:
          <DateTimeEth value={marketCreation.expirationTime} onNewValue={value => _change({ expirationTime: value })}/>
        </label>
        <label>Responder:
          <input type="text" value={marketCreation.responder || ''} onChange={e => _change({ responder: e.target.value })} />
        </label>
        <label>Fees rate (%):
          {/*<input type="text" value={marketCreation.feeRate} required market-fee-rate onChange={e => _change({ feeRate: e.target.value })} />*/}
          <InputFiltered type="text" filter={Filters.marketFeeRate} required
                         valueModel={marketCreation.feeRate}
                         onChangeModel={value => _change({ feeRate: value })} />
        </label>
        <label>Initial prize (eth):
          {/*<input type="text" value={marketCreation.initialPrize} required unit-ether onChange={e => _change({ initialPrize: e.target.value })}/>*/}
          <InputFiltered type="text" filter={Filters.unitEther} required
                         valueModel={marketCreation.initialPrize}
                         onChangeModel={value => _change({ initialPrize: value })}/>
        </label>

        <button onClick={() => this.props.onCreate(marketCreation)}>Create a new PredictionMarket</button>

        { marketCreation.created ?
          <PublishMarket address={marketCreation.created} onPublish={this.props.onPublish} />
          : null
        }
      </div>
    )
  }
}

const PublishMarket = ({address, onPublish}) => (
  <div className="action">
    <label>Created a new prediction market at address:
      <span>{ address }</span>
    </label>
    <button onClick={onPublish(address)}>Publish</button>
  </div>
)

;(function () {

  const marketCreationActions = getMarketCreationActions()
  
  const mapStateToProps = state => ({
    marketCreation: state.marketCreation
  })
  const mapDispatchToProps = (dispatch) => ({
    onChangeParams: (params) => dispatch(marketCreationActions.chgMarketCreationArgs(params)),
    onCreate: (params) => dispatch(marketCreationActions.reqNewMarket(params)),
    onPublish: (addr) => dispatch(marketCreationActions.reqPublish(addr))
  })
  
  CreateMarket = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(CreateMarket)

})()

