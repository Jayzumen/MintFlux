"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { AuthGuard } from "@/src/components/AuthGuard";
import { TransactionForm } from "@/src/components/TransactionForm";
import { Transaction, TransactionFormData } from "@/src/types/transaction";
import {
  subscribeToTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/src/lib/transactions";
import {
  exportTransactionsToCSV,
  importTransactionsFromCSV,
  downloadCSV,
} from "@/src/lib/csv";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/use-toast";
import { Plus, Edit, Trash2, Download, Upload } from "lucide-react";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTransactions(user.uid, (transactions) => {
      setTransactions(transactions);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleAddTransaction = async (data: TransactionFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    const { error } = await addTransaction(user.uid, data);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction added successfully!",
      });
      setIsAddDialogOpen(false);
    }

    setIsSubmitting(false);
  };

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;

    setIsSubmitting(true);
    const { error } = await updateTransaction(editingTransaction.id, data);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction updated successfully!",
      });
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    }

    setIsSubmitting(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await deleteTransaction(id);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(transactions);
    downloadCSV(csvContent, "transactions.csv");
    toast({
      title: "Success",
      description: "Transactions exported successfully!",
    });
  };

  const handleImportCSV = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const importedTransactions = await importTransactionsFromCSV(file);

      for (const transactionData of importedTransactions) {
        await addTransaction(user.uid, transactionData);
      }

      toast({
        title: "Success",
        description: `${importedTransactions.length} transactions imported successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to import transactions. Please check the file format.",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex">
          <main className="ml-0 flex-1 p-6 md:ml-64">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="h-64 rounded bg-gray-200"></div>
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
                  Transactions
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Manage your income and expenses
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  disabled={transactions.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>

                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>

                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                      onSubmit={handleAddTransaction}
                      onCancel={() => setIsAddDialogOpen(false)}
                      isSubmitting={isSubmitting}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="mb-4 text-gray-500">No transactions yet</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                transaction.type === "income"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {transaction.category} •{" "}
                                {transaction.date.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`font-medium ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}$
                            {transaction.amount.toFixed(2)}
                          </span>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              initialData={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingTransaction(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
