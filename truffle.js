module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "angularapp.js": [
      "javascripts/angular/routes.js",
      "javascripts/angular/state.factory.js",
      "javascripts/angular/predictionMarket.service.js",
      "javascripts/angular/controlAccount.controller.js",
      "javascripts/angular/predictionMarkets.controller.js",
      "javascripts/angular/createMarket.controller.js",
      "javascripts/angular/marketOperations.controller.js",
      "javascripts/angular/filters.js",
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  deploy: [
    "AddressSet",
    "PredictionMarketsIndex"
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
