// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_qty","type":"uint256"}],"name":"assignTo","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"}],"name":"takeAway","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"predictionMarket","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"}],"type":"constructor"}],
    binary: "606060405260405160208061023083395060806040525160008054600160a060020a031916331790556001819055506101f48061003c6000396000f3606060405236156100615760e060020a600035046318160ddd81146100635780631fb3c4d21461006c57806351a783be1461009157806370a08231146100b357806383197ef0146100cb578063a9059cbb146100ea578063def114b61461011a575b005b61012c60015481565b610061600435602435600054600160a060020a03908116903316811461013657610002565b610061600435600054600160a060020a03908116903316811461017a57610002565b61012c60043560026020526000908152604090205481565b610061600054600160a060020a0390811690331681146101a157610002565b61012c60043560243533600160a060020a031660009081526002602052604081205482908111156101a457610002565b61012c600054600160a060020a031681565b6060908152602090f35b8280600160a060020a03166000141561014e57610002565b5050600160a060020a038216600090815260026020526040902080548201905560018054820190555050565b50600160a060020a0316600090815260026020526040812080546001805491909103905555565b80ff5b80600014156101b257610002565b8380600160a060020a0316600014156101ca57610002565b5050604080822080548490039055600160a060020a0384168252902080548201905560019291505056",
    unlinked_binary: "606060405260405160208061023083395060806040525160008054600160a060020a031916331790556001819055506101f48061003c6000396000f3606060405236156100615760e060020a600035046318160ddd81146100635780631fb3c4d21461006c57806351a783be1461009157806370a08231146100b357806383197ef0146100cb578063a9059cbb146100ea578063def114b61461011a575b005b61012c60015481565b610061600435602435600054600160a060020a03908116903316811461013657610002565b610061600435600054600160a060020a03908116903316811461017a57610002565b61012c60043560026020526000908152604090205481565b610061600054600160a060020a0390811690331681146101a157610002565b61012c60043560243533600160a060020a031660009081526002602052604081205482908111156101a457610002565b61012c600054600160a060020a031681565b6060908152602090f35b8280600160a060020a03166000141561014e57610002565b5050600160a060020a038216600090815260026020526040902080548201905560018054820190555050565b50600160a060020a0316600090815260026020526040812080546001805491909103905555565b80ff5b80600014156101b257610002565b8380600160a060020a0316600014156101ca57610002565b5050604080822080548490039055600160a060020a0384168252902080548201905560019291505056",
    address: "",
    generated_with: "2.0.9",
    contract_name: "AnswerToken"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("AnswerToken error: Please call load() first before creating new instance of this contract.");
    }

    Contract.Pudding.apply(this, arguments);
  };

  Contract.load = function(Pudding) {
    Contract.Pudding = Pudding;

    Pudding.whisk(contract_data, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  }

  Contract.new = function() {
    if (Contract.Pudding == null) {
      throw new Error("AnswerToken error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("AnswerToken error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("AnswerToken error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.AnswerToken = Contract;
  }

})();
