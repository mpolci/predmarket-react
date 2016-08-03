angular.module('predictionMarketApp').factory('appState', function () {
  return {
    accounts: {
      localAccounts: false,
      list: []
    },
    selectedAccount: {
      address: null,
      balance: '',
      // ownedMrktAddrs: [],
      // betMrktAddrs: [],
      gasLimit: 2000000
    },
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
