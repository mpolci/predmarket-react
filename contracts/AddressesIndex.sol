contract AddressesIndex {
  mapping (address => address[]) index;

  function add(address toAdd) {
    index[msg.sender].push(toAdd);
  }

  function get() constant returns (address[]) {
    return index[msg.sender];
  }

  /*
  function remove(uint idx) {
    delete index[msg.sender][idx];
  }
  */
}
