"use client";

import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChange } from "@/src/lib/auth";

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
