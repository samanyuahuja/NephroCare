const STORAGE_KEY = "nephrocareReportCapabilities";

export interface AssessmentReference {
  publicId: string;
  accessToken: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getStoredAssessmentReferences(): AssessmentReference[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is AssessmentReference => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return typeof candidate.publicId === "string" && UUID.test(candidate.publicId)
        && typeof candidate.accessToken === "string" && candidate.accessToken.length >= 40;
    }).slice(-25);
  } catch {
    return [];
  }
}

export function storeAssessmentReference(reference: AssessmentReference): void {
  const withoutDuplicate = getStoredAssessmentReferences().filter(({ publicId }) => publicId !== reference.publicId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...withoutDuplicate, reference].slice(-25)));
  window.dispatchEvent(new CustomEvent("assessmentReferencesUpdated"));
}

export function getAssessmentReference(publicId: string): AssessmentReference | undefined {
  return getStoredAssessmentReferences().find((reference) => reference.publicId === publicId);
}

export function removeAssessmentReference(publicId: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(getStoredAssessmentReferences().filter((reference) => reference.publicId !== publicId)),
  );
  window.dispatchEvent(new CustomEvent("assessmentReferencesUpdated"));
}

export function authorizedHeaders(reference: AssessmentReference): HeadersInit {
  return { Authorization: `Bearer ${reference.accessToken}` };
}
