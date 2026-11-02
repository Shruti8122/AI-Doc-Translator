import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import LanguagePage from "./pages/LanguagePage";
import ProgressPage from "./pages/ProgressPage";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

import DashboardHome from "./pages/DashboardHome";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import DownloadsPage from "./pages/DownloadsPage";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AnimatedBackground from "./components/AnimatedBackground";

export default function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<><AnimatedBackground /><LoginPage /></>} />
        <Route path="/register" element={<><AnimatedBackground /><RegisterPage /></>} />
        <Route path="/forgot-password" element={<><AnimatedBackground /><ForgotPasswordPage /></>} />
        <Route path="/reset-password/:token" element={<><AnimatedBackground /><ResetPasswordPage /></>} />

        {/* Protected translator routes */}
        <Route path="/language/:taskId" element={<ProtectedRoute><><AnimatedBackground /><LanguagePage /></></ProtectedRoute>} />
        <Route path="/progress/:taskId" element={<ProtectedRoute><><AnimatedBackground /><ProgressPage /></></ProtectedRoute>} />
        <Route path="/result/:taskId" element={<ProtectedRoute><><AnimatedBackground /><ResultPage /></></ProtectedRoute>} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="translate" element={<><AnimatedBackground /><UploadPage /></>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="downloads" element={<DownloadsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<><AnimatedBackground /><NotFoundPage /></>} />
      </Routes>
    </>
  );
}
