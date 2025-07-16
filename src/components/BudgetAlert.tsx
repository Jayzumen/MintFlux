"use client";

import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Budget } from "@/src/types/budget";

interface BudgetAlertProps {
  budget: Budget;
}

export const BudgetAlert: React.FC<BudgetAlertProps> = ({ budget }) => {
  const percentage = (budget.spent / budget.limit) * 100;

  if (percentage < 80) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">
          {budget.category} Budget On Track
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          You've spent ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}{" "}
          ({percentage.toFixed(1)}%)
        </AlertDescription>
      </Alert>
    );
  }

  if (percentage < 100) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          {budget.category} Budget Warning
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          You've spent ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}{" "}
          ({percentage.toFixed(1)}%)
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
      <XCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800 dark:text-red-200">
        {budget.category} Budget Exceeded
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-300">
        You've spent ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)} (
        {percentage.toFixed(1)}%)
      </AlertDescription>
    </Alert>
  );
};
