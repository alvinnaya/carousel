import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Helper function to decode JWT token and normalize claims
  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      
      // Normalisasi Role (ASP.NET Core sering menggunakan URI lengkap untuk claim role)
      const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      let roles = decoded.role || decoded.roles || decoded[roleClaim] || [];
      
      // Pastikan roles adalah array
      if (typeof roles === 'string') roles = [roles];
      
      return {
        ...decoded,
        roles: roles,
        email: decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        name: decoded.unique_name || decoded.name
      };
    } catch (e) {
      console.error("JWT Parse Error:", e);
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      // Decode user profile from token payload instead of localStorage
      const decodedUser = parseJwt(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        // If token is invalid/doesn't decode, clear it
        setToken(null);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        const { token, refreshToken } = response.data;
        setToken(token);
        
        const decodedUser = parseJwt(token);
        setUser(decodedUser || response.data); 
        
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await authService.googleLogin(idToken);
      if (response.success) {
        const { token, refreshToken } = response.data;
        setToken(token);
        
        const decodedUser = parseJwt(token);
        setUser(decodedUser || response.data); 
        
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Google Login failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
