/** App-wide success toasts. Features push an i18n key; the app shell renders them in the shared NoticeStack. */
export interface Toast {
  id: number;
  key: string;
}

export const TOAST_MS = 4000;

class ToastStore {
  items = $state.raw<Toast[]>([]);
  #seq = 0;

  show(key: string): void {
    const id = ++this.#seq;
    this.items = [...this.items, { id, key }];
    setTimeout(() => this.dismiss(id), TOAST_MS);
  }

  dismiss(id: number): void {
    this.items = this.items.filter((t) => t.id !== id);
  }

  clear(): void {
    this.items = [];
  }
}

export const toasts = new ToastStore();
