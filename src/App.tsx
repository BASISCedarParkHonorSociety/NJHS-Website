import "./App.css";
import Home from "./pages/Home2";
import Newsletter from "./pages/Newsletter";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import ManageHours from "./pages/ManageHours";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/manage_hours" element={<ManageHours />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
