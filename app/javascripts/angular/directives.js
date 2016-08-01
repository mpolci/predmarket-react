angular.module('predictionMarketApp')
.directive('ethereumTimestamp', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(data) {
        //convert data from view format to model format
        return data.getTime() / 1000 //converted
      });

      ngModelController.$formatters.push(function(data) {
        //convert data from model format to view format
        return new Date(data * 1000) //converted
      })
    }
  }
})

.directive('marketFeeRate', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(data) {
        //convert data from view format to model format
        return Math.floor(parseFloat(data) * 100) //converted
      });

      ngModelController.$formatters.push(function(data) {
        //convert data from model format to view format
        return (data / 100).toFixed(2) //converted
      })
    }
  }
})

.directive('unitEther', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(data) {
        //convert data from view format to model format
        return web3.toWei(data, 'ether') //converted
      });

      ngModelController.$formatters.push(function(data) {
        //convert data from model format to view format
        return web3.fromWei(data, 'ether') //converted
      })
    }
  }
})
