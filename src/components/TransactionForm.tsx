"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { CalendarIcon, Repeat } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import {
  TransactionFormData,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/src/types/transaction";
import { Switch } from "@/src/components/ui/switch";
import { Calendar } from "./ui/calendar";

const transactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["weekly", "monthly", "yearly"]).optional(),
  recurringEndDate: z.date().optional().nullable(),
});

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialData?.date || new Date(),
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    initialData?.recurringEndDate || null,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEndDateCalendarOpen, setIsEndDateCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialData?.amount || 0,
      type: initialData?.type || "expense",
      category: initialData?.category || "",
      description: initialData?.description || "",
      date: initialData?.date || new Date(),
      isRecurring: initialData?.isRecurring || false,
      recurringFrequency: initialData?.recurringFrequency || "monthly",
      recurringEndDate: initialData?.recurringEndDate || null,
    },
  });

  const watchType = watch("type");
  const watchIsRecurring = watch("isRecurring");
  const watchRecurringFrequency = watch("recurringFrequency");
  const categories =
    watchType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onFormSubmit = async (data: TransactionFormData) => {
    await onSubmit({
      ...data,
      date: selectedDate,
      recurringEndDate: selectedEndDate,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
            className={cn(errors.amount && "border-red-500")}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={watchType}
            onValueChange={(value) =>
              setValue("type", value as "income" | "expense")
            }
          >
            <SelectTrigger className={cn(errors.type && "border-red-500")}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={watch("category")}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger className={cn(errors.category && "border-red-500")}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter description..."
          {...register("description")}
          className={cn(errors.description && "border-red-500")}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <Label>Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date: Date | undefined) => {
                setSelectedDate(date || new Date());
                setValue("date", date || new Date());
                setIsCalendarOpen(false);
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Recurring Transaction Section */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            <Label htmlFor="isRecurring" className="text-base font-medium">
              Recurring Transaction
            </Label>
          </div>
          <Switch
            id="isRecurring"
            checked={watchIsRecurring}
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
          />
        </div>

        {watchIsRecurring && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recurringFrequency">Frequency</Label>
              <Select
                value={watchRecurringFrequency}
                onValueChange={(value) =>
                  setValue(
                    "recurringFrequency",
                    value as "weekly" | "monthly" | "yearly",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurringEndDate">End Date (Optional)</Label>
              <Popover
                open={isEndDateCalendarOpen}
                onOpenChange={setIsEndDateCalendarOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="recurringEndDate"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedEndDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedEndDate
                      ? format(selectedEndDate, "PPP")
                      : "No end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate || undefined}
                    onSelect={(date: Date | undefined) => {
                      setSelectedEndDate(date || null);
                      setValue("recurringEndDate", date);
                      setIsEndDateCalendarOpen(false);
                    }}
                    disabled={(date: Date) => date < selectedDate}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for unlimited recurring transactions
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Transaction"}
        </Button>
      </div>
    </form>
  );
};
