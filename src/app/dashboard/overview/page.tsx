"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { AuthGuard } from "@/src/components/AuthGuard";
import { ChartWrapper } from "@/src/components/ChartWrapper";
import { BudgetAlert } from "@/src/components/BudgetAlert";
import { Transaction } from "@/src/types/transaction";
import { Budget } from "@/src/types/budget";
import { subscribeToTransactions } from "@/src/lib/transactions";
import { subscribeToBudgets } from "@/src/lib/budgets";
import { useAuth } from "@/src/hooks/useAuth";
import { useUserSettings } from "@/src/hooks/useUserSettings";
import { DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { formatCurrency } = useUserSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribeTransactions = subscribeToTransactions(
      user.uid,
      (transactions) => {
        setTransactions(transactions);
        setLoading(false);
      },
    );

    const unsubscribeBudgets = subscribeToBudgets(user.uid, (budgets) => {
      setBudgets(budgets);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  }, [user]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const netWorth = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses],
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  );

  const expiredBudgets = useMemo(
    () => budgets.filter((b) => b.spent >= b.limit * 0.8),
    [budgets],
  );

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex">
          <main className="ml-0 flex-1 p-6 md:ml-64">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded bg-gray-200"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="ml-0 flex-1 p-6 md:ml-64">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Welcome back! Here's your financial overview.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(totalIncome)}
                    </span>
                    <TrendingUp className="h-6 w-6 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(totalExpenses)}
                    </span>
                    <TrendingDown className="h-6 w-6 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Net Worth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(netWorth)}
                    </span>
                    <DollarSign className="h-6 w-6 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">
                    Active Budgets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{budgets.length}</span>
                    <Target className="h-6 w-6 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Alerts */}
            {expiredBudgets.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Budget Alerts</h2>
                <div className="space-y-3">
                  {expiredBudgets.map((budget) => (
                    <BudgetAlert key={budget.id} budget={budget} />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.length === 0 ? (
                      <p className="py-8 text-center text-gray-500">
                        No transactions yet. Add your first transaction to get
                        started!
                      </p>
                    ) : (
                      recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                transaction.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expense Chart */}
              <div>
                {transactions.length > 0 && (
                  <ChartWrapper
                    transactions={transactions}
                    type="pie"
                    title="Expense Categories"
                  />
                )}
              </div>
            </div>

            {/* Monthly Trend */}
            {transactions.length > 0 && (
              <ChartWrapper
                transactions={transactions}
                type="line"
                title="Monthly Income vs Expenses"
              />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
