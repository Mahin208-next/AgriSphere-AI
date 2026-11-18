"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { Language, TRANSLATIONS } from "@/lib/i18n";
import { getApiUrl } from "@/lib/api";

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS.bn;
  login: (userId: string) => Promise<boolean>;
  loginByRole: (role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  adminLogin: (passkey: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  switchUserRole: (userId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  liveEvent: any | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("bn");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [liveEvent, setLiveEvent] = useState<any | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const t = TRANSLATIONS[language];

  const fetchUserData = async () => {
    try {
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("krishisetu_user_id") : null;
      const adminToken = typeof window !== "undefined" ? sessionStorage.getItem("krishisetu_admin_auth") : null;

      let fetchUrl = "/api/v1/auth/me";
      if (storedUserId) {
        fetchUrl += `?userId=${encodeURIComponent(storedUserId)}`;
      }

      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.allUsers || []);

        // Only set currentUser if user was explicitly logged in
        if (storedUserId && data.user) {
          setCurrentUser(data.user);
        } else if (adminToken === "true" && data.user?.role === "admin") {
          setCurrentUser(data.user);
          setIsAdminAuthenticated(true);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user auth:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen to Server-Sent Events (SSE) for real-time auction bidding & procurement updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(getApiUrl("/api/v1/realtime"));
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLiveEvent(parsed);
        } catch (e) {
          // ignore heartbeats
        }
      };

      eventSource.addEventListener("bid_placed", (event: any) => {
        try {
          const parsed = JSON.parse(event.data);
          setLiveEvent(parsed);
        } catch (e) {}
      });

      eventSource.addEventListener("offer_submitted", (event: any) => {
        try {
          const parsed = JSON.parse(event.data);
          setLiveEvent(parsed);
        } catch (e) {}
      });
    } catch (e) {
      console.warn("SSE connection error", e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Standard User Login by User ID
  const login = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ switchUserId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("krishisetu_user_id", userId);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // Standard User Login by Role (Selects demo seed user for that role)
  const loginByRole = async (role: UserRole): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login_by_role", role }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("krishisetu_user_id", data.user.id);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login by role failed:", err);
      return false;
    }
  };

  // Standard User Logout
  const logout = async () => {
    try {
      await fetch("/api/v1/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCurrentUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("krishisetu_user_id");
        sessionStorage.removeItem("krishisetu_admin_auth");
      }
      setIsAdminAuthenticated(false);
    }
  };

  // Admin Specific Gateway Login
  const adminLogin = async (passkey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin_login", passkey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setIsAdminAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("krishisetu_admin_auth", "true");
        }
        return { success: true };
      }
      return { success: false, error: data.error || "Authentication failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  // Admin Logout
  const adminLogout = async () => {
    await logout();
  };

  // Switch role when logged in
  const switchUserRole = async (userId: string) => {
    await login(userId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        currentRole: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === "admin" && isAdminAuthenticated,
        language,
        setLanguage,
        t,
        login,
        loginByRole,
        logout,
        adminLogin,
        adminLogout,
        switchUserRole,
        refreshUserData: fetchUserData,
        liveEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
