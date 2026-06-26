import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-slate-600">Cargando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
