import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
import style from "./Voting.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { ListGroup, ListGroupItem, Placeholder } from "react-bootstrap";

const Voting = () => {
  const { id } = useParams();
  const [votingSession, setVotingSession] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchVotingSession = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const contractInstance = new web3.eth.Contract(
          VOTING_ABI,
          VOTING_ADDRESS
        );
        const sessionId = id; // Get the voting session ID from the URL params
        const votingData = await contractInstance.methods
          .getVotingSession(sessionId)
          .call();
        const {
          0: name,
          1: description,
          2: category,
          3: options,
          4: endDate,
          5: isActive,
          6: creator,
        } = votingData;

        setVotingSession({
          id: sessionId,
          name,
          description,
          category,
          endDate: Number(endDate),
          isActive,
          creator,
          options,
        });

        const hasVoted = await contractInstance.methods
          .hasUserVoted(sessionId, accounts[0])
          .call();
        setHasVoted(hasVoted);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении сессии голосования", error);
        setLoading(false);
      }
    };

    fetchVotingSession();
  }, [id]);

  const vote = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );

      await contractInstance.methods
        .vote(id, selectedOption)
        .send({ from: accounts[0] });
      console.log("Голос успешно подан!");
      setHasVoted(true);
    } catch (error) {
      console.error("Ошибка при голосовании", error);
    }
  };

  if (loading) {
    return (
      <div className={style.main}>
        <div className={style.content}>
          <Placeholder xs={6} />
          <Placeholder className="w-75" />{" "}
          <Placeholder style={{ width: "25%" }} />
          <Placeholder xs={6} />
          <Placeholder xs={6} />
        </div>
      </div>
    );
  }

  if (!votingSession) {
    return <div>Сессия голосования не найдена</div>;
  }

  return (
    <div className={style.main}>
      <div className={style.content}>
        <h2>Голосование: {votingSession.name}</h2>

        <div key={votingSession.id} className={style.session}>
          <h3>{votingSession.name}</h3>
          <p>
            {" "}
            <b>Описание:</b> {votingSession.description}
          </p>
          <p>
            <b>Категория:</b> {votingSession.category}
          </p>
          <p>
            <b>Дата завершения:</b>{" "}
            {new Date(votingSession.endDate * 1000).toLocaleString()}
          </p>
          {votingSession.isActive && !hasVoted && (
            <div>
              <label>Выберите вариант:</label>
              <div className={style.list}>
                <ListGroup size="lg" data-bs-theme="dark">
                  {votingSession.options.map((option, index) => (
                    <ListGroupItem
                      key={index}
                      action
                      variant="secondary"
                      active={selectedOption === option}
                      onClick={() => setSelectedOption(option)}
                    >
                      {option}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </div>

              <button onClick={vote} disabled={selectedOption === ""}>
                Голосовать
              </button>
            </div>
          )}
          {hasVoted && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ margin: "0" }}>
                Вы уже проголосовали в этой сессии голосования.
              </p>
              <button
                style={{
                  marginBottom: "10px",
                  marginLeft: "10px",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  navigate("/voting");
                }}
              >
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Voting;
