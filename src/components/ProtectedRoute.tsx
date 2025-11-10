import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserType?: "admin" | "citizen";
}

export const ProtectedRoute = ({ children, allowedUserType }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If user type is specified, check if user has the required type
  if (allowedUserType && user?.user_type !== allowedUserType) {
    // Redirect to appropriate dashboard based on user type
    if (user?.user_type === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/citizen" replace />;
    }
  }

  return <>{children}</>;
};





