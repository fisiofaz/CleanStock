import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute() {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
