"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { Language, TRANSLATIONS } from "@/lib/i18n";

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  currentRole: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS.bn;
  switchUserRole: (userId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  liveEvent: any | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("bn"); // Default Bangla as requested
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [liveEvent, setLiveEvent] = useState<any | null>(null);

  const t = TRANSLATIONS[language];

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAllUsers(data.allUsers || []);
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
      eventSource = new EventSource("/api/v1/realtime");
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

  const switchUserRole = async (userId: string) => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ switchUserId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        currentRole: currentUser?.role || "farmer",
        language,
        setLanguage,
        t,
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
