import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './AuthService';

export function ProtectedRoute({ element }) {
  console.log("ProtectedRoute",isAuthenticated())

  return isAuthenticated() ? element : <Navigate to="/unauthorized" />;
}