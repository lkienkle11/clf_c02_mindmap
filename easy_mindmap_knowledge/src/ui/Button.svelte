<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { cn } from './cn';

  type Variant = 'primary' | 'secondary' | 'ghost';

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    children?: Snippet;
  }

  let { variant = 'primary', class: className, type = 'button', children, ...rest }: Props = $props();

  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'border border-border bg-surface text-surface-foreground hover:bg-muted',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
  };
</script>

<button
  {type}
  class={cn(
    'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</button>
