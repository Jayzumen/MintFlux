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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import {
  RecurringTransaction,
  RecurringTransactionChange,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/src/types/transaction";
import { getEffectiveValues } from "@/src/lib/recurring-transactions";
import { Calendar } from "./ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const editSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  endDate: z.date().optional().nullable(),
});

type EditFormData = z.infer<typeof editSchema>;

interface EditRecurringTransactionFormProps {
  recurringTransaction: RecurringTransaction;
  onSubmit: (
    change: RecurringTransactionChange,
    endDate?: Date | null,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const EditRecurringTransactionForm: React.FC<
  EditRecurringTransactionFormProps
> = ({ recurringTransaction, onSubmit, onCancel, isSubmitting = false }) => {
  const currentValues = getEffectiveValues(
    recurringTransaction,
    new Date(),
  );

  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [isEffectiveDateOpen, setIsEffectiveDateOpen] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(
    recurringTransaction.endDate || null,
  );
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      amount: currentValues.amount,
      type: currentValues.type,
      category: currentValues.category,
      description: currentValues.description,
      endDate: recurringTransaction.endDate || null,
    },
  });

  const watchType = watch("type");
  const categories =
    watchType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onFormSubmit = async (data: EditFormData) => {
    const change: RecurringTransactionChange = {
      effectiveDate,
    };

    if (data.amount !== currentValues.amount) change.amount = data.amount;
    if (data.type !== currentValues.type) change.type = data.type;
    if (data.category !== currentValues.category)
      change.category = data.category;
    if (data.description !== currentValues.description)
      change.description = data.description;

    const hasFieldChanges =
      change.amount !== undefined ||
      change.type !== undefined ||
      change.category !== undefined ||
      change.description !== undefined;

    const endDateChanged =
      endDate?.getTime() !== recurringTransaction.endDate?.getTime();

    if (!hasFieldChanges && !endDateChanged) {
      onCancel();
      return;
    }

    await onSubmit(
      hasFieldChanges ? change : { effectiveDate },
      endDateChanged ? endDate : undefined,
    );
  };

  const existingChanges = recurringTransaction.changes ?? [];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
        <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          Apply changes from
        </Label>
        <Popover
          open={isEffectiveDateOpen}
          onOpenChange={setIsEffectiveDateOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="mt-1 w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(effectiveDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={effectiveDate}
              onSelect={(date: Date | undefined) => {
                setEffectiveDate(date || new Date());
                setIsEffectiveDateOpen(false);
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
          Transactions generated on or after this date will use the new values
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="edit-amount">Amount</Label>
          <Input
            id="edit-amount"
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
          <Label htmlFor="edit-type">Type</Label>
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
        </div>
      </div>

      <div>
        <Label htmlFor="edit-category">Category</Label>
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
      </div>

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
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
        <Label>End Date (Optional)</Label>
        <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "No end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate || undefined}
              onSelect={(date: Date | undefined) => {
                setEndDate(date || null);
                setValue("endDate", date);
                setIsEndDateOpen(false);
              }}
              disabled={(date: Date) =>
                date < recurringTransaction.startDate
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
        {endDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 text-xs"
            onClick={() => {
              setEndDate(null);
              setValue("endDate", null);
            }}
          >
            Clear end date
          </Button>
        )}
      </div>

      {existingChanges.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="history">
            <AccordionTrigger className="text-sm">
              Change History ({existingChanges.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {existingChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="rounded border bg-gray-50 p-2 text-sm dark:bg-gray-800"
                  >
                    <p className="font-medium">
                      From {format(change.effectiveDate, "PPP")}
                    </p>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {change.amount !== undefined && (
                        <span className="mr-2">
                          Amount: {change.amount}
                        </span>
                      )}
                      {change.type !== undefined && (
                        <span className="mr-2">Type: {change.type}</span>
                      )}
                      {change.category !== undefined && (
                        <span className="mr-2">
                          Category: {change.category}
                        </span>
                      )}
                      {change.description !== undefined && (
                        <span>Desc: {change.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
