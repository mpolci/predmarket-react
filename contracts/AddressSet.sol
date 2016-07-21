// inspired by IntegerSet at https://github.com/ethereum/wiki/wiki/Solidity-Features#internal-types-for-libraries
library AddressSet {
  struct data {
    /// Mapping item => index (or zero if not present)
    mapping(address => uint) index;
    /// Items by index (index 0 is invalid), items with index[item] == 0 are invalid.
    address[] items;
    /// Number of stored items.
    uint size;
  }

  function insert(data storage self, address value) returns (bool alreadyPresent) {
    uint index = self.index[value];
    if (index > 0)
      return true;
    else
    {
      if (self.items.length == 0) self.items.length = 1;
      index = self.items.length++;
      self.items[index] = value;
      self.index[value] = index;
      self.size++;
      return false;
    }
  }

  function remove(data storage self, address value) returns (bool success) {
    uint index = self.index[value];
    if (index == 0)
      return false;
    delete self.index[value];
    delete self.items[index];
    self.size --;
  }

  function contains(data storage self, address value) returns (bool) {
    return self.index[value] > 0;
  }

  function iterate_start(data storage self) returns (uint index) {
    return iterate_advance(self, 0);
  }

  function iterate_valid(data storage self, uint index) returns (bool) {
    return index < self.items.length;
  }

  function iterate_advance(data storage self, uint index) returns (uint r_index) {
    index++;
    while (iterate_valid(self, index) && self.index[self.items[index]] == index)
      index++;
    return index;
  }

  function iterate_get(data storage self, uint index) returns (address value) {
      return self.items[index];
  }
}
