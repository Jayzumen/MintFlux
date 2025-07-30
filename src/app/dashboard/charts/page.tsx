"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/src/components/AuthGuard";
import dynamic from "next/dynamic";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Transaction } from "@/src/types/transaction";
import {
  subscribeToTransactions,
  getTransactionsByDateRange,
} from "@/src/lib/transactions";
import { useAuth } from "@/src/hooks/useAuth";

const ChartWrapper = dynamic(
  () => import("@/src/components/ChartWrapper").then((mod) => mod.ChartWrapper),
  { ssr: false },
);

export default function ChartsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<"all" | "month" | "year">(
    "year",
  );

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTransactions(user.uid, (transactions) => {
      setTransactions(transactions);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const filterTransactions = async () => {
      if (!user) return;

      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (dateFilter) {
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          setFilteredTransactions(transactions);
          return;
      }

      const filtered = await getTransactionsByDateRange(
        user.uid,
        startDate,
        endDate,
      );
      setFilteredTransactions(filtered);
    };

    filterTransactions();
  }, [user, transactions, dateFilter]);

  const displayTransactions =
    dateFilter === "all" ? transactions : filteredTransactions;

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex">
          <main className="ml-0 flex-1 p-6 md:ml-64">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="h-64 rounded bg-gray-200"></div>
                <div className="h-64 rounded bg-gray-200"></div>
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
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Financial Charts
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Visualize your financial data
                </p>
              </div>

              <div className="mt-4 flex gap-2 md:mt-0">
                <Button
                  variant={dateFilter === "all" ? "default" : "outline"}
                  onClick={() => setDateFilter("all")}
                >
                  All Time
                </Button>
                <Button
                  variant={dateFilter === "month" ? "default" : "outline"}
                  onClick={() => setDateFilter("month")}
                >
                  This Month
                </Button>
                <Button
                  variant={dateFilter === "year" ? "default" : "outline"}
                  onClick={() => setDateFilter("year")}
                >
                  This Year
                </Button>
              </div>
            </div>

            {displayTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <p className="mb-4 text-gray-500">
                      No transactions available for the selected time period
                    </p>
                    <Button onClick={() => setDateFilter("all")}>
                      View All Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Expense Categories Pie Chart */}
                <ChartWrapper
                  transactions={displayTransactions}
                  type="pie"
                  title="Expense Categories Distribution"
                />

                {/* Income vs Expenses Bar Chart */}
                <ChartWrapper
                  transactions={displayTransactions}
                  type="bar"
                  title="Monthly Income vs Expenses"
                />

                {/* Trends Line Chart */}
                <ChartWrapper
                  transactions={displayTransactions}
                  type="line"
                  title="Financial Trends Over Time"
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
