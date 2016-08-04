
angular.module('predictionMarketApp').config(function () {
  if (typeof(mist) !== "undefined") {
    mist.menu.setBadge('My Prediction Markets')
  }
})

angular.module('predictionMarketApp').service('mistService', function () {
  var self = this
  angular.extend(this, {
    available: typeof(mist) !== "undefined",
    addMenuItem: addMenuItem
  })

  var counter = 0

  function addMenuItem(name, badge, callback) {
    if (!self.available) return;
    var id = 'pZgqDs' + counter
    counter++
    mist.menu.add(id, {
      name: name,
      badge: badge,
      position: 1,
      selected: false
    }, callback)
  }

})

angular.module('predictionMarketApp').controller('mistController', function ($rootScope, $log, mistService, appState, ethereumTimestampFilter) {
  if (!mistService.available) return;

  var added = {}
  $rootScope.$on('market-list-updated', function () {
    appState.markets.availMrktAddrs.forEach(addr => {
      if (!added[addr]) {
        details = appState.markets.marketsDetails[addr]
        mistService.addMenuItem(details.question, ethereumTimestampFilter(details.expiration), () => {
          appState.marketOperations.selectedMarket = addr
          $state.go('market')
        })
        added[addr] = true
        $log.$debug('Added Mist menu item for market:', addr)
      }
    })
  })
})
