;(function () {

  const web3 = new Web3()

  window.Filters = {
    ethereumTimestamp: {
      toView: (data) => new Date(data * 1000),
      fromView: (data) => Math.floor(data.getTime() / 1000)
    },
    marketFeeRate: {
      toView: (data) => (data / 100).toFixed(2),
      fromView: (data) => Math.floor(parseFloat(data) * 100)
    },
    unitEther: {
      toView: (data) => web3.fromWei(web3.toBigNumber(data), 'ether').toNumber(),
      fromView: (data) => web3.toWei(data, 'ether')
    },
    num: {
      toView: (input) => input != null ? parseFloat(input) : null
    },
    verdict: {
      toView: (value) => {
        if (value && value.toNumber) value = value.toNumber()
        switch (value) {
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
    },
  }

})()