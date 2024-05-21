import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { VOTING_ABI, VOTING_ADDRESS } from "../config";
//import style from "./Results.module.css";

const VotingResults = ({ sessionId }) => {
  const [results, setResults] = useState({ options: [], votes: [] });

  useEffect(() => {
    const fetchResults = async () => {
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        VOTING_ABI,
        VOTING_ADDRESS
      );
      const data = await contractInstance.methods.getVotes(sessionId).call();
      const { 0: options, 1: votes } = data;
      setResults({ options, votes });
    };
    fetchResults();
  }, [sessionId]);

  return (
    <div>
      <h2>Результаты голосования</h2>
      <ul>
        {results.options.map((option, index) => (
          <li key={index}>
            {option}: {results.votes[index]} голосов
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VotingResults;
