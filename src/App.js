import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Navb from "./components/Navb";
function App() {
  return (
    <>
      <BrowserRouter>
        <Navb />
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
