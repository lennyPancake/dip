import React, { useState } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import style from "./Create.module.css";

const CreateVotingForm = ({ contract }) => {
  const [votingName, setVotingName] = useState("");
  const [options, setOptions] = useState([]);
  const [optionText, setOptionText] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleOptionChange = (e, index) => {
    const updatedOptions = [...options];
    updatedOptions[index] = e.target.value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    if (optionText.trim() !== "") {
      setOptions((prevOptions) => [...prevOptions, optionText]);
      setOptionText("");
    }
  };

  const createVoting = async () => {
    let finalOptions = options;
    if (optionText.trim() !== "") {
      finalOptions = [...options, optionText];
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );

      const endDateInSeconds = new Date(endDate).getTime() / 1000;

      console.log("Передаваемые варианты:", finalOptions);

      await contractInstance.methods
        .createVoting(votingName, finalOptions, endDateInSeconds)
        .send({ from: accounts[0] });
      console.log("Голосование успешно создано!");

      setVotingName("");
      setOptions([]);
      setOptionText("");
      setEndDate("");
    } catch (error) {
      console.error("Ошибка при создании голосования", error);
    }
  };

  return (
    <div className={style.main}>
      <h2>Создать голосование</h2>
      <div>
        <label>Название голосования:</label>
        <input
          type="text"
          value={votingName}
          onChange={(e) => setVotingName(e.target.value)}
        />
      </div>
      <div>
        <label>Варианты ответа:</label>
        {options.map((option, index) => (
          <div key={index} className={style.option}>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(e, index)}
            />
          </div>
        ))}
        <div className={style.addOption}>
          <input
            type="text"
            value={optionText}
            onChange={(e) => setOptionText(e.target.value)}
          />
          <button onClick={addOption}>Добавить вариант</button>
        </div>
      </div>
      <div>
        <label>Дата завершения:</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button className={style.btn} onClick={createVoting}>
        Создать голосование
      </button>
    </div>
  );
};

export default CreateVotingForm;
