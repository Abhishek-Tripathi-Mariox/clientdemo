import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router';

import { AppShell } from '@/components/layout';
import { ToastHost } from '@/components/toast';
import Activity from '@/pages/Activity';
import Customers from '@/pages/Customers';
import Dashboard from '@/pages/Dashboard';
import Deliveries from '@/pages/Deliveries';
import DeliveryDetail from '@/pages/DeliveryDetail';
import History from '@/pages/History';
import Login from '@/pages/Login';
import Machinery from '@/pages/Machinery';
import NotFound from '@/pages/NotFound';
import Notifications from '@/pages/Notifications';
import OrderDetail from '@/pages/OrderDetail';
import Orders from '@/pages/Orders';
import Reports from '@/pages/Reports';
import Staff from '@/pages/Staff';
import { useStore } from '@/store';

function RequireAuth() {
  const signedIn = useStore((s) => !!s.staffId);
  return signedIn ? <AppShell /> : <Navigate to="/login" replace />;
}

function GuestOnly() {
  const signedIn = useStore((s) => !!s.staffId);
  return signedIn ? <Navigate to="/" replace /> : <Outlet />;
}

const router = createBrowserRouter([
  { element: <GuestOnly />, children: [{ path: '/login', element: <Login /> }] },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'requests', element: <Orders preset="Requested" /> },
      { path: 'orders', element: <Orders /> },
      { path: 'order/:id', element: <OrderDetail /> },
      { path: 'deliveries', element: <Deliveries /> },
      { path: 'delivery/:id', element: <DeliveryDetail /> },
      { path: 'history', element: <History /> },
      { path: 'customers', element: <Customers /> },
      { path: 'machinery', element: <Machinery /> },
      { path: 'staff', element: <Staff /> },
      { path: 'reports', element: <Reports /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'activity', element: <Activity /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastHost />
  </StrictMode>,
);
