import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Upload from '../pages/Upload';
import Edit from '../pages/Edit';
import ResourceDetail from '../pages/ResourceDetail';
import Profile from '../pages/Profile';
import Bookmarks from '../pages/Bookmarks';
import Notifications from '../pages/Notifications';
import ForgotPassword from '../pages/ForgotPassword';
import ChangePassword from '../pages/ChangePassword';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminModeration from '../pages/AdminModeration';
import AdminReports from '../pages/AdminReports';
import AdminAcademic from '../pages/AdminAcademic';
import AdminUsers from '../pages/AdminUsers';

// Routes
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: '/change-password',
    element: (
      <PrivateRoute>
        <ChangePassword />
      </PrivateRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/upload',
    element: (
      <PrivateRoute>
        <Upload />
      </PrivateRoute>
    ),
  },
  {
    path: '/resources/:id/edit',
    element: (
      <PrivateRoute>
        <Edit />
      </PrivateRoute>
    ),
  },
  {
    path: '/resources/:id',
    element: <ResourceDetail />,
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  {
    path: '/bookmarks',
    element: (
      <PrivateRoute>
        <Bookmarks />
      </PrivateRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <PrivateRoute>
        <Notifications />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <AdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/moderation',
    element: (
      <PrivateRoute>
        <AdminModeration />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/reports',
    element: (
      <PrivateRoute>
        <AdminReports />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/academic',
    element: (
      <PrivateRoute>
        <AdminAcademic />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <PrivateRoute>
        <AdminUsers />
      </PrivateRoute>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
