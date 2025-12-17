import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "jobapp_user";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);

  // Load userId from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const { value, expires } = JSON.parse(stored);

      if (Date.now() > expires) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setUserIdState(value);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Wrapped setter that also updates localStorage
  const setUserId = (id: string | null) => {
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY);
      setUserIdState(null);
      return;
    }

    const payload = {
      value: id,
      expires: Date.now() + ONE_DAY_MS,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setUserIdState(id);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
