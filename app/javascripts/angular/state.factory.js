angular.module('predictionMarketApp').factory('appState', function () {
  return {
    selectedAccount: {
      address: null,
      balance: '',
      ownedMrktAddrs: [],
      betMrktAddrs: [],
      gasLimit: 2000000
    },
    // accounts: [],
    markets: {
      availMrktAddrs: [],
      ownedMrktAddrs: [],
      betMrktAddrs: [],
      predictionMarkets: {
        // '<address>': {
        //   yesCost,
        //   noCost,
        //   yesTotalBids,
        //   noTotalBids,
        // }
      },
    },
    currrentUIState: '',
    marketCreation: {},
    // {
    //   created: <address>
    //   question: null,
    //   expirationTime: null,
    //   responder: null,
    //   feeRate: null,
    //   initialPrize: null,
    // }
  }
})
