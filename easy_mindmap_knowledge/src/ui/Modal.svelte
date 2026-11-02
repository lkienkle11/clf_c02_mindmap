<script module lang="ts">
  /** Open modals, oldest first; only the last one reacts to the keyboard. */
  const openStack: symbol[] = [];
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tick } from 'svelte';

  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    closeOnBackdrop?: boolean;
    children?: Snippet;
  }

  let { open, title, onclose, closeOnBackdrop = false, children }: Props = $props();

  const uid = $props.id();
  const titleId = `modal-title-${uid}`;
  let dialog = $state<HTMLDivElement>();
  let opener: HTMLElement | null = null;
  const self = Symbol('modal');

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  $effect(() => {
    if (!open) return;
    openStack.push(self);
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    tick().then(() => {
      const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? dialog)?.focus();
    });
    return () => {
      const at = openStack.indexOf(self);
      if (at >= 0) openStack.splice(at, 1);
      opener?.focus();
      opener = null;
    };
  });

  // Listens on the window, not the dialog, so Escape and the Tab trap survive focus falling to body.
  function onWindowKeydown(e: KeyboardEvent) {
    if (!open || openStack.at(-1) !== self) return;
    if (e.key === 'Escape') {
      onclose();
      return;
    }
    if (e.key !== 'Tab' || !dialog) return;
    const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) {
      e.preventDefault();
      dialog.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (!dialog.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if open}
  <div
    data-testid="modal-backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
    role="presentation"
    onclick={(e) => {
      if (closeOnBackdrop && e.target === e.currentTarget) onclose();
    }}
  >
    <div
      bind:this={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabindex="-1"
      class="max-h-full w-full max-w-lg overflow-auto rounded-xl bg-surface p-6 text-surface-foreground shadow-xl focus:outline-none"
    >
      <h2 id={titleId} class="mb-4 text-xl font-semibold">{title}</h2>
      {@render children?.()}
    </div>
  </div>
{/if}
