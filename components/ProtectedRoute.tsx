import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  // For now, we don't have admin role in NextAuth, so skip admin check
  // if (adminOnly && session.user.role !== 'admin') {
  //   return null; // Could redirect to unauthorized page
  // }

  return <>{children}</>;
};

export default ProtectedRoute;