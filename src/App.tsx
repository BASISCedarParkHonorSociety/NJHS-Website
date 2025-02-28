import "./App.css";
import Home from "./pages/Home2";
import Newsletter from "./pages/Newsletter";
import Dashboard from "./pages/Dashboard";
import ManageHours from "./pages/ManageHours";
import Event from "./pages/Event";
import Async from "./pages/Async";
import Sync from "./pages/Sync";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
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
          <Route path="/dashboard/events" element={<Event />} />
          <Route path="/dashboard/async" element={<Async />} />
          <Route path="/dashboard/sync" element={<Sync />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
