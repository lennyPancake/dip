import React, { useEffect } from "react";
import withAuth from "../components/withAuth";
import { useMetaMask } from "../hooks/useMetaMask";

const Home = () => {
  useEffect(() => {}, []);
  return (
    <div>
      {" "}
      <h1>homepage</h1>
    </div>
  );
};

export default withAuth(Home);
