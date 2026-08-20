import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { isChunkLoadError, reloadOnceForStaleChunk } from '@/lib/chunkLoadRecovery';

type LazyModule<T extends ComponentType<unknown>> = { default: T };

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<LazyModule<T>>
): LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (isChunkLoadError(error) && reloadOnceForStaleChunk()) {
        return new Promise<LazyModule<T>>(() => {
          // Page reload in progress; keep Suspense fallback visible.
        });
      }

      throw error;
    })
  );
}
