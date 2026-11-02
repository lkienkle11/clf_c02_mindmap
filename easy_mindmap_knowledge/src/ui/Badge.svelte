<script lang="ts">
  import { cn } from './cn';

  type Tone = 'done' | 'next' | 'locked' | 'review';

  interface Props {
    tone: Tone;
    label: string;
    class?: string;
  }

  let { tone, label, class: className }: Props = $props();

  const tones: Record<Tone, string> = {
    done: 'bg-leaf-done-soft text-leaf-done-ink',
    next: 'bg-leaf-next-soft text-leaf-next-ink',
    locked: 'bg-leaf-locked-soft text-leaf-locked-ink',
    review: 'bg-leaf-review-soft text-leaf-review-ink',
  };

  const symbols: Partial<Record<Tone, string>> = { done: '✓', next: '▶', locked: '🔒' };
  const symbol = $derived(symbols[tone]);
</script>

<span
  class={cn(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium',
    tones[tone],
    className,
  )}
>
  {#if symbol}<span data-symbol aria-hidden="true">{symbol}</span>{/if}
  <span>{label}</span>
</span>
