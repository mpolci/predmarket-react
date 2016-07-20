import 'AnswerToken.sol';

contract PredictionMarket {
  string public question;
  uint public expiration;
  address responder;
  address owner;
  uint tokensInitialSupply;
  AnswerToken public yes;
  AnswerToken public no;
  AnswerToken winner;
  uint public payout;
  uint public feeRate;  // value 100 means 1%

  function PredictionMarket(string _question, uint _expirationTime, address _responder, uint _feeRate) {
    if (_expirationTime <= now) throw;
    if (_responder == 0) throw;
    if (msg.value < 1 finney) throw;
    question = _question;
    expiration = _expirationTime;
    responder = _responder;
    owner = msg.sender;
    feeRate = _feeRate;

    tokensInitialSupply = msg.value / 500 szabo;

    yes = new AnswerToken(tokensInitialSupply);
    no = new AnswerToken(tokensInitialSupply);
  }

  modifier onlyBefore(uint _when) {
    if (now >= _when) throw;
    _
  }

  modifier onlyAfter(uint _when) {
    if (now < _when) throw;
    _
  }

  modifier onlyBy(address _account)
  {
    if (msg.sender != _account) throw;
    _
  }

  modifier hasWinner() {
    if (address(winner) == 0) throw;
    _
  }

  modifier unanswered() {
    if (address(winner) != 0) throw;
    _
  }

  function getPrice(AnswerToken _bidTo, AnswerToken _opposite) private returns (uint) {
    uint nBidded = _bidTo.totalSupply();
    uint nOpposite = _opposite.totalSupply();
    return (1 finney * nBidded) / (nBidded + nOpposite);
  }

  function getYesPrice() constant returns (uint) {
    return getPrice(yes, no);
  }

  function getNoPrice() constant returns (uint) {
    return getPrice(no, yes);
  }

  function bid(AnswerToken _bidTo, AnswerToken _opposite) private returns (uint) {
    uint price = getPrice(_bidTo, _opposite);
    uint qty = msg.value / price;
    if (qty == 0) throw;
    // if there is a change it is not returned back but it becomes part of the prize
    _bidTo.assignTo(msg.sender, qty);
    return qty;
  }

  function bidYes()
    onlyBefore(expiration)
    returns (uint)
  {
    return bid(yes, no);
  }

  function bidNo()
    onlyBefore(expiration)
    returns (uint)
  {
    return bid(no, yes);
  }

  function prizePool() constant returns (uint) {
    return this.balance;
  }

  function totalFees() constant returns (uint) {
    return (this.balance / 10000) * feeRate;
  }

  function answer(bool isYes)
    onlyBy(responder)
    unanswered
    onlyAfter(expiration)
    onlyBefore(expiration + 1 weeks)
  {
    winner = isYes ? yes : no;
    payout = (this.balance - totalFees()) / winner.totalSupply();
  }

  function getVerdict() constant returns (uint8) {
    if (winner == yes) return 1;
    if (winner == no) return 2;
    return 0;
  }

  function withdrawPrize()
    hasWinner
  {
    uint bids = winner.balanceOf(msg.sender);
    if (bids == 0) throw;
    winner.takeAway(msg.sender);
    if (!msg.sender.send(bids * payout)) throw;
  }

  function withdraw()
    unanswered
    onlyAfter(expiration + 1 weeks)
  {
    // The responder did not provide the answer.
    if (payout == 0) {
      uint totalBids = yes.totalSupply() + no.totalSupply() - 2 * tokensInitialSupply;
      payout = this.balance / totalBids;
    }
    uint bids = yes.balanceOf(msg.sender) + no.balanceOf(msg.sender);
    if (bids == 0) throw;
    yes.takeAway(msg.sender);
    no.takeAway(msg.sender);
    var amount = bids * payout;
    if (amount == 0 || !msg.sender.send(amount)) throw;
  }

  function withdrawFees()
    onlyBy(owner)
    hasWinner
  {
    var amount = totalFees();
    feeRate = 0;
    if (amount == 0 || !owner.send(amount)) throw;
  }

  function destroy()
    onlyBy(owner)
    onlyAfter(expiration + 8 weeks)
  {
    yes.destroy();
    no.destroy();
    selfdestruct(owner);
  }

}
