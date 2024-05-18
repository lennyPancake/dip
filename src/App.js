import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Navb from "./components/Navb";
import Home from "./pages/Home";
import Create from "./pages/Create";
import { Navigation } from "./components/Navigation";
import "bootstrap/dist/css/bootstrap.min.css";
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
          <Route path="/list" element={<Create />} />
        </Routes>
        <MetaMaskError />
      </BrowserRouter>
    </>
  );
}

export default App;
