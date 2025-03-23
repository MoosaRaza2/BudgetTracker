import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Verify token with the backend
          const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          // If token is invalid, clear it
          console.error('Authentication error:', error);
          localStorage.removeItem('authToken');
        }
      }
      
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('authToken', token);
      
      setUser(user);
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to login. Please try again.' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('authToken', token);
      
      setUser(user);
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to register. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 