const Voting = artifacts.require("./Voting.sol");
const VotingToken = artifacts.require("./VotingToken.sol");
module.exports = function (deployer) {
  deployer.deploy(Voting);
  //deployer.deploy(VotingToken, 3);
};
