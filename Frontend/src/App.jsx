import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import AllProjects from "./pages/AllProjects";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<AllProjects />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  );
}

export default App;