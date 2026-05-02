
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import AllProjects from "./pages/AllProjects";
import UserProfile from "./pages/UserProfile";
import Researchers from "./pages/Researchers";
import ResearcherProfile from "./pages/ResearcherProfile";
import CollaborationRequests from "./pages/CollaborationRequests";
import Funding from "./pages/Funding";
import CreateFunding from "./pages/CreateFunding";
import EditFunding from "./pages/EditFunding";
import Resources from "./pages/Resources";
import ProjectDetails from "./pages/ProjectDetails";
import MilestonesPage from "./pages/MilestonesPage";
import Conferences from "./pages/Conferences";
import DatasetList from "./pages/DatasetList";
import UploadDataset from "./pages/UploadDataset";
import ApplyGrant from "./pages/ApplyGrant";
import MyGrantApplications from "./pages/MyGrantApplications";
import ReceivedGrantApplications from "./pages/ReceivedGrantApplications";
import EditGrantApplication from "./pages/EditGrantApplication";
import EquipmentList from "./pages/EquipmentList";
import MyEquipment from "./pages/MyEquipment";
import EditEquipment from "./pages/EditEquipment";
import EquipmentBookings from "./pages/EquipmentBookings";
import EquipmentDetail from "./pages/EquipmentDetail";
import ListEquipment from "./pages/ListEquipment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

import {
  ChatSidebarProvider,
  useChatSidebar,
} from "./context/ChatSidebarContext";
import { Sidebar, SidebarBody } from "./components/ui/sidebar";
import ChatSidebarContent from "./components/ChatSidebarContent";
import ChatWindow from "./components/ChatWindow";
import FloatingAIChatbot from "./components/FloatingAIChatbot";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<AllProjects />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/projects/:id/milestones" element={<MilestonesPage />} />
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
      <Route path="/projects/:id/milestones" element={<MilestonesPage />} />

      {/* ✅ Conferences Page */}
      <Route path="/conferences" element={<Conferences />} />

      {/* ✅ Google Calendar Success Page */}
      <Route
        path="/calendar-connected"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="rounded-3xl bg-white p-8 shadow border">
              <h1 className="text-2xl font-bold text-slate-900">
                Google Calendar Connected
              </h1>
              <p className="mt-2 text-slate-600">
                You can now add academic conferences and deadlines to your
                calendar.
              </p>
            </div>
          </div>
        }
      />
      <Route path="/resources" element={<Resources />} />
      <Route path="/funding/:id/apply" element={<ApplyGrant />} />
      <Route path="/grant-applications/mine" element={<MyGrantApplications />} />
      <Route path="/grant-applications/received" element={<ReceivedGrantApplications />} />
      <Route path="/grant-applications/:id/edit" element={<EditGrantApplication />} />
      <Route path="/equipment" element={<EquipmentList />} />
      <Route path="/equipment/new" element={<ListEquipment />} />
      <Route path="/equipment/manage" element={<MyEquipment />} />
      <Route path="/equipment/edit/:id" element={<EditEquipment />} />
      <Route path="/equipment/my-bookings" element={<EquipmentBookings />} />
      <Route path="/equipment/:id" element={<EquipmentDetail />} />
      <Route path="/equipment/booking/payment-success" element={<PaymentSuccess />} />
      <Route path="/equipment/booking/payment-cancel" element={<PaymentCancel />} />
    </Routes>
  );
}

function GlobalChatSidebar() {
  const { isChatSidebarOpen, setIsChatSidebarOpen } = useChatSidebar();

  if (!isChatSidebarOpen) return null;

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
      {!hideChat && <FloatingAIChatbot />}
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