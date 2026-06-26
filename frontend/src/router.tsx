import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Schedules } from './pages/Schedules';
import { OnCall } from './pages/OnCall';
import { Messages } from './pages/Messages';
import { Contacts } from './pages/Contacts';
import { ImportContacts } from './pages/ImportContacts';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';

const withAuth = (children: React.ReactNode) => <AuthProvider>{children}</AuthProvider>;

export const router = createBrowserRouter([
  { path: '/login', element: withAuth(<Login />) },
  { path: '/register', element: withAuth(<Register />) },
  {
    element: withAuth(<ProtectedRoute />),
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/horarios', element: <Schedules /> },
          { path: '/guardias', element: <OnCall /> },
          { path: '/mensajes', element: <Messages /> },
          { path: '/contactos', element: <Contacts /> },
          { path: '/importar-contactos', element: <ImportContacts /> },
          { path: '/historial', element: <Logs /> },
          { path: '/configuracion', element: <Settings /> },
        ],
      },
    ],
  },
]);
