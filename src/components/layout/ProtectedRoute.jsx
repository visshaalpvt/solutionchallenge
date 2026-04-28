import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { PageLoader } from '../ui/Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard
    const redirect = user.role === 'admin' ? '/admin/dashboard' : '/volunteer/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
