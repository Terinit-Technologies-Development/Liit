/**
 * Localisation & Formatting Helpers
 * Default locale: en-ZA (Johannesburg, South Africa / ZAR)
 */

export function formatCurrency(
  amountMinor: number,
  currency: string = "ZAR",
  locale: string = "en-ZA",
): string {
  const amountMajor = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountMajor);
}

export function formatDate(
  isoString: string,
  formatStyle: "short" | "medium" | "long" = "medium",
  locale: string = "en-ZA",
): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const options: Intl.DateTimeFormatOptions =
    formatStyle === "short"
      ? { day: "numeric", month: "short" }
      : formatStyle === "long"
        ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        : { day: "numeric", month: "short", year: "numeric" };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatTime(
  isoString: string,
  locale: string = "en-ZA",
): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatPlural(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
