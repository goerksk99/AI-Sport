/** Calendar dates are local dates, never UTC slices (avoids day shifts). */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function localDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
export function isDateKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    dateKey(localDate(key)) === key
  );
}
export const weekdayIndex = (date: Date) => (date.getDay() + 6) % 7;
