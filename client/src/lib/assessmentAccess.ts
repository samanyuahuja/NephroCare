const STORAGE_KEY = "userAssessmentIds";

export function hasAssessmentAccess(assessmentId: number): boolean {
  if (typeof window === "undefined" || !Number.isInteger(assessmentId)) return false;

  try {
    const storedIds: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(storedIds) && storedIds.some((id) => Number(id) === assessmentId);
  } catch {
    return false;
  }
}
