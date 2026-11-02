<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { Question } from '@/content/types';
  import type { PracticeSession, SessionQuestion } from '../session.svelte';

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
</script>

<fieldset class="flex flex-col gap-3" aria-describedby={item.multi ? hintId : undefined}>
  <legend lang="en" tabindex="-1" class="mb-3 text-lg font-medium focus:outline-none focus-visible:outline-2 focus-visible:outline-ring">{question.text}</legend>
  {#if item.multi}
    <p id={hintId} class="font-medium text-muted-foreground">{i18n.t('practice.chooseMany', { count: question.correct.length })}</p>
  {/if}
  <div bind:this={group} class="flex flex-col gap-2">
    {#each item.optionOrder as key (key)}
      <label class={row}>
        {#if item.multi}
          <input class="mt-0.5 size-5" type="checkbox" name={`q-${item.position}`} value={key} checked={item.selected.includes(key)} onchange={(e) => toggle(key, e.currentTarget.checked)} />
        {:else}
          <input class="mt-0.5 size-5" type="radio" name={`q-${item.position}`} value={key} checked={item.selected.includes(key)} onchange={() => choose([key])} />
        {/if}
        <span lang="en">{textOf(key)}</span>
      </label>
    {/each}
  </div>
</fieldset>
