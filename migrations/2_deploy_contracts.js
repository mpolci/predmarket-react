module.exports = function(deployer, network) {
  deployer.deploy(AddressSet);
  deployer.autolink();
  deployer.deploy(PredictionMarketsIndex);
  if (network != "live") {
    deployer.deploy(AddressSetTest);
  }
};
