<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { Question } from '@/content/types';
  import type { PracticeSession, SessionQuestion } from '../session.svelte';
  import { badgeKey, optionState, type OptionState } from '@/features/practice/logic/option-state';
  import { cn } from '@/ui/cn';

  interface Props {
    session: PracticeSession;
    item: SessionQuestion;
    question: Question;
    onfailed: () => void;
  }

  let { session, item, question, onfailed }: Props = $props();

  const i18n = getI18n();
  const textOf = (key: string): string => question.options.find((o) => o.key === key)?.text ?? key;
  let group = $state<HTMLElement>();
  const hintId = $derived(`hint-${item.position}`);

  /** Selection changes are saved immediately; on failure the session rolled back, so resync the DOM to it. */
  async function choose(keys: string[]): Promise<void> {
    try {
      await session.select(item.position, keys);
    } catch {
      const now = session.questions[item.position]?.selected ?? [];
      for (const input of group?.querySelectorAll<HTMLInputElement>('input') ?? []) input.checked = now.includes(input.value);
      onfailed();
    }
  }

  function toggle(key: string, on: boolean): Promise<void> {
    const rest = item.selected.filter((k) => k !== key);
    return choose(on ? [...rest, key] : rest);
  }

  const row = 'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border-subtle bg-surface p-3 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-muted';
  /** Revealed marks are important so they win over the checked-state colours in `row`. */
  const stateRow: Record<OptionState, string> = {
    right: 'border-leaf-done! bg-leaf-done-soft!',
    missed: 'border-leaf-done! bg-leaf-done-soft!',
    wrong: 'border-danger!',
    none: '',
  };

  /** Nothing is marked during the attempt; a revealed question marks each option from the catalog answer. */
  function stateOf(key: string): OptionState {
    return item.revealed ? optionState(question.correct, item.selected, key) : 'none';
  }
  function badge(state: Exclude<OptionState, 'none'>): string {
    return badgeKey(state).map((k) => i18n.t(k)).join(' · ');
  }
</script>

<fieldset class="flex flex-col gap-3" aria-describedby={item.multi ? hintId : undefined}>
  <legend lang="en" tabindex="-1" class="mb-3 text-lg font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-ring">{question.text}</legend>
  {#if item.multi}
    <p id={hintId} class="font-medium text-muted-foreground">{i18n.t('practice.chooseMany', { count: question.correct.length })}</p>
  {/if}
  <div bind:this={group} class="flex flex-col gap-2">
    {#each item.optionOrder as key (key)}
      {@const state = stateOf(key)}
      {@const eliminated = item.eliminated.includes(key)}
      {@const note = state === 'none' ? undefined : question.optionNotes?.[key]}
      <label class={cn(row, eliminated && 'line-through opacity-60', stateRow[state])}>
        {#if item.multi}
          <input class="mt-0.5 size-5" type="checkbox" name={`q-${item.position}`} value={key} disabled={eliminated} checked={item.selected.includes(key)} onchange={(e) => toggle(key, e.currentTarget.checked)} />
        {:else}
          <input class="mt-0.5 size-5" type="radio" name={`q-${item.position}`} value={key} disabled={eliminated} checked={item.selected.includes(key)} onchange={() => choose([key])} />
        {/if}
        <span class="flex flex-col gap-1" lang="en">
          <span lang="en">{textOf(key)}</span>
          {#if eliminated}<span class="sr-only" lang={i18n.locale}>{i18n.t('practice.help.eliminatedLabel')}</span>{/if}
          {#if state !== 'none'}
            <span class={cn('w-fit rounded px-2 py-0.5 text-xs font-semibold', state === 'wrong' ? 'text-danger' : 'text-leaf-done-ink')}>
              <span aria-hidden="true">{state === 'wrong' ? '✗' : '✓'}</span> <span lang={i18n.locale}>{badge(state)}</span>
            </span>
          {/if}
          {#if note}<span class="text-sm text-muted-foreground">{note}</span>{/if}
        </span>
      </label>
    {/each}
  </div>
  {#if item.revealed}
    <div class="flex flex-col gap-1">
      <h3 class="text-sm text-muted-foreground">{i18n.t('practice.result.explanation')}</h3>
      {#if question.explanation}
        <p lang="en">{question.explanation}</p>
      {:else}
        <p class="text-muted-foreground">{i18n.t('practice.help.noExplanation')}</p>
      {/if}
    </div>
  {/if}
</fieldset>
