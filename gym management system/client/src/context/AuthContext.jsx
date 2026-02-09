import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const API = "http://localhost:5000/api";

  // Restore session if token exists
  useEffect(() => {
    const restore = async () => {
      if (!token) return;

      // START: HARDCODED OWNER SESSION RESTORE
      if (token === "owner-token-8925782356") {
        setUser({ name: "Prem", phone: "8925782356", role: "owner" });
        return;
      }
      // END: HARDCODED OWNER SESSION RESTORE

      try {
        const res = await fetch(`${API}/members/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.member);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session restore failed', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    };

    restore();
  }, [token]);

  // REGISTER
  const registerUser = async (form) => {
    try {
      const res = await fetch(`${API}/members/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
        setUser(data.member);
        nav("/dashboard");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // LOGIN (PHONE + PASSWORD)
  const login = async (phone, password) => {
    // START: HARDCODED OWNER LOGIN LOGIC
    // This explicitly checks for the phone number and the password 'premfreak'
    if (phone === "8925782356" && password === "premfreak") {
      const ownerUser = { name: "Prem", phone: "8925782356", role: "owner" };
      const ownerToken = "owner-token-8925782356";

      localStorage.setItem('token', ownerToken);
      setToken(ownerToken);
      setUser(ownerUser);
      
      nav("/owner-dashboard"); 
      return;
    }
    // END: HARDCODED OWNER LOGIN LOGIC

    try {
      const res = await fetch(`${API}/members/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
        setUser(data.member);
        nav("/dashboard");
      } else {
        alert(data.message || "Invalid phone number or password");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // Update profile (protected)
  const updateProfile = async (updates) => {
    if (!token) return alert('Not authenticated');
    try {
      const res = await fetch(`${API}/members/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.member);
        return true;
      }
      alert(data.message || 'Update failed');
      return false;
    } catch (err) {
      console.error('Update failed', err);
      alert('Server error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setToken(null);
    nav("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, token, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);