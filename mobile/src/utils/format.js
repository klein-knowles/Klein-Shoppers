export function money(value) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0
  }).format(value);
}

export function stars(rating) {
  const full = Math.round(rating);
  return `${"*".repeat(full)}${"-".repeat(5 - full)}`;
}
