import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 dark:focus:ring-blue-700/30",
  // border color
  "focus:border-blue-500 dark:focus:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
];

export const userRoles = [
  {
    label: "Super Administrador",
    value: "SUPER_ADMIN",
  },
  {
    label: "Administrador",
    value: "ADMIN",
  },
  {
    label: "Empleado",
    value: "EMPLOYEE",
  },
  {
    label: "Inversionista",
    value: "INVESTOR",
  },
  {
    label: "Cliente",
    value: "CLIENT",
  },
];

export function convertToCSV<TData>(
  data: TData[],
  columns: {
    header: string;
    accessorKey: string;
    accessorFn?: any;
  }[],
  separator = ";"
): string {
  // Get headers and ensure they are properly encoded
  const headers = columns.map((column) => {
    // Escape values that contain commas or quotes
    const header = column.header;
    if (header.includes(separator) || header.includes('"')) {
      return `"${header.replace(/"/g, '""')}"`;
    }
    return header;
  });

  // Get rows
  const rows = data.map((row) => {
    return columns.map((column) => {
      const accessorKey = column.accessorKey.replace("_", ".");
      // Split the accessorKey by dots to handle nested properties
      const keys = accessorKey.split(".");

      // Access nested properties using reduce
      const value = column.accessorFn
        ? column.accessorFn(row)
        : keys.reduce((obj, key) => obj?.[key], row as any);

      // Handle different value types
      let formattedValue = value;

      if (value === null || value === undefined) {
        formattedValue = "";
      } else if (typeof value === "object") {
        formattedValue = JSON.stringify(value);
      } else if (typeof value === "boolean") {
        formattedValue = value ? "true" : "false";
      } else if (typeof value === "number") {
        formattedValue = value.toString();
      }

      // Escape values that contain commas or quotes
      if (
        typeof formattedValue === "string" &&
        (formattedValue.includes(separator) || formattedValue.includes('"'))
      ) {
        return `"${formattedValue.replace(/"/g, '""')}"`;
      }

      return formattedValue;
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(separator),
    ...rows.map((row) => row.join(separator)),
  ].join("\n");

  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string) {
  // Add BOM to ensure Excel recognizes the file as UTF-8
  const BOM = "\uFEFF";
  const csvContentWithBOM = BOM + csvContent;

  // Create blob with UTF-8 encoding
  const blob = new Blob([csvContentWithBOM], {
    type: "text/csv;charset=utf-8",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(
  amount: number,
  language: string,
  currency: string = "COP",
  abbreviated: boolean = false
) {
  if (abbreviated) {
    return formatCurrencyAbbreviated(amount, language, currency);
  }
  
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatCurrencyAbbreviated(
  amount: number,
  language: string,
  currency: string = "COP"
) {
  const absAmount = Math.abs(amount);
  let abbreviatedAmount: number;
  let suffix: string;

  if (absAmount >= 1_000_000_000_000) {
    // Trillones
    abbreviatedAmount = amount / 1_000_000_000_000;
    suffix = language === "es" ? "T" : "T";
  } else if (absAmount >= 1_000_000_000) {
    // Miles de millones / Billones
    abbreviatedAmount = amount / 1_000_000_000;
    suffix = language === "es" ? "mil M" : "B";
  } else if (absAmount >= 1_000_000) {
    // Millones
    abbreviatedAmount = amount / 1_000_000;
    suffix = "M";
  } else if (absAmount >= 1_000) {
    // Miles
    abbreviatedAmount = amount / 1_000;
    suffix = "K";
  } else {
    // Números pequeños, formato normal
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  // Formatear el número abreviado con 1-2 decimales máximo
  const formattedNumber = new Intl.NumberFormat(language, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: abbreviatedAmount % 1 === 0 ? 0 : (abbreviatedAmount < 10 ? 2 : 1),
  }).format(abbreviatedAmount);

  return `${formattedNumber}${suffix}`;
}

export function getCurrencySymbol(
  language: string,
  currency: string = "COP"
): string {
  return (
    new Intl.NumberFormat(language, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value || currency
  );
}

export function formatCurrencyParts(
  amount: number,
  language: string,
  currency: string = "COP"
) {
  const formatter = new Intl.NumberFormat(language, {
    style: "currency",
    currency: currency,
  });

  const parts = formatter.formatToParts(amount);
  const symbol =
    parts.find((part) => part.type === "currency")?.value || currency;
  const value = parts
    .filter((part) => part.type !== "currency")
    .map((part) => part.value)
    .join("");

  return {
    formatted: formatter.format(amount),
    symbol,
    value: value.trim(),
    parts,
  };
}

export function formatDate(
  date: string,
  language: string,
  hour: boolean = false
) {
  return new Date(date).toLocaleDateString(language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: hour ? "2-digit" : undefined,
    minute: hour ? "2-digit" : undefined,
    second: hour ? "2-digit" : undefined,
  });
}
