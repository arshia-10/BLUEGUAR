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
    aadhaar_card?: File;
    otp_verified?: boolean;
  }) => {
    try {
      // Clear any existing invalid tokens before signup to ensure clean state
      removeAuthToken();
      const response = await apiRequest('/auth/signup/admin/', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          address: data.address,
          // Explicitly omit aadhaar_card to avoid file upload path
          otp_verified: data.otp_verified,
        }),
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
    aadhaar_card?: File;
    otp_verified?: boolean;
  }) => {
    try {
      // Clear any existing invalid tokens before signup to ensure clean state
      removeAuthToken();
      const response = await apiRequest('/auth/signup/citizen/', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          address: data.address,
          // Explicitly omit aadhaar_card to avoid file upload path
          otp_verified: data.otp_verified,
        }),
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

// Reports API functions
export const reportsAPI = {
  // Create a new report with file uploads
  createReport: async (data: {
    location: string;
    description: string;
    latitude?: number;
    longitude?: number;
    image?: File;
    audio?: File;
  }) => {
    const token = getAuthToken();
    const formData = new FormData();
    
    formData.append('location', data.location);
    formData.append('description', data.description);
    
    if (data.latitude !== undefined) {
      formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude !== undefined) {
      formData.append('longitude', data.longitude.toString());
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.audio) {
      formData.append('audio', data.audio);
    }

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    const API_BASE_URL = import.meta.env.DEV 
      ? '/api'  
      : 'http://localhost:8000/api';

    const response = await fetch(`${API_BASE_URL}/reports/create/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to submit report';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.errors) {
          const firstError = Object.values(error.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Get user's reports
  getReports: async () => {
    const response = await apiRequest('/reports/', {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error('Failed to fetch reports');
    }

    return response.json();
  },

  // Get total reports count (all entries)
  getReportCount: async (): Promise<{ count: number }> => {
    const response = await apiRequest('/reports/count/', {
      method: 'GET',
    });
    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error('Failed to fetch report count');
    }
    return response.json();
  },

  // Get all reports (admin dashboard use)
  getAllReports: async () => {
    const response = await apiRequest('/reports/all/', {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  // Assign team to report
  assignTeam: async (reportId: number, teamId: number) => {
    const response = await apiRequest(`/reports/${reportId}/assign-team/`, {
      method: 'POST',
      body: JSON.stringify({ team_id: teamId }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to assign team';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Mark report as completed
  completeReport: async (reportId: number, notes?: string) => {
    const response = await apiRequest(`/reports/${reportId}/complete/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to mark report as completed';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

// OTP API functions
export const otpAPI = {
  // Generate OTP
  generateOTP: async (email: string) => {
    const response = await apiRequest('/auth/otp/generate/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate OTP';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    const response = await apiRequest('/auth/otp/verify/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to verify OTP';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

// Teams API functions
export const teamsAPI = {
  // Get all teams
  list: async () => {
    const response = await apiRequest('/teams/', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }

    return response.json();
  },

  // Create a new team
  create: async (name: string, status: string = 'Active') => {
    const response = await apiRequest('/teams/create/', {
      method: 'POST',
      body: JSON.stringify({ name, status }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create team';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.errors) {
          const firstError = Object.values(error.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

// Resolve backend media URL (for ImageField/FileField)
export const resolveMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = import.meta.env.DEV ? 'http://localhost:8000' : 'http://localhost:8000';
  // url expected like '/media/...'
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};


