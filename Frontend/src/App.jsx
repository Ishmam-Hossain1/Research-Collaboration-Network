
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import AllProjects from "./pages/AllProjects";
import DatasetList from "./pages/DatasetList";
import UploadDataset from "./pages/UploadDataset";
import Researchers from "./pages/Researchers";
import ResearcherProfile from "./pages/ResearcherProfile";
import CollaborationRequests from "./pages/CollaborationRequests";
import Funding from "./pages/Funding";
import CreateFunding from "./pages/CreateFunding";
import EditFunding from "./pages/EditFunding";

import {
  ChatSidebarProvider,
  useChatSidebar,
} from "./context/ChatSidebarContext";
import { Sidebar, SidebarBody } from "./components/ui/sidebar";
import ChatSidebarContent from "./components/ChatSidebarContent";
import ChatWindow from "./components/ChatWindow";

// export default App;
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
import Dashboard from "./pages/Dashboard";
import AllProjects from "./pages/AllProjects";
import DatasetList from "./pages/DatasetList";
import UploadDataset from "./pages/UploadDataset";
import Researchers from "./pages/Researchers";
import ResearcherProfile from "./pages/ResearcherProfile";
import CollaborationRequests from "./pages/CollaborationRequests";
import Funding from "./pages/Funding";
import CreateFunding from "./pages/CreateFunding";
import EditFunding from "./pages/EditFunding";
import ProjectDetails from "./pages/ProjectDetails";

function App() {
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<AllProjects />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/datasets" element={<DatasetList />} />
      <Route path="/upload-dataset" element={<UploadDataset />} />
      <Route path="/researchers" element={<Researchers />} />
      <Route path="/researchers/:id" element={<ResearcherProfile />} />
      <Route
        path="/collaboration-requests"
        element={<CollaborationRequests />}
      />
      <Route path="/funding" element={<Funding />} />
      <Route path="/funding/new" element={<CreateFunding />} />
      <Route path="/funding/edit/:id" element={<EditFunding />} />
    </Routes>
  );
}


function GlobalChatSidebar() {
  const { isChatSidebarOpen, setIsChatSidebarOpen } = useChatSidebar();

  return (
    <div className="pointer-events-none fixed right-0 top-[78px] z-20 h-[calc(100vh-78px)]">
      <div className="pointer-events-auto h-full">
        <Sidebar
          open={isChatSidebarOpen}
          setOpen={setIsChatSidebarOpen}
          animate={true}
        >
          <SidebarBody className="h-full">
            <ChatSidebarContent />
          </SidebarBody>
        </Sidebar>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const hideChat = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!hideChat && <GlobalChatSidebar />}
      {!hideChat && <ChatWindow />}
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <ChatSidebarProvider>
      <AppContent />
    </ChatSidebarProvider>
  );
}

export default App;
