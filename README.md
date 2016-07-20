# Prediction markets
This is an exercise for the b9lab course.

## Dependencies

- [truffle](https://github.com/ConsenSys/truffle) 1.x
- [modified testrpc](https://github.com/Georgi87/testrpc) in order to run tests

## Tests
The tests use a special RPC call *evm_setTimestamp* provided by the modified
version of [testrpc from Georgi87](https://github.com/Georgi87/testrpc).

To run tests start `testrpc` then run the command:

    truffle test
