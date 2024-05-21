// SPDX-License-Identifier: UNLICENSED 
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract Voting {
    struct VotingSession {
        uint id;
        string name;
        string[] options;
        uint endDate;
        bool isActive;
    }

    VotingSession[] public votingSessions;
    mapping(uint => mapping(string => uint)) public votes; // Маппинг для хранения голосов

    function createVoting(string memory _name, string[] memory _options, uint _endDate) public {
        require(_endDate > block.timestamp, "Дата завершения должна быть в будущем");

        VotingSession memory newVoting = VotingSession({
            id: votingSessions.length + 1,
            name: _name,
            options: _options,
            endDate: _endDate,
            isActive: true
        });

        votingSessions.push(newVoting);
    }

    function getVotingSession(uint _id) public view returns (string memory, string[] memory, uint, bool) {
        require(_id > 0 && _id <= votingSessions.length, "Неверный ID голосования");
        VotingSession storage session = votingSessions[_id - 1];
        return (session.name, session.options, session.endDate, session.isActive);
    }

    function getVotingSessions() public view returns (uint[] memory, string[] memory, uint[] memory, bool[] memory) {
        uint length = votingSessions.length;

        uint[] memory ids = new uint[](length);
        string[] memory names = new string[](length);
        uint[] memory endDates = new uint[](length);
        bool[] memory statuses = new bool[](length);

        for (uint i = 0; i < length; i++) {
            VotingSession storage session = votingSessions[i];
            ids[i] = session.id;
            names[i] = session.name;
            endDates[i] = session.endDate;
            statuses[i] = session.isActive;
        }

        return (ids, names, endDates, statuses);
    }

    function vote(uint _id, string memory _option) public {
        require(_id > 0 && _id <= votingSessions.length, "Неверный ID голосования");
        VotingSession storage session = votingSessions[_id - 1];
        require(session.isActive, "Голосование завершено");
        require(block.timestamp < session.endDate, "Время голосования истекло");

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

    // Добавление новой функции для получения всех голосов
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
}
