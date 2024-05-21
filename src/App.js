import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Navb from "./components/Navb";
import Profile from "./pages/Profile";
import List from "./pages/List";
import Create from "./pages/Create";

import { Navigation } from "./components/Navigation";
import "bootstrap/dist/css/bootstrap.min.css";

import { MetaMaskError } from "./components/MetamaskError";
import "./App.css";
import Voting from "./pages/Voting";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<Create />} />
          <Route path="/voting" element={<List />} />
          <Route path="/voting/:id" element={<Voting />} />
        </Routes>
        <MetaMaskError />
      </BrowserRouter>
    </>
  );
}

export default App;
