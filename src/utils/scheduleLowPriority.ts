type LowPriorityOptions = {
  delay?: number;
  skipOnSlowConnection?: boolean;
  timeout?: number;
};

type NetworkInformationLike = {
  effectiveType?: string;
  saveData?: boolean;
};

function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!connection) {
    return false;
  }

  return Boolean(connection.saveData) || /(^|-)2g$/i.test(connection.effectiveType ?? "");
}

export function scheduleLowPriorityWork(
  task: () => void,
  options: LowPriorityOptions = {}
): () => void {
  const { delay = 1200, skipOnSlowConnection = false, timeout = 2000 } = options;

  if (typeof window === "undefined") {
    task();
    return () => {};
  }

  if (skipOnSlowConnection && isSlowConnection()) {
    return () => {};
  }

  let cancelled = false;

  const runTask = () => {
    if (!cancelled) {
      task();
    }
  };

  if ("requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback(runTask, { timeout });
    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }

  const timeoutId = window.setTimeout(runTask, delay);
  return () => {
    cancelled = true;
    window.clearTimeout(timeoutId);
  };
}
