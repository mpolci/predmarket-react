import "AddressSet.sol";

contract AddressSetTest {
  using AddressSet for AddressSet.data;
  AddressSet.data data;

  function insert(address value) returns (uint8 result) {
    return data.insert(value);
  }

  function remove(address value) returns (bool success) {
    return data.remove(value);
  }

  function contains(address value) constant returns (bool) {
    return data.contains(value);
  }

  function iterate_start() returns (uint index) {
    return data.iterate_start();
  }

  function iterate_valid(uint index) returns (bool) {
    return data.iterate_valid(index);
  }

  function iterate_advance(uint index) returns (uint r_index) {
    return data.iterate_advance(index);
  }

  function iterate_get(uint index) returns (address value) {
    return data.iterate_get(index);
  }
}
