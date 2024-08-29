import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from './AuthService';

export function ProtectedRoute({ element }) {
  return isAuthenticated() ? element : <Navigate to="/unauthorized" />;
}

export function AdminRoute({ element }) {
  return isAuthenticated() && hasRole('ADMIN') ? element : <Navigate to="/unauthorized" />;
}