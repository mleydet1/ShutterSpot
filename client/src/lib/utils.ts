import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatString: string = "MMM dd, yyyy"): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
}

export function formatTime(time: string, formatString: string = "h:mm a"): string {
  if (!time) return "";
  // If time is in HH:MM:SS format, convert to Date
  if (time.includes(":")) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return format(date, formatString);
  }
  return "";
}

export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
} {
  switch (status) {
    case "confirmed":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "deposit_paid":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    case "pending":
      return { bg: "bg-amber-100", text: "text-amber-800" };
    case "completed":
      return { bg: "bg-indigo-100", text: "text-indigo-800" };
    case "cancelled":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "sent":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    case "viewed":
      return { bg: "bg-purple-100", text: "text-purple-800" };
    case "accepted":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "declined":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "expired":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    case "paid":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "partial":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "overdue":
      return { bg: "bg-red-100", text: "text-red-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
