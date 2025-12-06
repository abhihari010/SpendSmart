// Protected route component that ensures only authenticated users can access certain routes
// 
// AI-GENERATED (Cursor AI Assistant)
// Prompt: "Create a protected route component that redirects unauthenticated users to the login page
// while showing a loading state during authentication check."
// 
// Modifications by Abhishek:
// - Added TypeScript types for better type safety

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';


export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}