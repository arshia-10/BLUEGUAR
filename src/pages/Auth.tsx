import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatbotButton } from "@/components/ChatbotButton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userType = searchParams.get("type") || "citizen";
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signupAdmin, signupCitizen } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.username || !formData.password) {
          setError("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        const loginResponse = await login(formData.username, formData.password);
        
        // Get user from auth context (it's already set by login function)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${user.username}!`,
          });

          // Navigate based on actual user type from backend
          if (user.user_type === "admin") {
            navigate("/admin");
          } else {
            navigate("/citizen");
          }
        } else {
          // Fallback navigation
          navigate(userType === "admin" ? "/admin" : "/citizen");
        }
      } else {
        // Signup
        if (!formData.username || !formData.email || !formData.password) {
          setError("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        const signupData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name || "",
          last_name: formData.last_name || "",
        };

        if (userType === "admin") {
          await signupAdmin(signupData);
        } else {
          await signupCitizen(signupData);
        }

        toast({
          title: "Account created successfully",
          description: "Please sign in to continue.",
        });

        // Redirect to sign-in on the same Auth page
        setIsLogin(true);
        navigate(`/auth?type=${userType}`);
      }
    } catch (err: any) {
      console.error('Auth error details:', {
        error: err,
        message: err.message,
        stack: err.stack,
        userType,
        isLogin
      });
      
      // Handle specific token errors more gracefully
      let errorMessage = err.message || "An error occurred. Please try again.";
      
      // Don't show "invalid token" errors to users during signup - it's a technical detail
      if (errorMessage.toLowerCase().includes('invalid token') && !isLogin) {
        errorMessage = "Registration failed. Please try again.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-12 w-12 text-primary-foreground" />
            <span className="text-3xl font-bold text-primary-foreground">BlueGuard</span>
          </div>
          <p className="text-primary-foreground/80">
            {userType === "admin" ? "Admin Portal" : "Citizen Portal"}
          </p>
        </div>

        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-center text-muted-foreground text-sm">
              {isLogin ? "Sign in to your account" : "Sign up for a new account"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  className="pl-10"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              variant="hero" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </a>
          </div>
        </Card>
      </div>

      <ChatbotButton />
    </div>
  );
};

export default Auth;
