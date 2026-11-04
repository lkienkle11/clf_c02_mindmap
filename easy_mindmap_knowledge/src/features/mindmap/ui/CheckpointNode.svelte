<svelte:options namespace="svg" />

<script lang="ts">
  import type { CheckpointState } from '@/features/exam';
  import { getI18n } from '@/i18n/i18n.svelte';

  interface Props {
    /** 1-based checkpoint group number. */
    groupIndex: number;
    /** Centre of the node on the trunk. */
    x: number;
    y: number;
    state: CheckpointState;
    onopen: (groupIndex: number) => void;
  }

  let { groupIndex, x, y, state, onopen }: Props = $props();

  const W = 150;
  const H = 44;
  const i18n = getI18n();
  const locked = $derived(state === 'locked');
  const label = $derived(i18n.t('mindmap.checkpoint.label', { group: groupIndex }));
  const stateText = $derived(
    i18n.t(
      state === 'locked'
        ? 'mindmap.checkpoint.state.locked'
        : state === 'available'
          ? 'mindmap.checkpoint.state.available'
          : 'mindmap.checkpoint.state.passed',
    ),
  );
  const reason = $derived(i18n.t('mindmap.checkpoint.lockedReason', { group: groupIndex }));
  const ariaLabel = $derived(locked ? `${label}, ${stateText}. ${reason}` : `${label}, ${stateText}`);
  const icons = { locked: '🔒', available: '▶', passed: '✓' } as const;
  const tones = {
    locked: 'fill-leaf-locked-soft stroke-border',
    available: 'fill-leaf-next-soft stroke-leaf-next',
    passed: 'fill-leaf-done-soft stroke-leaf-done',
  } as const;
  const inks = { locked: 'fill-leaf-locked-ink', available: 'fill-leaf-next-ink', passed: 'fill-leaf-done-ink' } as const;

  function activate(): void {
    if (!locked) onopen(groupIndex);
  }

  function onkeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  }
</script>

<g
  role="button"
  tabindex="0"
  aria-label={ariaLabel}
  aria-disabled={locked ? 'true' : undefined}
  class={['group outline-none', locked ? 'cursor-not-allowed' : 'cursor-pointer']}
  onclick={activate}
  {onkeydown}
>
  <title>{locked ? reason : ariaLabel}</title>
  <rect
    x={x - W / 2 - 4}
    y={y - H / 2 - 4}
    width={W + 8}
    height={H + 8}
    rx="16"
    class="fill-none stroke-ring opacity-0 group-focus-visible:opacity-100"
    stroke-width="2.5"
  />
  <rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx="12" class={tones[state]} stroke-width="2.5" stroke-dasharray={locked ? '5 4' : undefined} />
  <text x={x - W / 2 + 20} y={y + 5} text-anchor="middle" font-size="15" class={inks[state]}>{icons[state]}</text>
  <text x={x - W / 2 + 38} y={y - 2} font-size="12" font-weight="700" class={inks[state]}>{label}</text>
  <text x={x - W / 2 + 38} y={y + 13} font-size="10" class={inks[state]}>{stateText}</text>
</g>
