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
    "angularapp.js": [
      "javascripts/angular/routes.js",
      "javascripts/angular/predictionMarket.service.js",
      "javascripts/angular/controlAccount.controller.js",
      "javascripts/angular/predictionMarkets.controller.js",
      "javascripts/angular/createMarket.controller.js",
      "javascripts/angular/marketOperations.controller.js",
      "javascripts/angular/transactionInfo.controller.js",
      "javascripts/angular/mist.js",
      "javascripts/angular/filters.js",
      "javascripts/angular/redux.js",
      "javascripts/angular/redux-accounts.js",
      "javascripts/angular/redux-markets.js",
      "javascripts/angular/redux-market-operations.js",
      "javascripts/angular/redux-market-operations-view.js",
      "javascripts/angular/redux-txinfo-view.js",
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
