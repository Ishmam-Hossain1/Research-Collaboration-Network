<<<<<<< HEAD
import { Routes, Route, Navigate } from "react-router-dom";
=======
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

>>>>>>> f38871ccdc671e2ae2fbbe11979b177d8167c210
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import UserProfile from "./pages/UserProfile";
import Researchers from "./pages/Researchers";
import ResearcherProfile from "./pages/ResearcherProfile";
import CollaborationRequests from "./pages/CollaborationRequests";
import Funding from "./pages/Funding";
import CreateFunding from "./pages/CreateFunding";
import EditFunding from "./pages/EditFunding";
<<<<<<< HEAD
import Resources from "./pages/Resources";
=======
import ProjectDetails from "./pages/ProjectDetails";
import MilestonesPage from './pages/MilestonesPage';
>>>>>>> f38871ccdc671e2ae2fbbe11979b177d8167c210

import {
  ChatSidebarProvider,
  useChatSidebar,
} from "./context/ChatSidebarContext";
import { Sidebar, SidebarBody } from "./components/ui/sidebar";
import ChatSidebarContent from "./components/ChatSidebarContent";
import ChatWindow from "./components/ChatWindow";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
<<<<<<< HEAD
=======
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<AllProjects />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
>>>>>>> f38871ccdc671e2ae2fbbe11979b177d8167c210
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/researchers" element={<Researchers />} />
      <Route path="/researchers/:id" element={<ResearcherProfile />} />
      <Route
        path="/collaboration-requests"
        element={<CollaborationRequests />}
      />
      <Route path="/funding" element={<Funding />} />
      <Route path="/funding/new" element={<CreateFunding />} />
      <Route path="/funding/edit/:id" element={<EditFunding />} />
<<<<<<< HEAD
      <Route path="/resources" element={<Resources />} />
=======
      <Route path="/projects/:id/milestones" element={<MilestonesPage />} />
>>>>>>> f38871ccdc671e2ae2fbbe11979b177d8167c210
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
  const hideChat =
    location.pathname === "/login" || location.pathname === "/signup";

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