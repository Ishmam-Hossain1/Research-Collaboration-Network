import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import UserProfile from "./pages/UserProfile";
import DatasetList from "./pages/DatasetList";
import UploadDataset from "./pages/UploadDataset";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/datasets" element={<DatasetList />} />
      <Route path="/upload-dataset" element={<UploadDataset />} />
    </Routes>
  );
}

export default App;