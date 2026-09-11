import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Notes from "../pages/Notes";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import AIAssistant from "../pages/AIAssistant";
import ProtectedRoute from "./ProtectedRoute";
import OAuthCallback from "../pages/OAuthCallback";
import { DashboardLayout } from "../layouts/index";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
