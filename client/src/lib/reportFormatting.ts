export function formatReportDate(
  value: string | Date | null,
  locale: string,
  fallback: string,
): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  try {
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    if (error instanceof RangeError) return fallback;
    throw error;
  }
}

export function getRiskLabelClassName(riskLevel: string | null): string {
  const words = riskLevel?.trim().toLowerCase().split(/\s+/) ?? [];
  const tone = ["high", "moderate", "low"].find((value) => words.includes(value));
  return tone ? `risk-label risk-label--${tone}` : "risk-label";
}
