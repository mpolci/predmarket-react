contract Owned {
  address public owner;
  function Owned() {
    owner = msg.sender;
  }
}
