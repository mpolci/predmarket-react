module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "../node_modules/eth-lightwallet/dist/lightwallet.js",
      "../node_modules/hooked-web3-provider/build/hooked-web3-provider.js",
      // "../node_modules/redux/dist/redux.js",
      "../node_modules/redux-saga/dist/redux-saga.js",
      "javascripts/sagaMonitor.js",
      "../node_modules/ng-redux/dist/ng-redux.js",
      "javascripts/app.js"
    ],
    "pmarket-app.js": [
      "javascripts/routes.js",
      "javascripts/predictionMarket.service.js",
      "javascripts/controlAccount.controller.js",
      "javascripts/predictionMarkets.controller.js",
      "javascripts/createMarket.controller.js",
      "javascripts/marketOperations.controller.js",
      "javascripts/transactionInfo.controller.js",
      "javascripts/mist.js",
      "javascripts/filters.js",
      "javascripts/redux.js",
      "javascripts/redux-accounts.js",
      "javascripts/redux-markets.js",
      "javascripts/redux-market-operations.js",
      "javascripts/redux-market-operations-view.js",
      "javascripts/redux-txinfo-view.js",
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "views/": "views/"
  },
  rpc: {
    host: "localhost",
    port: 8545
  },
  networks: {
    "live": {
      network_id: 1,       // Ethereum public network
      // optional config values
      // host - defaults to "localhost"
      // port - defaults to 8545
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
    },
    "morden": {
      network_id: 2,       // Official Ethereum test network
    },
    "staging": {
      network_id: 42       // custom private network
      // use default rpc settings
    },
    "development": {
      network_id: "default"
    }
  }
};
