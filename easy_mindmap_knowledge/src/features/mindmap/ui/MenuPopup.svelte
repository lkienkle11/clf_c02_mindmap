<script lang="ts">
  import { cn } from '@/ui/cn';

  export interface MenuEntry {
    id: string;
    label: string;
    disabled?: boolean;
    /** Why the entry is disabled; shown as a tooltip. */
    reason?: string;
  }

  interface Props {
    label: string;
    entries: MenuEntry[];
    /** The trigger the menu hangs from; clicks on it are not "outside". */
    anchor: HTMLElement;
    onselect: (id: string) => void;
    /** `restoreFocus` is false when the user clicked somewhere else. */
    onclose: (restoreFocus: boolean) => void;
  }

  let { label, entries, anchor, onselect, onclose }: Props = $props();

  let menu = $state<HTMLDivElement>();
  let pos = $state({ left: 0, top: 0 });
  const items = (): HTMLElement[] => [...(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

  // The menu lives on <body> (position: fixed) so no later SVG sibling can paint over it.
  const portal = (node: HTMLElement) => {
    document.body.appendChild(node);
    const r = anchor.getBoundingClientRect();
    pos = { left: Math.max(4, Math.min(r.left, window.innerWidth - 224)), top: r.bottom + 4 };
    items()[0]?.focus();
    return () => node.remove();
  };

  $effect(() => {
    const close = () => onclose(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  });

  function onkeydown(e: KeyboardEvent): void {
    const all = items();
    const at = all.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => {
      e.preventDefault();
      all[(i + all.length) % all.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(at + 1);
    else if (e.key === 'ArrowUp') go(at <= 0 ? -1 : at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(-1);
    else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      onclose(true);
    }
  }

  function outside(e: PointerEvent): void {
    const target = e.target as Node;
    if (!menu?.contains(target) && !anchor.contains(target)) onclose(false);
  }
</script>

<svelte:window onpointerdown={outside} />

<div
  bind:this={menu}
  {@attach portal}
  role="menu"
  aria-label={label}
  tabindex="-1"
  {onkeydown}
  style:left="{pos.left}px"
  style:top="{pos.top}px"
  class="fixed z-50 flex w-56 flex-col rounded-lg border border-border bg-surface p-1 text-surface-foreground shadow-lg"
>
  {#each entries as entry (entry.id)}
    <button
      type="button"
      role="menuitem"
      tabindex="-1"
      aria-disabled={entry.disabled ? 'true' : undefined}
      title={entry.disabled ? entry.reason : undefined}
      class={cn(
        'min-h-11 rounded-md px-3 text-left text-base focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
        entry.disabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer hover:bg-muted',
      )}
      onclick={() => {
        if (!entry.disabled) onselect(entry.id);
      }}
    >{entry.label}</button>
  {/each}
</div>
