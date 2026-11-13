import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('knowra_token'));
  const [loading, setLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState({ online: false, checking: true });

  // Initial user check
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('knowra_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('knowra_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('knowra_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Health check
  const pingBackend = useCallback(async () => {
    try {
      const res = await authApi.checkHealth();
      setBackendHealth({ online: res.success === true, checking: false });
    } catch {
      setBackendHealth({ online: false, checking: false });
    }
  }, []);

  useEffect(() => {
    pingBackend();
    checkAuth();
  }, [checkAuth, pingBackend]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('knowra_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async ({ name, email, password, role = 'student' }) => {
    const res = await authApi.register({ name, email, password, role });
    if (res.success) {
      // Auto-login after registration
      return login(email, password);
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('knowra_token');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role = 'student') => {
    const demoEmail = role === 'student' ? 'student_test@example.com' : 'sharma_teacher@example.com';
    const demoPassword = 'Password123!';
    try {
      return await login(demoEmail, demoPassword);
    } catch {
      // If demo user doesn't exist, register them
      await register({
        name: role === 'student' ? 'Demo Student (Alex)' : 'Prof. Sharma (Teacher)',
        email: demoEmail,
        password: demoPassword,
        role,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role,
        loading,
        backendHealth,
        login,
        register,
        logout,
        demoLogin,
        refreshUser: checkAuth,
        pingBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

