import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats button text to sentence case (only first word capitalized)
 * This is the standard for CTA buttons in the design system
 * @param text - The text to format
 * @returns Formatted sentence case text
 */
export function formatButtonText(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
