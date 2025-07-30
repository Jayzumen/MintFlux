import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { recurringProcessor } from "@/src/lib/recurring-processor";

export const useRecurringProcessor = () => {
  const { user } = useAuth();
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      // Process immediately when user logs in
      recurringProcessor.processRecurringTransactions(user.uid);

      // Set up periodic processing (every hour)
      intervalIdRef.current = recurringProcessor.startPeriodicProcessing(
        user.uid,
        60,
      );
    }

    return () => {
      // Clean up when user logs out or component unmounts
      if (intervalIdRef.current) {
        recurringProcessor.stopPeriodicProcessing(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [user]);

  // Manual trigger function for testing or immediate processing
  const processNow = async () => {
    if (user) {
      await recurringProcessor.processRecurringTransactions(user.uid);
    }
  };

  return { processNow };
};
