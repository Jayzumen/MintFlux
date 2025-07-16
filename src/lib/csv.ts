import Papa from "papaparse";
import { Transaction } from "@/src/types/transaction";

export const exportTransactionsToCSV = (
  transactions: Transaction[],
): string => {
  const csvData = transactions.map((transaction) => ({
    Date: transaction.date.toISOString().split("T")[0],
    Type: transaction.type,
    Category: transaction.category,
    Description: transaction.description,
    Amount: transaction.amount,
  }));

  return Papa.unparse(csvData);
};

export const importTransactionsFromCSV = (csvFile: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        const transactions = results.data
          .filter((row: any) => row.Date && row.Amount)
          .map((row: any) => ({
            date: new Date(row.Date),
            type: row.Type?.toLowerCase() === "income" ? "income" : "expense",
            category: row.Category || "Other",
            description: row.Description || "",
            amount: parseFloat(row.Amount) || 0,
          }));
        resolve(transactions);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
