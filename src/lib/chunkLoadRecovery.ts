const CHUNK_RELOAD_KEY = 'wizmedik_chunk_reload';

const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'loading chunk',
  'unable to preload css',
  'importing a module script failed',
  'dynamically imported module',
  'error loading dynamically imported module',
];

export function isChunkLoadError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message =
    typeof error === 'object' && 'message' in error
      ? String(error.message).toLowerCase()
      : String(error).toLowerCase();

  return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Reload once per tab session when a stale hashed asset is missing after deploy.
 * Returns true when a reload was triggered.
 */
export function reloadOnceForStaleChunk(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1') {
      return false;
    }

    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

export function clearChunkReloadFlag(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Best-effort only.
  }
}

export function registerChunkLoadRecoveryHandlers(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnceForStaleChunk();
  });
}
