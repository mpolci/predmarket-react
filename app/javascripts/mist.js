
angular.module('predictionMarketApp').config(function () {
  if (typeof(mist) !== "undefined") {
    mist.menu.setBadge('My Prediction Markets')
  }
})

angular.module('predictionMarketApp').service('mistService', function ($state, $log, $ngRedux, marketOperationsViewActions, ethereumTimestampFilter) {
  var self = this
  angular.extend(this, {
    available: typeof(mist) !== "undefined",
    addMenuItem: addMenuItem,
    addMarketToMenu: addMarketToMenu
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

  function addMarketToMenu(addr) {
    if (!self.available) return;
    details = $ngRedux.getState().markets.marketsDetails[addr]
    addMenuItem(details.question, ethereumTimestampFilter(details.expiration), () => {
      $ngRedux.dispatch(marketOperationsViewActions.reqSelectMarket(addr))
      $state.go('market')
    })
    $log.debug('Added Mist menu item for market:', addr)
  }
})

angular.module('predictionMarketApp').controller('mistController', function ($rootScope, $ngRedux, mistService) {
  if (!mistService.available) return;

  var added = {}
  $rootScope.$on('market-list-updated', function () {
    $ngRedux.getState().markets.availMrktAddrs.forEach(addr => {
      if (!added[addr]) {
        mistService.addMarketToMenu(addr)
        added[addr] = true
      }
    })
  })
})
