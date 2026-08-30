import { createContext, useContext, useEffect, useState } from "react";
import * as auth from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("vanshicart_token");
    if (!token) { setLoading(false); return null; }
    try {
      const { data } = await auth.me();
      setUser(data);
      return data;
    } catch {
      localStorage.removeItem("vanshicart_token");
      setUser(null);
      return null;
    } finally { setLoading(false); }
  };

  useEffect(() => { refreshUser(); }, []);

  const signIn = async (data) => {
    const response = await auth.login(data);
    const payload = response.data;
    const token = typeof payload === "string" ? payload : payload.access_token || payload.token;
    if (!token) throw new Error("Login response did not contain an access token.");
    localStorage.setItem("vanshicart_token", token);
    await refreshUser();
    return payload;
  };

  const signOut = () => {
    localStorage.removeItem("vanshicart_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);