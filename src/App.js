import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import List from "./pages/List";
import Create from "./pages/Create";
import Voting from "./pages/Voting";
import Navigation from "./components/Navigation/Navigation"; // Импортируем Navigation
import { MetaMaskError } from "./components/MetamaskError";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/voting" element={<List active={true} />} />
        <Route path="/voting/:id" element={<Voting />} />
        <Route path="/inactive" element={<List active={false} />} />
      </Routes>
      <MetaMaskError />
    </BrowserRouter>
  );
}

export default App;
