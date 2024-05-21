import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import style from "./List.module.css";
import { useNavigate } from "react-router";
const List = () => {
  const [votingSessions, setVotingSessions] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(VOTING_ABI, VOTING_ADDRESS);
      const votingData = await contract.methods.getVotingSessions().call();
      const { 0: ids, 1: names, 2: endDates, 3: statuses } = votingData;

      const sessions = ids.map((id, index) => ({
        id,
        name: names[index],
        endDate: Number(endDates[index]), // Explicit conversion to Number
        isActive: statuses[index],
      }));

      setVotingSessions(sessions);
    };

    fetchData();
  }, []);

  return (
    <div className={style.main}>
      <h2>Список голосований</h2>
      {votingSessions.length === 0 ? (
        <p>Нет доступных голосований.</p>
      ) : (
        <ul className={style.list}>
          {votingSessions.map((session) => (
            <li key={session.id} className={style.listItem}>
              <h3>{session.name}</h3>
              <p>
                Дата завершения:{" "}
                {new Date(session.endDate * 1000).toLocaleString()}
              </p>
              <p>Активен: {session.isActive ? "Да" : "Нет"}</p>
              <button
                onClick={() => {
                  navigate(`/voting/${session.id}`);
                }}
              >
                Подробнее
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default List;
