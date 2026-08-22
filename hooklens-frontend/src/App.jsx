import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { RealtimeProvider } from './context/RealtimeContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

import DashboardLayout from './components/layout/DashboardLayout.jsx';
import DashboardOverview from './pages/dashboard/DashboardOverview.jsx';
import EndpointsPage from './pages/dashboard/EndpointsPage.jsx';
import CreateEndpointPage from './pages/dashboard/CreateEndpointPage.jsx';
import EndpointDetailPage from './pages/dashboard/EndpointDetailPage.jsx';
import EventsPage from './pages/dashboard/EventsPage.jsx';
import EventDetailPage from './pages/dashboard/EventDetailPage.jsx';
import ReplaysPage from './pages/dashboard/ReplaysPage.jsx';
import DlqPage from './pages/dashboard/DlqPage.jsx';
import SecurityPage from './pages/dashboard/SecurityPage.jsx';
import SettingsPage from './pages/dashboard/SettingsPage.jsx';
import OnboardingPage from './pages/dashboard/OnboardingPage.jsx';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Authenticated Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="endpoints" element={<EndpointsPage />} />
                <Route path="endpoints/new" element={<CreateEndpointPage />} />
                <Route path="endpoints/:endpointId" element={<EndpointDetailPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="events/:eventId" element={<EventDetailPage />} />
                <Route path="replays" element={<ReplaysPage />} />
                <Route path="dlq" element={<DlqPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
