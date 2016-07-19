
contract AnswerToken {
  address public predictionMarket;
  uint public totalSupply;
  mapping (address => uint) public balanceOf;

  function AnswerToken(uint _initialSupply) {
    predictionMarket = msg.sender;
    totalSupply = _initialSupply;
    // first tokens are not assigned
    //balanceOf[predictionMarket] = _initialSupply;
  }

  modifier only_pmarket() {
    if (msg.sender != predictionMarket) throw;
    _
  }

  modifier only_if_enough (uint amount) {
    if (amount > balanceOf[msg.sender]) throw;
    if (amount == 0) throw;
    _
  }

  modifier only_valid_address(address a) {
    if (a == 0) throw;
    _
  }

  function assignTo(address _to, uint _qty)
    only_pmarket
    only_valid_address(_to)
  {
    balanceOf[_to] += _qty;
    totalSupply += _qty;
  }

  function takeAway(address _to)
    only_pmarket
  {
    totalSupply -= balanceOf[_to];
    balanceOf[_to] = 0;
  }

  function destroy()
    only_pmarket
  {
    selfdestruct(predictionMarket);
  }

  function transfer(address _to, uint _value)
    only_if_enough(_value)
    only_valid_address(_to)
    returns (bool success)
  {
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    return true;
  }



}
