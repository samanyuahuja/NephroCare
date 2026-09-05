const STORAGE_KEY = "userAssessmentIds";
const MAX_ASSESSMENT_ID = 2147483647;
const MAX_STORED_ASSESSMENTS = 100;

export function parseAssessmentId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const assessmentId = Number(value);
  return Number.isSafeInteger(assessmentId) &&
    assessmentId > 0 &&
    assessmentId <= MAX_ASSESSMENT_ID
    ? assessmentId
    : null;
}

export function getStoredAssessmentIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const storedIds: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(storedIds)) return [];
    const validIds = storedIds.filter(
      (id): id is number =>
        Number.isInteger(id) && id > 0 && id <= MAX_ASSESSMENT_ID,
    );
    return Array.from(new Set(validIds)).slice(-MAX_STORED_ASSESSMENTS);
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
