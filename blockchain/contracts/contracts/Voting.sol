// SPDX-License-Identifier: UNLICENSED 

pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2; // Включаем экспериментальный функционал

contract Voting {
    // Структура для представления голосования
    struct VotingSession {
        uint id;
        string name;
        string[] options;
        mapping(string => uint) votes;
        uint endDate;
        bool isActive;
    }

    VotingSession[] public votingSessions;

    // Функция для создания нового голосования
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
}