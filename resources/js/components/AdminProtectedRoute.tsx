import React, { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user || !user.is_admin)) {
      setLocation('/admin/login');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm text-muted-foreground tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !user.is_admin) {
    return null;
  }

  return <>{children}</>;
}
