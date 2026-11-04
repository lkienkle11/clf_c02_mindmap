<script lang="ts">
  import type { Question } from '@/content/types';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { cn } from '@/ui/cn';

  interface Props {
    question: Question | undefined;
    selected: string[];
    /** Order the options were shown in; falls back to the question's own order. */
    optionOrder?: string[];
  }

  let { question, selected, optionOrder }: Props = $props();
  const i18n = getI18n();

  const ordered = $derived.by(() => {
    if (!question) return [];
    const byKey = new Map(question.options.map((o) => [o.key, o]));
    const keys = (optionOrder ?? []).filter((k) => byKey.has(k));
    const rest = question.options.map((o) => o.key).filter((k) => !keys.includes(k));
    return [...keys, ...rest].map((k) => byKey.get(k)!);
  });

  type State = 'right' | 'wrong' | 'missed' | 'none';
  function stateOf(key: string): State {
    const picked = selected.includes(key);
    const correct = question?.correct.includes(key) ?? false;
    if (picked) return correct ? 'right' : 'wrong';
    return correct ? 'missed' : 'none';
  }
  function badge(state: State): string {
    const picked = i18n.t('practice.result.badge.picked');
    if (state === 'right') return `${picked} · ${i18n.t('practice.result.badge.correct')}`;
    if (state === 'wrong') return `${picked} · ${i18n.t('practice.result.badge.wrong')}`;
    return i18n.t('practice.result.badge.missed');
  }
</script>

{#if question}
  <section class="flex flex-col gap-2">
    <h3 class="text-sm text-muted-foreground">{i18n.t('practice.result.options')}</h3>
    {#if selected.length === 0}
      <p class="font-medium text-muted-foreground">{i18n.t('practice.result.noAnswer')}</p>
    {/if}
    <ul lang="en" class="flex flex-col gap-2">
      {#each ordered as option (option.key)}
        {@const state = stateOf(option.key)}
        {@const note = state === 'none' ? undefined : question.optionNotes?.[option.key]}
        <li
          data-option={option.key}
          class={cn(
            'flex flex-col gap-1 rounded-md border p-3',
            state === 'right' || state === 'missed' ? 'border-leaf-done bg-leaf-done-soft' : state === 'wrong' ? 'border-danger' : 'border-border-subtle',
          )}
        >
          <span>{option.text}</span>
          {#if state !== 'none'}
            <span class={cn('w-fit rounded px-2 py-0.5 text-xs font-semibold', state === 'wrong' ? 'text-danger' : 'text-leaf-done-ink')}>
              {state === 'wrong' ? '✗' : '✓'} <span lang={i18n.locale}>{badge(state)}</span>
            </span>
          {/if}
          {#if note}<p class="text-sm text-muted-foreground">{note}</p>{/if}
        </li>
      {/each}
    </ul>
    {#if question.explanation}
      <div>
        <h3 class="text-sm text-muted-foreground">{i18n.t('practice.result.explanation')}</h3>
        <p lang="en">{question.explanation}</p>
      </div>
    {/if}
  </section>
{/if}
