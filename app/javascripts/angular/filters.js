;(function () {

  let filters = [
    {
      name: 'ethereumTimestamp',
      toView: (data) => new Date(data * 1000),
      fromView: (data) => Math.floor(data.getTime() / 1000)
    },
    {
      name: 'marketFeeRate',
      toView: (data) => (data / 100).toFixed(2),
      fromView: (data) => Math.floor(parseFloat(data) * 100)
    },
    {
      name: 'unitEther',
      toView: (data) => web3.fromWei(web3.toBigNumber(data), 'ether').toNumber(),
      fromView: (data) => web3.toWei(data, 'ether')
    },
  ]

  let app = angular.module('predictionMarketApp')
  filters.forEach(f => {
    app.filter(f.name, function () {
      return f.toView
    })
    .directive(f.name, function() {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {
          ngModelController.$parsers.push(f.fromView)
          ngModelController.$formatters.push(f.toView)
        }
      }
    })
  })

  app.filter('num', function() {
    return function(input) {
      return input != null ? parseFloat(input) : null
    }
  })

  app.filter('verdict', function() {
    return function(value) {
      if (value && value.toNumber) value = value.toNumber()
      switch(value) {
        case 0:
          return 'N/A'
        case 1:
          return 'yes'
        case 2:
          return 'no'
        case null:
        case undefined:
          return null
        default:
          return 'unknown verdict code'
      }
    }
  })

})()
