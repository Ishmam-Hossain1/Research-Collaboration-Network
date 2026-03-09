// import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Home from "./pages/Homepage";
// import UserProfile from "./pages/UserProfile";
// import Researchers from "./pages/Researchers";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/home" element={<Home />} />
//       <Route path="/profile" element={<UserProfile />} />
//       <Route path="/researchers" element={<Researchers />} />
//     </Routes>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import UserProfile from "./pages/UserProfile";
import Researchers from "./pages/Researchers";
import ResearcherProfile from "./pages/ResearcherProfile";
import CollaborationRequests from "./pages/CollaborationRequests";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/researchers" element={<Researchers />} />
      <Route path="/researchers/:id" element={<ResearcherProfile />} />
      <Route
        path="/collaboration-requests"
        element={<CollaborationRequests />}
      />
    </Routes>
  );
}

export default App;