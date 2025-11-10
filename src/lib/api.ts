// Use relative URL in development (via Vite proxy) or absolute URL in production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Use Vite proxy in development
  : 'http://localhost:8000/api';  // Use direct URL in production

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get stored user data
export const getStoredUser = (): any => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user data in localStorage
export const setStoredUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// API request helper
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Determine if this is a public endpoint that should not require authentication
  const isPublicEndpoint = endpoint.includes('/signup/') || endpoint.includes('/login/');
  
  // Only add Authorization header for authenticated endpoints
  // Never send token for public endpoints (signup/login)
  if (!isPublicEndpoint) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response;
  } catch (error: any) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(
        'Unable to connect to the server. Please make sure the backend server is running on http://localhost:8000'
      );
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Admin signup
  signupAdmin: async (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
  }) => {
    try {
      // Clear any existing invalid tokens before signup to ensure clean state
      removeAuthToken();
      
      const response = await apiRequest('/auth/signup/admin/', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const error = await response.json();
          // Handle validation errors with better messages
          if (error.username && Array.isArray(error.username)) {
            errorMessage = error.username[0];
          } else if (error.username) {
            errorMessage = error.username;
          } else if (error.email && Array.isArray(error.email)) {
            errorMessage = error.email[0];
          } else if (error.email) {
            errorMessage = error.email;
          } else if (error.password && Array.isArray(error.password)) {
            errorMessage = error.password[0];
          } else if (error.password) {
            errorMessage = error.password;
          } else if (error.detail) {
            errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
          } else if (error.non_field_errors && Array.isArray(error.non_field_errors)) {
            errorMessage = error.non_field_errors[0];
          } else {
            // Try to extract first error message from any field
            const errorKeys = Object.keys(error);
            if (errorKeys.length > 0) {
              const firstError = error[errorKeys[0]];
              errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            } else {
              errorMessage = `Signup failed: ${response.status} ${response.statusText}`;
            }
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      // Re-throw with better error message
      if (error.message && error.message.includes('connect to the server')) {
        throw error;
      }
      // Don't expose technical token errors during signup
      if (error.message && error.message.toLowerCase().includes('invalid token')) {
        throw new Error('Registration failed. Please try again.');
      }
      if (error.message && error.message.toLowerCase().includes('csrf')) {
        throw new Error('Registration failed. Please refresh the page and try again.');
      }
      throw new Error(error.message || 'Failed to sign up. Please try again.');
    }
  },

  // Citizen signup
  signupCitizen: async (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
  }) => {
    try {
      // Clear any existing invalid tokens before signup to ensure clean state
      removeAuthToken();
      
      const response = await apiRequest('/auth/signup/citizen/', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const error = await response.json();
          // Handle validation errors with better messages
          if (error.username && Array.isArray(error.username)) {
            errorMessage = error.username[0];
          } else if (error.username) {
            errorMessage = error.username;
          } else if (error.email && Array.isArray(error.email)) {
            errorMessage = error.email[0];
          } else if (error.email) {
            errorMessage = error.email;
          } else if (error.password && Array.isArray(error.password)) {
            errorMessage = error.password[0];
          } else if (error.password) {
            errorMessage = error.password;
          } else if (error.detail) {
            errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
          } else if (error.non_field_errors && Array.isArray(error.non_field_errors)) {
            errorMessage = error.non_field_errors[0];
          } else {
            // Try to extract first error message from any field
            const errorKeys = Object.keys(error);
            if (errorKeys.length > 0) {
              const firstError = error[errorKeys[0]];
              errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            } else {
              errorMessage = `Signup failed: ${response.status} ${response.statusText}`;
            }
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      // Re-throw with better error message
      if (error.message && error.message.includes('connect to the server')) {
        throw error;
      }
      // Don't expose technical token errors during signup
      if (error.message && error.message.toLowerCase().includes('invalid token')) {
        throw new Error('Registration failed. Please try again.');
      }
      if (error.message && error.message.toLowerCase().includes('csrf')) {
        throw new Error('Registration failed. Please refresh the page and try again.');
      }
      throw new Error(error.message || 'Failed to sign up. Please try again.');
    }
  },

  // Login
  login: async (username: string, password: string) => {
    try {
      const response = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          if (error.detail) {
            errorMessage = error.detail;
          } else if (error.non_field_errors) {
            errorMessage = Array.isArray(error.non_field_errors)
              ? error.non_field_errors[0]
              : error.non_field_errors;
          } else {
            errorMessage = JSON.stringify(error);
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      // Re-throw with better error message
      if (error.message.includes('connect to the server')) {
        throw error;
      }
      throw new Error(error.message || 'Failed to login. Please try again.');
    }
  },

  // Logout
  logout: async () => {
    const response = await apiRequest('/auth/logout/', {
      method: 'POST',
    });

    removeAuthToken();
    return response.json();
  },

  // Get current user info
  getUserInfo: async () => {
    try {
      const response = await apiRequest('/auth/user/', {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear auth
          removeAuthToken();
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error('Failed to get user info');
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('connect to the server')) {
        throw error;
      }
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
  }) => {
    const response = await apiRequest('/auth/user/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update profile');
    }
    return response.json();
  },

  // Change password
  changePassword: async (old_password: string, new_password: string) => {
    const response = await apiRequest('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to change password');
    }
    return response.json();
  },
};

