import "AddressSet.sol";
import "Owned.sol";

contract PredictionMarketsIndex {
  bool public present = true;
  using AddressSet for AddressSet.data;

  AddressSet.data public availableMarkets;
  mapping (address => AddressSet.data) public watchedMarkets;

  modifier onlyMarketOwner(address market) {
    if (msg.sender != Owned(market).owner()) throw;
    _
  }

  function addMarket(address addr) returns (bool added)  {
    return availableMarkets.insert(addr) == 2;
  }

  function removeMarket(address market)
    onlyMarketOwner(market)
    returns (bool success)
  {
    return availableMarkets.remove(market);
  }

  function addWatched(address market) {
    watchedMarkets[msg.sender].insert(market);
  }

  function removeWatched(address market) {
    watchedMarkets[msg.sender].remove(market);
  }

  // raw arrays may contain zero items values for deleted items

  function getAvailableMarketsRawArray() constant returns (address []) {
    return availableMarkets.items;
  }

  function getWatchedRawArray() constant returns (address []) {
    return watchedMarkets[msg.sender].items;
  }

}
