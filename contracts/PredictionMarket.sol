/*
  Prediction market beavior:
  - the account that creates the contract becomes the contract owner
  - the contract creation should transfer at least 1 finney, and the whole transfered value is the initial prize
  - the contract creation should specify the question, the expiration time, the address of the responder account and the fee rate
  - the contract creation assign to the owner a number of bids for both yes and no replies, the number of bids is equal to n = trasfered value / 0.5 finney (n bids for yes and n for no)
  - the price for a bid is calculated as 1 finney * x / total bids, where x is the number of previous bids for current bid type (yes or no), and total bids is the total number of both bids types
  - the bids can be buyed before the expiration time
  - no change is returned back if the transfered value for bid is not an exact multiple of the price
  - the responder account can give a verdict after the expiration time within a week
  - after the responder has given the verdict, the winners users can withdraw the prize (also the owner have some bids for the initial prize)
  - after the responder has given the verdict, the owner can withdraw the fees
  - the prize for each bids is calculated as (contract balance - fees) / number of winning bids
  - the fees are calculated at the specified fee rate of the contract balance
  - if the responder doesn't give the verdict within a week, the contract balance is divided among all bids excluded the owner's bids for initial prize. The owner loses anything
  - after the expiration time plus 4 weeks the prediction market is over, the owner can destroy it and take all the remaining balance that was not collected by bidders

  Possible improvements:
  - payment of the responder
  - parameterize the constants
  - send back the change if the transfered value is not multiple of the bid price
  - actually the owner can take own part of prize only at market destruction
*/
import 'Owned.sol';
import 'AnswerToken.sol';

contract PredictionMarket is Owned{
  string public question;
  uint public expiration;
  address public responder;
  uint tokensInitialSupply;
  AnswerToken public yes;
  AnswerToken public no;
  AnswerToken winner;
  uint public payout;
  uint public feeRate;  // value 100 means 1%
  uint finalFees;

  // _feeRate is calculated as 1/10000 of total value, so a value of 100 means 1%
  function PredictionMarket(string _question, uint _expirationTime, address _responder, uint _feeRate) {
    if (_expirationTime <= now) throw;
    if (_responder == 0) throw;
    if (msg.value < 1 finney) throw;
    question = _question;
    expiration = _expirationTime;
    responder = _responder;
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
    if (address(winner) == 0)
      return (this.balance / 10000) * feeRate;
    else
      return finalFees;
  }

  function answer(bool isYes)
    onlyBy(responder)
    unanswered
    onlyAfter(expiration)
    onlyBefore(expiration + 1 weeks)
  {
    finalFees = totalFees();
    winner = isYes ? yes : no;
    payout = (this.balance - finalFees) / winner.totalSupply();
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
    if (feeRate == 0) throw;
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
