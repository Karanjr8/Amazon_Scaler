const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format a numeric amount as Indian Rupees (₹) with en-IN grouping. */
export function formatInr(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "₹0";
  return inrFormatter.format(n);
}
