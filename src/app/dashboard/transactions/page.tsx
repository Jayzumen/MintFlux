"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { AuthGuard } from "@/src/components/AuthGuard";
import { TransactionForm } from "@/src/components/TransactionForm";
import {
  Transaction,
  TransactionFormData,
  RecurringTransaction,
} from "@/src/types/transaction";
import {
  subscribeToTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
} from "@/src/lib/transactions";
import {
  addRecurringTransaction,
  subscribeToRecurringTransactions,
  deleteRecurringTransaction,
  getNextOccurrenceDate,
} from "@/src/lib/recurring-transactions";
import {
  exportTransactionsToCSV,
  exportTransactionsToXLSX,
  importTransactionsFromFile,
  downloadCSV,
  downloadXLSX,
} from "@/src/lib/csv";
import { useAuth } from "@/src/hooks/useAuth";
import { useUserSettings } from "@/src/hooks/useUserSettings";
import { useToast } from "@/src/hooks/use-toast";
import { useRecurringProcessor } from "@/src/hooks/useRecurringProcessor";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Trash,
  FileSpreadsheet,
  Filter,
  SortAsc,
  SortDesc,
  Repeat,
  CalendarIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Label } from "@/src/components/ui/label";
import { Calendar } from "@/src/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { formatCurrency } = useUserSettings();
  const { toast } = useToast();
  const { processNow } = useRecurringProcessor();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState({
    type: "all" as "all" | "income" | "expense",
    category: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">(
    "date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Calendar state
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | undefined>(
    undefined,
  );
  const [selectedDateTo, setSelectedDateTo] = useState<Date | undefined>(
    undefined,
  );
  const [isDateFromCalendarOpen, setIsDateFromCalendarOpen] = useState(false);
  const [isDateToCalendarOpen, setIsDateToCalendarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribeTransactions = subscribeToTransactions(
      user.uid,
      (transactions) => {
        setTransactions(transactions);
        setLoading(false);
      },
    );

    const unsubscribeRecurring = subscribeToRecurringTransactions(
      user.uid,
      (recurringTransactions) => {
        setRecurringTransactions(recurringTransactions);
      },
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeRecurring();
    };
  }, [user]);

  const handleAddTransaction = async (data: TransactionFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Add the regular transaction
      const { error: transactionError } = await addTransaction(user.uid, data);

      if (transactionError) {
        toast({
          title: "Error",
          description: transactionError,
          variant: "destructive",
        });
        return;
      }

      // If it's a recurring transaction, create the recurring template
      if (data.isRecurring && data.recurringFrequency) {
        const recurringData = {
          amount: data.amount,
          type: data.type,
          category: data.category,
          description: data.description,
          startDate: data.date,
          frequency: data.recurringFrequency,
          endDate: data.recurringEndDate || null,
          isActive: true,
          lastProcessedDate: data.date,
        };

        const { error: recurringError } = await addRecurringTransaction(
          user.uid,
          recurringData,
        );

        if (recurringError) {
          toast({
            title: "Warning",
            description:
              "Transaction added but recurring setup failed: " + recurringError,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Recurring transaction added successfully!",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Transaction added successfully!",
        });
      }

      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
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

  const handleDeleteRecurringTransaction = async (id: string) => {
    const { error } = await deleteRecurringTransaction(id);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Recurring transaction deleted successfully!",
      });
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (!user) return;

    const { error } = await deleteAllTransactions(user.uid);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "All transactions deleted successfully!",
      });
    }

    setIsDeleteAllDialogOpen(false);
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(transactions);
    downloadCSV(csvContent, "transactions.csv");
    toast({
      title: "Success",
      description: "Transactions exported to CSV successfully!",
    });
  };

  const handleExportXLSX = () => {
    const excelBlob = exportTransactionsToXLSX(transactions);
    downloadXLSX(excelBlob, "transactions.xlsx");
    toast({
      title: "Success",
      description: "Transactions exported to Excel successfully!",
    });
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const importedTransactions = await importTransactionsFromFile(file);

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
          "Failed to import transactions. Please check that your file is a valid CSV or Excel file with the required columns (Date, Type, Category, Description, Amount).",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  // Filter and sort logic
  const filteredAndSortedTransactions = transactions
    .filter((transaction) => {
      // Type filter
      if (filters.type !== "all" && transaction.type !== filters.type) {
        return false;
      }

      // Category filter
      if (
        filters.category !== "all" &&
        transaction.category !== filters.category
      ) {
        return false;
      }

      // Date range filter
      if (selectedDateFrom) {
        if (transaction.date < selectedDateFrom) {
          return false;
        }
      }

      if (selectedDateTo) {
        const toDate = new Date(selectedDateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (transaction.date > toDate) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = transaction.description
          .toLowerCase()
          .includes(searchLower);
        const matchesCategory = transaction.category
          .toLowerCase()
          .includes(searchLower);
        if (!matchesDescription && !matchesCategory) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const clearFilters = () => {
    setFilters({
      type: "all",
      category: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
    setSelectedDateFrom(undefined);
    setSelectedDateTo(undefined);
  };

  const getAvailableCategories = () => {
    const categories = new Set<string>();
    transactions.forEach((transaction) => {
      categories.add(transaction.category);
    });
    return Array.from(categories).sort();
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={transactions.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportXLSX}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV/Excel
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>

                <Button
                  variant="outline"
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                  disabled={transactions.length === 0}
                  className="border-red-200 text-red-600 hover:border-red-300 hover:text-red-700"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete All
                </Button>

                <Button
                  variant="outline"
                  onClick={async () => {
                    await processNow();
                    toast({
                      title: "Success",
                      description: "Recurring transactions processed!",
                    });
                  }}
                  disabled={recurringTransactions.length === 0}
                >
                  <Repeat className="mr-2 h-4 w-4" />
                  Process Recurring
                </Button>

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

            {/* Filter and Sort Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Sort
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {showFilters && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Search descriptions or categories..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) =>
                          setFilters({
                            ...filters,
                            type: value as "all" | "income" | "expense",
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) =>
                          setFilters({ ...filters, category: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {getAvailableCategories().map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="text-sm font-medium">Sort By</label>
                      <div className="mt-1 flex gap-1">
                        <Select
                          value={sortBy}
                          onValueChange={(value) =>
                            setSortBy(
                              value as "date" | "amount" | "description",
                            )
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="description">
                              Description
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          }
                        >
                          {sortOrder === "asc" ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>Date From</Label>
                      <Popover
                        open={isDateFromCalendarOpen}
                        onOpenChange={setIsDateFromCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "mt-1 w-full justify-start text-left font-normal",
                              !selectedDateFrom && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateFrom
                              ? format(selectedDateFrom, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateFrom}
                            onSelect={(date: Date | undefined) => {
                              setSelectedDateFrom(date);
                              setIsDateFromCalendarOpen(false);
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Date To</Label>
                      <Popover
                        open={isDateToCalendarOpen}
                        onOpenChange={setIsDateToCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "mt-1 w-full justify-start text-left font-normal",
                              !selectedDateTo && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDateTo
                              ? format(selectedDateTo, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateTo}
                            onSelect={(date: Date | undefined) => {
                              setSelectedDateTo(date);
                              setIsDateToCalendarOpen(false);
                            }}
                            disabled={(date: Date) =>
                              selectedDateFrom ? date < selectedDateFrom : false
                            }
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {filters.type !== "all" ||
                  filters.category !== "all" ||
                  filters.search ||
                  selectedDateFrom ||
                  selectedDateTo
                    ? `Filtered Transactions (${filteredAndSortedTransactions.length})`
                    : `All Transactions (${transactions.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAndSortedTransactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="mb-4 text-gray-500">
                      {transactions.length === 0
                        ? "No transactions yet"
                        : "No transactions match your filters"}
                    </p>
                    {transactions.length === 0 ? (
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Transaction
                      </Button>
                    ) : (
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedTransactions.map((transaction) => (
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
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
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

            {/* Recurring Transactions Section */}
            {recurringTransactions.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Repeat className="h-5 w-5" />
                    Recurring Transactions ({recurringTransactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recurringTransactions.map((recurringTransaction) => (
                      <div
                        key={recurringTransaction.id}
                        className="flex items-center justify-between rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                recurringTransaction.type === "income"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium">
                                {recurringTransaction.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {recurringTransaction.category} •{" "}
                                {recurringTransaction.frequency} •{" "}
                                {recurringTransaction.startDate.toLocaleDateString()}
                                {recurringTransaction.endDate &&
                                  ` - ${recurringTransaction.endDate.toLocaleDateString()}`}
                              </p>
                              {recurringTransaction.isActive ? (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  Next:{" "}
                                  {getNextOccurrenceDate(
                                    recurringTransaction.startDate,
                                    recurringTransaction.frequency,
                                    recurringTransaction.lastProcessedDate,
                                  ).toLocaleDateString()}
                                </p>
                              ) : (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                  Ended on:{" "}
                                  {recurringTransaction.endDate?.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`font-medium ${
                              recurringTransaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {recurringTransaction.type === "income" ? "+" : "-"}
                            {formatCurrency(recurringTransaction.amount)}
                          </span>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteRecurringTransaction(
                                  recurringTransaction.id,
                                )
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
                </CardContent>
              </Card>
            )}
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

      {/* Delete All Confirmation Dialog */}
      <AlertDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Transactions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {transactions.length}{" "}
              transactions? This action cannot be undone and will permanently
              remove all your transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllTransactions}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All Transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
}
