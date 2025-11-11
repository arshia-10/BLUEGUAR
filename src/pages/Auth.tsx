import { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User as UserIcon, Loader2, Image as ImageIcon, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatbotButton } from "@/components/ChatbotButton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { otpAPI } from "@/lib/api";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userType = searchParams.get("type") || "citizen";
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signupAdmin, signupCitizen } = useAuth();

  // Aadhaar card state
  const [aadhaarCard, setAadhaarCard] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

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
    // Reset OTP state when email changes
    if (e.target.id === 'email') {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode("");
    }
  };

  // Handle Aadhaar card upload
  const handleAadhaarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setAadhaarCard(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Aadhaar card
  const removeAadhaar = () => {
    setAadhaarCard(null);
    setAadhaarPreview(null);
    if (aadhaarInputRef.current) {
      aadhaarInputRef.current.value = '';
    }
  };

  // Generate OTP
  const handleGenerateOTP = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingOTP(true);
      setOtpError(null);
      const response = await otpAPI.generateOTP(formData.email);
      
      setOtpSent(true);
      // In development, OTP is returned in response
      const otpMessage = response.otp 
        ? `OTP sent! Your OTP is: ${response.otp} (Development Mode)`
        : "OTP sent to your email. Please check your inbox.";
      toast({
        title: "OTP Sent",
        description: otpMessage,
      });
    } catch (error: any) {
      setOtpError(error.message || "Failed to generate OTP");
      toast({
        title: "Error",
        description: error.message || "Failed to generate OTP",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifyingOTP(true);
      setOtpError(null);
      await otpAPI.verifyOTP(formData.email, otpCode);
      
      setOtpVerified(true);
      toast({
        title: "OTP Verified",
        description: "Email verified successfully!",
      });
    } catch (error: any) {
      setOtpError(error.message || "Failed to verify OTP");
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOTP(false);
    }
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

        const signupData: any = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name || "",
          last_name: formData.last_name || "",
        };

        // Add Aadhaar card if uploaded
        if (aadhaarCard) {
          signupData.aadhaar_card = aadhaarCard;
        }

        // Add OTP verification status
        if (otpVerified) {
          signupData.otp_verified = true;
        }

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

                {/* OTP Verification Section */}
                <div className="space-y-2 border-t pt-4">
                  <Label>Email Verification (OTP) - Optional</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {!otpSent && !otpVerified && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateOTP}
                          disabled={isGeneratingOTP || !formData.email}
                          className="w-full"
                        >
                          {isGeneratingOTP ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            "Send OTP to Email"
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {otpSent && !otpVerified && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otpCode}
                            onChange={(e) => {
                              setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                              setOtpError(null);
                            }}
                            maxLength={6}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleVerifyOTP}
                            disabled={isVerifyingOTP || otpCode.length !== 6}
                          >
                            {isVerifyingOTP ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        {otpError && (
                          <p className="text-sm text-destructive">{otpError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Check your email for the OTP code
                        </p>
                      </div>
                    )}
                    
                    {otpVerified && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Email verified successfully</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Card Upload */}
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="aadhaar_card">Aadhaar Card Photo (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={aadhaarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAadhaarSelect}
                      className="hidden"
                      id="aadhaar_card"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => aadhaarInputRef.current?.click()}
                      className="flex-1"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {aadhaarCard ? "Change Aadhaar Card" : "Upload Aadhaar Card"}
                    </Button>
                    {aadhaarCard && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeAadhaar}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {aadhaarPreview && (
                    <div className="mt-2">
                      <img
                        src={aadhaarPreview}
                        alt="Aadhaar preview"
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a clear photo of your Aadhaar card (Max 5MB)
                  </p>
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
              onClick={() => {
                setIsLogin(!isLogin);
                // Reset form state when switching
                setFormData({
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  first_name: "",
                  last_name: "",
                });
                setAadhaarCard(null);
                setAadhaarPreview(null);
                setOtpCode("");
                setOtpSent(false);
                setOtpVerified(false);
                setOtpError(null);
                setError(null);
              }}
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
