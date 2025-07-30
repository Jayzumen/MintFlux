"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getUserSettings } from "@/src/lib/settings";
import { UserSettings } from "@/src/types/settings";

interface UserSettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getCurrencySymbol: () => string;
  formatCurrency: (amount: number) => string;
}

export const UserSettingsContext = createContext<
  UserSettingsContextType | undefined
>(undefined);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useUserSettings must be used within a UserSettingsProvider",
    );
  }
  return context;
};

interface UserSettingsProviderProps {
  children: React.ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      const userSettings = await getUserSettings(user.uid);
      setSettings(userSettings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const getCurrencySymbol = () => {
    if (!settings?.preferences?.currency) return "$";

    const currency = settings.preferences.currency.toUpperCase();
    const currencySymbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
    };

    return currencySymbols[currency] || currency;
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol();
    return `${symbol}${amount.toFixed(2)}`;
  };

  const value: UserSettingsContextType = {
    settings,
    loading,
    refreshSettings,
    getCurrencySymbol,
    formatCurrency,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};
