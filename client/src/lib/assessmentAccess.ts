const STORAGE_KEY = "userAssessmentIds";

export function getStoredAssessmentIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const storedIds: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(storedIds)) return [];
    return storedIds.filter(
      (id): id is number => Number.isInteger(id) && id > 0,
    );
  } catch {
    return [];
  }
}

export function hasAssessmentAccess(assessmentId: number): boolean {
  return (
    Number.isInteger(assessmentId) &&
    getStoredAssessmentIds().includes(assessmentId)
  );
}
