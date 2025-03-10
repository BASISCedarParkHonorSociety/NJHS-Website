import "./App.css";
import Home from "./pages/Home2";
import { Newsletter, NewsletterPost } from "./pages/Newsletter";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import Event from "./pages/Event";
import Async from "./pages/Async";
import Sync from "./pages/Sync";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import InitUser from "./pages/InitUser";
import NotFound from "./pages/404";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/newsletter/:postId" element={<NewsletterPost />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/manage_users" element={<ManageUsers />} />
        <Route path="/dashboard/events" element={<Event />} />
        <Route path="/dashboard/async" element={<Async />} />
        <Route path="/dashboard/sync" element={<Sync />} />
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route path="/init-user" element={<InitUser />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
