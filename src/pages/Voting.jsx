import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import style from "./Voting.module.css";
import withAuth from "../components/withAuth";

const Voting = () => {
  const { id } = useParams();
  const [votingSession, setVotingSession] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const web3 = new Web3(window.ethereum);
          const contract = new web3.eth.Contract(VOTING_ABI, VOTING_ADDRESS);
          const votingData = await contract.methods.getVotingSession(id).call();
          const { 0: name, 1: options, 2: endDate, 3: isActive } = votingData;

          setVotingSession({
            name,
            options,
            endDate: Number(endDate), // Явное преобразование в Number
            isActive,
          });
        } else {
          setMessage(
            "MetaMask не установлен. Установите MetaMask для продолжения."
          );
        }
      } catch (error) {
        console.error(
          "Ошибка при получении данных о сессии голосования:",
          error
        );
        setMessage(
          "Произошла ошибка при загрузке данных о сессии голосования."
        );
      }
    };

    fetchData();
  }, [id]);

  const handleVote = async () => {
    if (selectedOption === "") {
      setMessage("Выберите вариант для голосования.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(VOTING_ABI, VOTING_ADDRESS);

      await contract.methods
        .vote(id, selectedOption)
        .send({ from: accounts[0] });
      setMessage("Ваш голос успешно учтен!");
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
      setMessage("Произошла ошибка при голосовании. Попробуйте еще раз.");
    }
  };

  if (!votingSession) {
    return <div className={style.main}>Загрузка...</div>;
  }

  return (
    <div className={style.main}>
      <h2>Голосование: {votingSession.name}</h2>
      <div>
        <p>
          Дата завершения:{" "}
          {new Date(votingSession.endDate * 1000).toLocaleString()}
        </p>
        <p>Статус: {votingSession.isActive ? "Активно" : "Завершено"}</p>
        <form>
          {votingSession.options.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                id={option}
                name="vote"
                value={option}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <label htmlFor={option}>{option}</label>
            </div>
          ))}
        </form>
        <button onClick={handleVote} disabled={!votingSession.isActive}>
          Голосовать
        </button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default withAuth(Voting);
