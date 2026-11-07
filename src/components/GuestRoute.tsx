import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Spinner } from "@heroui/react";

export default function GuestRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" label="Loading..." color="primary" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
