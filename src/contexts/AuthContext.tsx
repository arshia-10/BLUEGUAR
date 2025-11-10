import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getAuthToken, setAuthToken, removeAuthToken, getStoredUser, setStoredUser } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type: 'admin' | 'citizen';
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signupAdmin: (data: SignupData) => Promise<void>;
  signupCitizen: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        // Set the stored token and user immediately
        setToken(storedToken);
        setUser(storedUser);
        
        // Verify token is still valid in the background (non-blocking)
        // If verification fails, we'll clear auth on next API call
        try {
          const response = await authAPI.getUserInfo();
          // Update user data if successful
          setUser(response.user);
          setStoredUser(response.user);
        } catch (error: any) {
          // Token might be invalid, but don't clear immediately
          // Let the user try to use the app, and clear on actual API failure
          console.warn('Token validation failed on init, clearing invalid auth');
          // Clear invalid auth data
          removeAuthToken();
          setStoredUser(null);
          // Don't clear the current user/token state immediately to avoid UI flicker
          // The user will see they're logged in but API calls will fail and redirect them
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      setAuthToken(response.token);
      setStoredUser(response.user);
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signupAdmin = async (data: SignupData) => {
    try {
      // Do not auto-login on signup; just perform registration
      await authAPI.signupAdmin(data);
    } catch (error: any) {
      console.error('Admin signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  const signupCitizen = async (data: SignupData) => {
    try {
      // Do not auto-login on signup; just perform registration
      await authAPI.signupCitizen(data);
    } catch (error: any) {
      console.error('Citizen signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    signupAdmin,
    signupCitizen,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

