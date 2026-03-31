/**
 * Format a number as a currency string (USD by default)
 */
export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discounted price
 */
export function applyDiscount(price: number, discountPercent: number): number {
  return price - (price * discountPercent) / 100;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/**
 * Get status badge color class (Tailwind)
 */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:    "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED:    "bg-purple-100 text-purple-800",
    DELIVERED:  "bg-green-100 text-green-800",
    CANCELLED:  "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}
