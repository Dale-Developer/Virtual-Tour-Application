import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  initDB, loadSession, loginUser, registerUser, saveSession, clearSession, getUserById,
} from '../db/database';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        setUser(await loadSession());
      } catch (e) {
        setError(e.message);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await loginUser(email, password);
    await saveSession(u.id);
    setUser(u);
  }, []);

  const register = useCallback(async (data) => {
    const u = await registerUser(data);
    await saveSession(u.id);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  /** Reload the signed-in user from the database (after editing the profile). */
  const refreshUser = async () => {
    if (user) setUser(await getUserById(user.id));
  };

  return (
    <AuthContext.Provider value={{ user, ready, error, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
