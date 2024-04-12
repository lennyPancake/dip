import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Navb from "./components/Navb";
import Home from "./pages/Home";
import { Navigation } from "./components/Navigation";
import { MetaMaskError } from "./components/MetamaskError";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <MetaMaskError />
      </BrowserRouter>
    </>
  );
}

export default App;
