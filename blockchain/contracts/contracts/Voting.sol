// SPDX-License-Identifier: UNLICENSED 
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Voting {
    struct VotingSession {
        uint id;
        string name;
        string description;
        string category;
        string[] options;
        uint endDate;
        bool isActive;
        address creator;
    }

    VotingSession[] public votingSessions;
    mapping(uint => mapping(string => uint)) public votes; // Маппинг для хранения голосов
    mapping(uint => mapping(address => bool)) public hasVoted; // Маппинг для отслеживания, проголосовал ли пользователь
    address public owner;

    event VotingCreated(uint id, string name, string description, string category, uint endDate);
    event Voted(uint sessionId, address voter, string option);
    event VotingEnded(uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Только владелец может выполнять это действие");
        _;
    }

    modifier onlyCreator(uint _id) {
        require(msg.sender == votingSessions[_id - 1].creator, "Только создатель голосования может выполнять это действие");
        _;
    }

    modifier activeVoting(uint _id) {
        require(votingSessions[_id - 1].isActive, "Голосование не активно");
        require(block.timestamp < votingSessions[_id - 1].endDate, "Время голосования истекло");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function createVoting(string memory _name, string memory _description, string memory _category, string[] memory _options, uint _endDate) public {
        require(_endDate > block.timestamp, "Дата завершения должна быть в будущем");

        VotingSession memory newVoting = VotingSession({
            id: votingSessions.length + 1,
            name: _name,
            description: _description,
            category: _category,
            options: _options,
            endDate: _endDate,
            isActive: true,
            creator: msg.sender
        });

        votingSessions.push(newVoting);
        emit VotingCreated(newVoting.id, _name, _description, _category, _endDate);
    }

    function getVotingSession(uint _id) public view returns (string memory, string memory, string memory, string[] memory, uint, bool, address) {
        require(_id > 0 && _id <= votingSessions.length, "Неверный ID голосования");
        VotingSession storage session = votingSessions[_id - 1];
        return (session.name, session.description, session.category, session.options, session.endDate, session.isActive, session.creator);
    }

    function getVotingSessions() public view returns (uint[] memory, string[] memory, string[] memory, string[] memory, uint[] memory, bool[] memory, address[] memory) {
        uint length = votingSessions.length;

        uint[] memory ids = new uint[](length);
        string[] memory names = new string[](length);
        string[] memory descriptions = new string[](length);
        string[] memory categories = new string[](length);
        uint[] memory endDates = new uint[](length);
        bool[] memory statuses = new bool[](length);
        address[] memory creators = new address[](length);

        for (uint i = 0; i < length; i++) {
            VotingSession storage session = votingSessions[i];
            ids[i] = session.id;
            names[i] = session.name;
            descriptions[i] = session.description;
            categories[i] = session.category;
            endDates[i] = session.endDate;
            statuses[i] = session.isActive;
            creators[i] = session.creator;
        }

        return (ids, names, descriptions, categories, endDates, statuses, creators);
    }

    function getVotingSessionOptions(uint _id) public view returns (string[] memory) {
        require(_id > 0 && _id <= votingSessions.length, "Неверный ID голосования");
        VotingSession storage session = votingSessions[_id - 1];
        return session.options;
    }

    function vote(uint _id, string memory _option) public activeVoting(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(!hasVoted[_id][msg.sender], "Вы уже проголосовали");

        // Проверка, что опция существует
        bool optionExists = false;
        for (uint i = 0; i < session.options.length; i++) {
            if (keccak256(abi.encodePacked(session.options[i])) == keccak256(abi.encodePacked(_option))) {
                optionExists = true;
                break;
            }
        }
        require(optionExists, "Опция голосования не существует");

        votes[_id][_option]++;
        hasVoted[_id][msg.sender] = true;
        emit Voted(_id, msg.sender, _option);
    }

    function endVoting(uint _id) public onlyCreator(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(session.isActive, "Голосование уже завершено");

        session.isActive = false;
        emit VotingEnded(_id);
    }

    function getVotes(uint _id) public view returns (string[] memory, uint[] memory) {
        require(_id > 0 && _id <= votingSessions.length, "Неверный ID голосования");
        VotingSession storage session = votingSessions[_id - 1];

        uint optionsLength = session.options.length;
        uint[] memory voteCounts = new uint[](optionsLength);

        for (uint i = 0; i < optionsLength; i++) {
            voteCounts[i] = votes[_id][session.options[i]];
        }

        return (session.options, voteCounts);
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
            for (uint j = 0; j < session.options.length; j++) {
                sessionIds[index] = session.id;
                optionNames[index] = session.options[j];
                voteCounts[index] = votes[session.id][session.options[j]];
                index++;
            }
        }

        return (sessionIds, optionNames, voteCounts);
    }

    function pauseVoting(uint _id) public onlyCreator(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(session.isActive, "Голосование уже приостановлено или завершено");

        session.isActive = false;
    }

    function resumeVoting(uint _id) public onlyCreator(_id) {
        VotingSession storage session = votingSessions[_id - 1];
        require(!session.isActive, "Голосование уже активно");

        session.isActive = true;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Неверный адрес нового владельца");
        owner = newOwner;
    }
    function hasUserVoted(uint _id, address _user) public view returns (bool) {
        return hasVoted[_id][_user];
    }
}
