import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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

  if (!isAuthenticated) {
    // Redirect to login using Wouter
    setLocation('/login');
    return null;
  }

  return <>{children}</>;
}
