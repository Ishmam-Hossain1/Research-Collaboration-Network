import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import UserProfile from "./pages/UserProfile";
import Researchers from "./pages/Researchers";
import Funding from "./pages/Funding";
import CreateFunding from "./pages/CreateFunding";
import EditFunding from "./pages/EditFunding";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/researchers" element={<Researchers />} />
      <Route path="/funding" element={<Funding />} />
      <Route path="/funding/new" element={<CreateFunding />} />
      <Route path="/funding/edit/:id" element={<EditFunding />} />
    </Routes>
  );
}

export default App;