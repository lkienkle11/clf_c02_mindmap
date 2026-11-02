<script lang="ts">
  import { clamp, truncate } from './text';

  type Tone = 'done' | 'current' | 'todo';

  interface Props {
    /** Centre of the pill. */
    x: number;
    y: number;
    /** y of the fishbone spine this leaf hangs from. */
    spineY: number;
    side: 'above' | 'below';
    /** Visible text, already containing any ✓ / ▶ / 🔒 prefix. */
    label: string;
    /** Accessible name: title + status (never colour only). */
    ariaLabel: string;
    tone: Tone;
    dashed?: boolean;
    disabled?: boolean;
    /** Visible explanation shown next to a disabled leaf. */
    reason?: string;
    canvasWidth: number;
    onactivate: () => void;
  }

  let { x, y, spineY, side, label, ariaLabel, tone, dashed = false, disabled = false, reason, canvasWidth, onactivate }: Props = $props();

  const HEIGHT = 24;
  const shown = $derived(truncate(label, 18));
  const width = $derived(Math.min(120, Math.max(64, shown.length * 6.3 + 20)));
  const stemFrom = $derived(side === 'above' ? spineY - 5 : spineY + 5);
  const stemTo = $derived(side === 'above' ? y + HEIGHT / 2 : y - HEIGHT / 2);
  const reasonHalf = $derived(reason ? (reason.length * 5.4) / 2 : 0);
  const reasonX = $derived(clamp(x, 4 + reasonHalf, canvasWidth - 4 - reasonHalf));
  const reasonY = $derived(side === 'above' ? y - HEIGHT / 2 - 8 : y + HEIGHT / 2 + 14);

  const pillTones: Record<Tone | 'disabled', string> = {
    done: 'fill-leaf-done-soft stroke-leaf-done',
    current: 'fill-leaf-next-soft stroke-leaf-next',
    todo: 'fill-background stroke-border',
    disabled: 'fill-leaf-locked-soft stroke-border',
  };
  const textTones: Record<Tone | 'disabled', string> = {
    done: 'fill-leaf-done-ink',
    current: 'fill-leaf-next-ink',
    todo: 'fill-leaf-locked-ink',
    disabled: 'fill-leaf-locked-ink',
  };
  const key = $derived(disabled ? 'disabled' : tone);

  function activate(): void {
    if (!disabled) onactivate();
  }

  function onkeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  }
</script>

<line x1={x} y1={stemFrom} x2={x} y2={stemTo} class={tone === 'done' ? 'stroke-leaf-done' : tone === 'current' ? 'stroke-leaf-next' : 'stroke-border'} stroke-width="2" />
<g
  role="button"
  tabindex="0"
  aria-label={ariaLabel}
  aria-disabled={disabled ? 'true' : undefined}
  class={['group outline-none', disabled ? 'cursor-not-allowed' : 'cursor-pointer']}
  onclick={activate}
  {onkeydown}
>
  <title>{ariaLabel}</title>
  <rect
    x={x - width / 2 - 4}
    y={y - HEIGHT / 2 - 4}
    width={width + 8}
    height={HEIGHT + 8}
    rx="16"
    class="fill-none stroke-ring opacity-0 group-focus-visible:opacity-100"
    stroke-width="2.5"
  />
  <rect
    x={x - width / 2}
    y={y - HEIGHT / 2}
    {width}
    height={HEIGHT}
    rx="12"
    class={pillTones[key]}
    stroke-width={tone === 'current' && !disabled ? 2.5 : 1.5}
    stroke-dasharray={dashed ? '4 3' : undefined}
  />
  <text {x} y={y + 4} text-anchor="middle" font-size="11" font-weight={tone === 'current' ? 700 : 500} class={textTones[key]}>{shown}</text>
</g>
{#if reason}
  <text x={reasonX} y={reasonY} text-anchor="middle" font-size="10" class="fill-muted-foreground" aria-hidden="true">{reason}</text>
{/if}
