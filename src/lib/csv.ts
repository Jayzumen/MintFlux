import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Transaction } from "@/src/types/transaction";

// Helper function to parse dates from various formats
const parseDate = (dateValue: any): Date => {
  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // If it's a number (Excel date), convert it
  if (typeof dateValue === "number") {
    // Excel dates are number of days since 1900-01-01
    // Convert to milliseconds since 1970-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return new Date(
      excelEpoch.getTime() + (dateValue - 2) * millisecondsPerDay,
    );
  }

  // If it's a string, try to parse it
  if (typeof dateValue === "string") {
    // Try ISO format first (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return new Date(dateValue + "T00:00:00");
    }

    // Try other common formats
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // If all else fails, return current date
  console.warn(`Could not parse date: ${dateValue}, using current date`);
  return new Date();
};

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
            date: parseDate(row.Date),
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

export const importTransactionsFromXLSX = (xlsxFile: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with date parsing
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: "yyyy-mm-dd",
        });

        const transactions = jsonData
          .filter((row: any) => row.Date && row.Amount)
          .map((row: any) => ({
            date: parseDate(row.Date),
            type: row.Type?.toLowerCase() === "income" ? "income" : "expense",
            category: row.Category || "Other",
            description: row.Description || "",
            amount: parseFloat(row.Amount) || 0,
          }));

        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"));
    };

    reader.readAsArrayBuffer(xlsxFile);
  });
};

export const importTransactionsFromFile = (file: File): Promise<any[]> => {
  const fileExtension = file.name.toLowerCase().split(".").pop();

  switch (fileExtension) {
    case "csv":
      return importTransactionsFromCSV(file);
    case "xlsx":
    case "xls":
      return importTransactionsFromXLSX(file);
    default:
      throw new Error(
        `Unsupported file format: ${fileExtension}. Please use CSV or Excel files.`,
      );
  }
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

export const exportTransactionsToXLSX = (transactions: Transaction[]): Blob => {
  const data = transactions.map((transaction) => ({
    Date: transaction.date.toISOString().split("T")[0],
    Type: transaction.type,
    Category: transaction.category,
    Description: transaction.description,
    Amount: transaction.amount,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const downloadXLSX = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
