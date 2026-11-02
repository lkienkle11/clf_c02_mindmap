<script lang="ts">
  import { cn } from './cn';

  interface Props {
    value: number;
    label?: string;
    class?: string;
  }

  let { value, label, class: className }: Props = $props();

  const pct = $derived(Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0))));
</script>

<div
  role="progressbar"
  aria-label={label}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={pct}
  class={cn('h-3 w-full overflow-hidden rounded-full bg-muted', className)}
>
  <div
    class="h-full rounded-full bg-water transition-[width] duration-500 ease-out motion-reduce:transition-none"
    style:width="{pct}%"
  ></div>
</div>
