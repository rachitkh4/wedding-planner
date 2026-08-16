const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatINR(amount: number | string): string {
  return inrFormatter.format(Number(amount));
}

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

export function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}
