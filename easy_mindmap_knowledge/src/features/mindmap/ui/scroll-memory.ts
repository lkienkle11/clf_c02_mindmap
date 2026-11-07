/**
 * Where the learner left the tree view (scroll position and which topic is open). Lives in module memory on purpose: it survives tab switches
 * (the canvas remounts each time) but is gone when the app restarts, so the first open re-centres.
 */
export interface TreeScroll {
  left: number;
  top: number;
}

let saved: TreeScroll | null = null;
// Which topic the learner chose to open or close; null = never chose, so the current topic is open.
let expanded: { id: string | null } | null = null;

export function rememberTreeScroll(position: TreeScroll): void {
  saved = position;
}

export function recallTreeScroll(): TreeScroll | null {
  return saved;
}

export function rememberExpandedChoice(choice: { id: string | null }): void {
  expanded = choice;
}

export function recallExpandedChoice(): { id: string | null } | null {
  return expanded;
}

/** Forget everything, as a fresh app start does. */
export function resetTreeScroll(): void {
  saved = null;
  expanded = null;
}
