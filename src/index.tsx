import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { Layout } from "./components/Layout/Layout";
import { LoginForm } from "./components/Auth/LoginForm";
import { DashboardMainPage } from "./screens/DashboardMainPage";
import { Events } from "./screens/Events/Events";
import { Users } from "./screens/Users/Users";
import { Rewards } from "./screens/Rewards/Rewards";
import { Feedback } from "./screens/Feedback/Feedback";
import { AdminHistory } from "./screens/AdminHistory/AdminHistory";
import { AdminProfile } from "./screens/AdminProfile/AdminProfile";
import { useAuthContext } from "./components/Auth/AuthProvider";
import { Missions } from "./screens/Missions/missions";

function AppContent() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#009A5A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardMainPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/users" element={<Users />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/admin-history" element={<AdminHistory />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
      </Routes>
    </Layout>
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  </StrictMode>
);