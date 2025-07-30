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
import { Progress } from "@/src/components/ui/progress";
import { AuthGuard } from "@/src/components/AuthGuard";
import { BudgetAlert } from "@/src/components/BudgetAlert";
import { Budget, BudgetFormData } from "@/src/types/budget";
import { Transaction } from "@/src/types/transaction";
import {
  subscribeToBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
} from "@/src/lib/budgets";
import { subscribeToTransactions } from "@/src/lib/transactions";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/hooks/use-toast";
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/src/types/transaction";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.number().min(0.01, "Limit must be greater than 0"),
  period: z.enum(["weekly", "monthly", "yearly"]),
});

export default function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      limit: 0,
      period: "monthly",
    },
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribeBudgets = subscribeToBudgets(user.uid, (budgets) => {
      setBudgets(budgets);
      setLoading(false);
    });

    const unsubscribeTransactions = subscribeToTransactions(
      user.uid,
      (transactions) => {
        setTransactions(transactions);
      },
    );

    return () => {
      unsubscribeBudgets();
      unsubscribeTransactions();
    };
  }, [user]);

  // Calculate spent amount for each budget
  const budgetsWithSpent = budgets.map((budget) => {
    const now = new Date();
    let startDate: Date;

    switch (budget.period) {
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === budget.category &&
          t.date >= startDate,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return { ...budget, spent };
  });

  const handleAddBudget = async (data: BudgetFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    const { error } = await addBudget(user.uid, data);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Budget created successfully!",
      });
      setIsAddDialogOpen(false);
      reset();
    }

    setIsSubmitting(false);
  };

  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return;

    setIsSubmitting(true);
    const { error } = await updateBudget(editingBudget.id, data);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Budget updated successfully!",
      });
      setIsEditDialogOpen(false);
      setEditingBudget(null);
      reset();
    }

    setIsSubmitting(false);
  };

  const handleDeleteBudget = async (budget: Budget) => {
    setBudgetToDelete(budget);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return;

    const { error } = await deleteBudget(budgetToDelete.id);

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Budget deleted successfully!",
      });
    }

    setIsDeleteDialogOpen(false);
    setBudgetToDelete(null);
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setValue("category", budget.category);
    setValue("limit", budget.limit);
    setValue("period", budget.period);
    setIsEditDialogOpen(true);
  };

  const onSubmit = editingBudget ? handleUpdateBudget : handleAddBudget;

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex">
          <main className="ml-0 flex-1 p-6 md:ml-64">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 rounded bg-gray-200"></div>
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
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Budget Goals
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Set and track your spending limits
                </p>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={watch("category")}
                        onValueChange={(value) => setValue("category", value)}
                      >
                        <SelectTrigger
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="limit">Budget Limit</Label>
                      <Input
                        id="limit"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("limit", { valueAsNumber: true })}
                        className={errors.limit ? "border-red-500" : ""}
                      />
                      {errors.limit && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.limit.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="period">Period</Label>
                      <Select
                        value={watch("period")}
                        onValueChange={(value) =>
                          setValue(
                            "period",
                            value as "weekly" | "monthly" | "yearly",
                          )
                        }
                      >
                        <SelectTrigger
                          className={errors.period ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.period && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.period.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setIsEditDialogOpen(false);
                          setEditingBudget(null);
                          reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? "Saving..."
                          : editingBudget
                            ? "Update Budget"
                            : "Create Budget"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Budget Alerts */}
            <div className="mb-8">
              <div className="space-y-3">
                {budgetsWithSpent
                  .filter((b) => b.spent >= b.limit * 0.8)
                  .map((budget) => (
                    <BudgetAlert key={budget.id} budget={budget} />
                  ))}
              </div>
            </div>

            {/* Budget Cards */}
            {budgetsWithSpent.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-4 text-gray-500">No budgets set up yet</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Budget
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {budgetsWithSpent.map((budget) => {
                  const percentage = (budget.spent / budget.limit) * 100;
                  const isOverBudget = percentage >= 100;
                  const isWarning = percentage >= 80;

                  return (
                    <Card
                      key={budget.id}
                      className={`${
                        isOverBudget
                          ? "border-red-200 bg-red-50 dark:bg-red-950"
                          : isWarning
                            ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950"
                            : "border-green-200 bg-green-50 dark:bg-green-950"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {budget.category}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(budget)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBudget(budget)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 capitalize dark:text-gray-400">
                          {budget.period} budget
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Spent</span>
                            <span className="font-medium">
                              ${budget.spent.toFixed(2)} / $
                              {budget.limit.toFixed(2)}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className={`h-2 ${
                              isOverBudget
                                ? "bg-red-200"
                                : isWarning
                                  ? "bg-yellow-200"
                                  : "bg-green-200"
                            }`}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{percentage.toFixed(1)}% used</span>
                            <span>
                              ${(budget.limit - budget.spent).toFixed(2)}{" "}
                              remaining
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger
                  className={errors.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="limit">Budget Limit</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("limit", { valueAsNumber: true })}
                className={errors.limit ? "border-red-500" : ""}
              />
              {errors.limit && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.limit.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="period">Period</Label>
              <Select
                value={watch("period")}
                onValueChange={(value) =>
                  setValue("period", value as "weekly" | "monthly" | "yearly")
                }
              >
                <SelectTrigger
                  className={errors.period ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.period && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.period.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingBudget(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update Budget"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget for{" "}
              <span className="font-semibold">{budgetToDelete?.category}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBudget}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Budget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  );
}
