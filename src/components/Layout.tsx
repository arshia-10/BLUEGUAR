import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BlueGuard
            </span>
          </Link>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
                <Button
                  variant="hero"
                  onClick={async () => {
                    await logout();
                    navigate("/auth");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth?type=citizen">
                  <Button variant="outline">Citizen Login</Button>
                </Link>
                <Link to="/auth?type=admin">
                  <Button variant="hero">Admin Login</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};

export default Layout;
