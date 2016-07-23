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
      //ownedMrktAddrs: [],
      //betMrktAddrs: [],
      marketsDetails: {
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
    marketOperations: {
      selectedMarket: null, // address
      yesBets: null,
      noBets: null,
    }
  }
})
