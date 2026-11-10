/** Tiny in-process notifier so other layers can react to a saved report without importing report internals. */
const listeners = new Set<() => void>();

/** Called by the report dialog once the report is saved. A throwing listener never stops the others. */
export function notifyReportSubmitted(): void {
  for (const cb of [...listeners]) {
    try {
      cb();
    } catch (e) {
      console.error('report listener failed', e);
    }
  }
}

/** Subscribes to saved reports; returns the unsubscribe function. */
export function onReportSubmitted(cb: () => void): () => void {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}
