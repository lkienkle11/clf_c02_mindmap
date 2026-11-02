<svelte:options namespace="svg" />

<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import MenuPopup from './MenuPopup.svelte';
  import type { MenuEntry } from './MenuPopup.svelte';

  interface Props {
    /** Top-left of the 44px button, in SVG units. */
    x: number;
    y: number;
    topicTitle: string;
    /** Why practising is not possible right now; the Redo entry is disabled with this text. */
    practiceReason?: string;
    onredo: () => void;
    onlessons: () => void;
    onhistory: () => void;
  }

  let { x, y, topicTitle, practiceReason, onredo, onlessons, onhistory }: Props = $props();

  const i18n = getI18n();
  let open = $state(false);
  let button = $state<HTMLButtonElement>();
  const label = $derived(i18n.t('mindmap.menu.open', { topic: topicTitle }));
  const entries = $derived<MenuEntry[]>([
    { id: 'redo', label: i18n.t('mindmap.menu.redo'), disabled: practiceReason !== undefined, reason: practiceReason },
    { id: 'lessons', label: i18n.t('mindmap.menu.lessons') },
    { id: 'history', label: i18n.t('mindmap.menu.history') },
  ]);

  function select(id: string): void {
    open = false;
    if (id === 'redo') onredo();
    else if (id === 'lessons') {
      onlessons();
      button?.focus();
    } else if (id === 'history') onhistory();
  }

  function onkeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open = true;
    }
  }
</script>

<foreignObject {x} {y} width="44" height="44">
  <button
    bind:this={button}
    type="button"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label={label}
    class="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-xl leading-none text-surface-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    onclick={() => (open = !open)}
    {onkeydown}
  ><span aria-hidden="true">⋯</span></button>
</foreignObject>

{#if open && button}
  <MenuPopup
    {label}
    {entries}
    anchor={button}
    onselect={select}
    onclose={(restoreFocus) => {
      open = false;
      if (restoreFocus) button?.focus();
    }}
  />
{/if}
