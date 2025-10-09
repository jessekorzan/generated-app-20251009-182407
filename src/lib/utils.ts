import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns";
import { Tag } from "@shared/types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDate(dateString: string, formatStr = "MMMM d, yyyy") {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error("Invalid date string for formatDate:", dateString);
    return "Invalid Date";
  }
}
export function getTagColors(color: Tag['color']) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return colorMap[color] || colorMap.gray;
}