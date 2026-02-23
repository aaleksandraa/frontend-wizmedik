import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'doctor' | 'clinic' | 'patient' | 'laboratory' | 'spa' | 'spa_manager' | 'care_home' | 'care_home_manager' | 'dom_manager';
  allowedRoles?: Array<'admin' | 'doctor' | 'clinic' | 'patient' | 'laboratory' | 'spa' | 'spa_manager' | 'care_home' | 'care_home_manager' | 'dom_manager'>;
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);

  // Show loading state while checking auth
  if (checking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    // Admin can access everything
    if (user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as any) && user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

