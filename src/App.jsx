import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { PageLoader } from './components/ui/Loader';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import NeedsPage from './pages/admin/NeedsPage';
import TasksPage from './pages/admin/TasksPage';
import MatchingPage from './pages/admin/MatchingPage';
import MapPage from './pages/admin/MapPage';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import BrowseTasksPage from './pages/volunteer/BrowseTasksPage';
import MyTasksPage from './pages/volunteer/MyTasksPage';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  const { loading, initAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/needs" element={<NeedsPage />} />
          <Route path="/admin/tasks" element={<TasksPage />} />
          <Route path="/admin/matching" element={<MatchingPage />} />
          <Route path="/admin/map" element={<MapPage />} />
        </Route>

        {/* Volunteer Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="volunteer">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/volunteer" element={<Navigate to="/volunteer/dashboard" replace />} />
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/browse" element={<BrowseTasksPage />} />
          <Route path="/volunteer/tasks" element={<MyTasksPage />} />
        </Route>

        {/* Shared Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
