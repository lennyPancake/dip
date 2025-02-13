// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Voting {
    struct VotingSession {
        uint id;
        string name;
        string description;
        string[] options;
        uint endDate;
        bool isActive;
        bool resultsRevealed;
        bool deleted;
        address creator;
    }

    VotingSession[] public votingSessions;
    mapping(uint => mapping(string => uint)) public votes;
    mapping(uint => mapping(address => bool)) public hasVoted; 
    address public owner;

    event VotingCreated(uint id, string name, string description, uint endDate);
    event Voted(uint sessionId, address voter, string option);
    event VotingEnded(uint id);
    event ResultsRevealed(uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyCreator(uint _id) {
        require(msg.sender == votingSessions[_id - 1].creator, "Only the creator of the voting session can perform this action");
        _;
    }

    modifier activeVoting(uint _id) {
        require(votingSessions[_id - 1].isActive, "Voting is not active");
        require(block.timestamp < votingSessions[_id - 1].endDate, "Voting time has expired");
        require(!votingSessions[_id - 1].deleted, "Voting session is deleted");
        _;
    }

    modifier votingEnded(uint _id) {
        require(block.timestamp >= votingSessions[_id - 1].endDate, "Voting is still active");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function createVoting(string memory _name, string memory _description, string[] memory _options, bool revealed, uint _endDate) public {
        require(_endDate > block.timestamp, "The end date must be in the future");

        VotingSession memory newVoting = VotingSession({
            id: votingSessions.length + 1,
            name: _name,
            description: _description,
            options: _options,
            endDate: _endDate,
            isActive: true,
            resultsRevealed: revealed,
            deleted: false,
            creator: msg.sender
        });

        votingSessions.push(newVoting);
        emit VotingCreated(newVoting.id, _name, _description, _endDate);
    }

    function getVotingSession(uint _id) public view returns (string memory, string memory, string[] memory, uint, bool, address, bool, bool) {
        require(_id > 0 && _id <= votingSessions.length, "Invalid voting ID");
        VotingSession storage session = votingSessions[_id - 1];
        return (session.name, session.description, session.options, session.endDate, session.isActive, session.creator, session.resultsRevealed, session.deleted);
    }

    function getVotingSessions() public view returns (uint[] memory, string[] memory, string[] memory, uint[] memory, bool[] memory, address[] memory, bool[] memory) {
        uint length = votingSessions.length;

        uint[] memory ids = new uint[](length);
        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        uint[] memory endDates = new uint[](length);
        bool[] memory statuses = new bool[](length);
        address[] memory creators = new address[](length);
        bool[] memory deletions = new bool[](length);

        for (uint i = 0; i < length; i++) {
            VotingSession storage session = votingSessions[i];
            ids[i] = session.id;
            names[i] = session.name;
            descriptions[i] = session.description;
            endDates[i] = session.endDate;
            statuses[i] = session.isActive;
            creators[i] = session.creator;
            deletions[i] = session.deleted;
        }

        return (ids, names, descriptions, endDates, statuses, creators, deletions);
    }

    function getVotingSessionOptions(uint _id) public view returns (string[] memory) {
        require(_id > 0 && _id <= votingSessions.length, "Invalid voting ID");
        VotingSession storage session = votingSessions[_id - 1];
        return session.options;
    }

    function vote(uint _id, string memory _option) public activeVoting(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(!hasVoted[_id][msg.sender], "You have already voted");

        bool optionExists = false;
        for (uint i = 0; i < session.options.length; i++) {
            if (keccak256(abi.encodePacked(session.options[i])) == keccak256(abi.encodePacked(_option))) {
                optionExists = true;
                break;
            }
        }
        require(optionExists, "Voting option does not exist");

        votes[_id][_option]++;
        hasVoted[_id][msg.sender] = true;
        emit Voted(_id, msg.sender, _option);
    }

    function getVotes(uint _id) public view returns (string[] memory, uint[] memory) {
        require(_id > 0 && _id <= votingSessions.length, "Invalid voting ID");
        VotingSession storage session = votingSessions[_id - 1];

        uint optionsLength = session.options.length;
        uint[] memory voteCounts = new uint[](optionsLength);

        for (uint i = 0; i < optionsLength; i++) {
            voteCounts[i] = votes[_id][session.options[i]];
        }

        return (session.options, voteCounts);
    }

    function revealResults(uint _id) public onlyCreator(_id) votingEnded(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(!session.resultsRevealed, "Results have already been revealed");

        session.resultsRevealed = true;
        emit ResultsRevealed(_id);
    }

    function getAllVotes() public view returns (uint[] memory, string[] memory, uint[] memory) {
        uint sessionsLength = votingSessions.length;
        uint totalOptions = 0;

        for (uint i = 0; i < sessionsLength; i++) {
            totalOptions += votingSessions[i].options.length;
        }

        uint[] memory sessionIds = new uint[](totalOptions);
        string[] memory optionNames = new string[](totalOptions);
        uint[] memory voteCounts = new uint[](totalOptions);

        uint index = 0;
        for (uint i = 0; i < sessionsLength; i++) {
            VotingSession storage session = votingSessions[i];
            if (session.resultsRevealed) {
                for (uint j = 0; j < session.options.length; j++) {
                    sessionIds[index] = session.id;
                    optionNames[index] = session.options[j];
                    voteCounts[index] = votes[session.id][session.options[j]];
                    index++;
                }
            }
        }

        return (sessionIds, optionNames, voteCounts);
    }

    function hasUserVoted(uint _id, address _user) public view returns (bool) {
        return hasVoted[_id][_user];
    }

    function endVoting(uint _id) public onlyCreator(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(session.isActive, "Voting is already ended");

        session.isActive = false;
        emit VotingEnded(_id);
    }
}
