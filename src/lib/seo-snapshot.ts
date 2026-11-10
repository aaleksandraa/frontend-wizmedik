const SNAPSHOT_ID = 'seo-snapshot';

export type SeoSnapshotPhase = 'loading' | 'ready' | 'not_found' | 'unavailable';

export function doctorSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/doktor\/([^/]+)\/?$/);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function classifyDoctorLoadError(error: unknown): 'not_found' | 'unavailable' {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404 ? 'not_found' : 'unavailable';
}

export function classifyDoctorPayload(data: unknown): 'ready' | 'unavailable' {
  if (!data || typeof data !== 'object') return 'unavailable';

  const doctor = data as { ime?: unknown; prezime?: unknown };
  const hasName = typeof doctor.ime === 'string' && doctor.ime.trim() !== '';
  const hasSurname = typeof doctor.prezime === 'string' && doctor.prezime.trim() !== '';
  return hasName && hasSurname ? 'ready' : 'unavailable';
}

export type ProfileShell =
  | 'snapshot-only'
  | 'skeleton'
  | 'profile'
  | 'not-found'
  | 'unavailable'
  | 'unavailable-with-snapshot';

type ReconcileOptions = {
  slug?: string;
  phase: SeoSnapshotPhase;
  doctorName?: string;
};

function snapshotElement(doc: Document): HTMLElement | null {
  const element = doc.getElementById(SNAPSHOT_ID);
  return element instanceof HTMLElement ? element : null;
}

export function snapshotSlug(doc: Document = document): string | null {
  return snapshotElement(doc)?.getAttribute('data-doctor-slug') || null;
}

export function snapshotMatchesSlug(slug: string | undefined, doc: Document = document): boolean {
  if (!slug) return false;
  return snapshotSlug(doc) === slug;
}

export function profileShell(phase: SeoSnapshotPhase, hasMatchingSnapshot: boolean): ProfileShell {
  if (phase === 'loading') {
    return hasMatchingSnapshot ? 'snapshot-only' : 'skeleton';
  }
  if (phase === 'not_found') return 'not-found';
  if (phase === 'unavailable') {
    return hasMatchingSnapshot ? 'unavailable-with-snapshot' : 'unavailable';
  }
  return 'profile';
}

function headingMatchesDoctor(doc: Document, doctorName: string): boolean {
  const normalizedName = doctorName.trim().toLowerCase();
  if (!normalizedName) return false;

  return Array.from(doc.querySelectorAll('#root h1')).some((heading) =>
    (heading.textContent || '').trim().toLowerCase().includes(normalizedName)
  );
}

function removeSnapshot(snapshot: HTMLElement, doc: Document): void {
  const active = doc.activeElement;
  const moveFocus = active instanceof Node && snapshot.contains(active);
  const nextHeading = doc.querySelector('#root h1');
  snapshot.remove();

  if (moveFocus && nextHeading instanceof HTMLElement) {
    if (!nextHeading.hasAttribute('tabindex')) {
      nextHeading.setAttribute('tabindex', '-1');
    }
    nextHeading.focus();
  }
}

export function reconcileSeoSnapshot(
  { slug, phase, doctorName }: ReconcileOptions,
  doc: Document = document
): 'kept' | 'removed' | 'absent' {
  const snapshot = snapshotElement(doc);
  if (!snapshot) return 'absent';

  const matchesRoute = Boolean(slug) && snapshot.getAttribute('data-doctor-slug') === slug;
  if (!matchesRoute || phase === 'not_found') {
    removeSnapshot(snapshot, doc);
    return 'removed';
  }

  if (phase === 'ready' && headingMatchesDoctor(doc, doctorName || '')) {
    removeSnapshot(snapshot, doc);
    return 'removed';
  }

  return 'kept';
}
