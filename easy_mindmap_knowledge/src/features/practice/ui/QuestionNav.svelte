<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import { cn } from '@/ui/cn';
  import type { SessionQuestion } from '../session.svelte';

  interface Props {
    questions: readonly SessionQuestion[];
    index: number;
    ongo: (index: number) => void;
  }

  let { questions, index, ongo }: Props = $props();

  const i18n = getI18n();

  function label(q: SessionQuestion, current: boolean): string {
    const base = i18n.t(q.selected.length > 0 ? 'practice.navAnswered' : 'practice.navUnanswered', { n: q.position + 1 });
    return current ? i18n.t('practice.navCurrent', { label: base }) : base;
  }
</script>

<nav aria-label={i18n.t('practice.navLabel')}>
  <ul class="flex flex-wrap gap-2">
    {#each questions as q, i (q.position)}
      {@const current = i === index}
      {@const answered = q.selected.length > 0}
      <li>
        <button
          type="button"
          aria-label={label(q, current)}
          aria-current={current ? 'step' : undefined}
          onclick={() => ongo(i)}
          class={cn(
            'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            answered ? 'border-primary bg-muted' : 'border-border bg-surface',
            current ? 'font-bold underline decoration-2 underline-offset-4 ring-2 ring-primary' : 'font-normal',
          )}
        >
          {i + 1}{#if answered}<span aria-hidden="true">✓</span>{/if}
        </button>
      </li>
    {/each}
  </ul>
</nav>
