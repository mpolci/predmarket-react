module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "angularapp.js": [
      "javascripts/angular/*.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  deploy: [
    "AddressesIndex",
    "AddressSet"
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
