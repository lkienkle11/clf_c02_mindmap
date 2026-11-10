<script lang="ts">
  import { tick } from 'svelte';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { MAX_BODY, visibleLength } from '../logic/report-draft';
  import { applyFormat } from './rich-text-edit';
  import type { Format } from './rich-text-edit';

  interface Props {
    /** The markdown text. */
    value: string;
    placeholder: string;
  }

  let { value = $bindable(), placeholder }: Props = $props();

  const i18n = getI18n();
  let field = $state<HTMLTextAreaElement>();
  let limitHit = $state(false);
  // Where the caret was before the browser applied the edit, so a rejected edit can put it back.
  let caret = { start: 0, end: 0 };

  const count = $derived(visibleLength(value));

  const tools: { kind: Format; label: string; face: string }[] = [
    { kind: 'bold', label: 'report.format.bold', face: 'B' },
    { kind: 'italic', label: 'report.format.italic', face: 'I' },
    { kind: 'list', label: 'report.format.list', face: '•' },
  ];

  function rememberCaret(e: Event & { currentTarget: HTMLTextAreaElement }) {
    caret = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd };
  }

  // The limit counts visible characters, so it is checked here and not with the maxlength attribute
  // (which counts UTF-16 units and would count the markers). An edit past the limit is undone.
  function onInput(e: Event & { currentTarget: HTMLTextAreaElement }) {
    const el = e.currentTarget;
    if (visibleLength(el.value) > MAX_BODY) {
      el.value = value;
      el.setSelectionRange(caret.start, caret.end);
      limitHit = true;
      return;
    }
    limitHit = false;
    value = el.value;
  }

  async function format(kind: Format) {
    if (!field) return;
    const edit = applyFormat(value, field.selectionStart, field.selectionEnd, kind);
    if (edit) {
      value = edit.value;
      await tick();
      field.setSelectionRange(edit.start, edit.end);
    }
    field.focus();
  }
</script>

<div class="space-y-2">
  <textarea
    bind:this={field}
    {value}
    {placeholder}
    rows="6"
    aria-label={i18n.t('report.body.label')}
    class="block w-full resize-y rounded-lg border border-border bg-surface p-3 text-base text-surface-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    onbeforeinput={rememberCaret}
    oninput={onInput}
  ></textarea>
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-2" role="toolbar" aria-label={i18n.t('report.format.toolbar')}>
      {#each tools as tool (tool.kind)}
        <Button variant="secondary" class="px-3" aria-label={i18n.t(tool.label)} title={i18n.t(tool.label)} onclick={() => format(tool.kind)}>
          <span aria-hidden="true" class={tool.kind === 'italic' ? 'italic' : tool.kind === 'bold' ? 'font-bold' : ''}>{tool.face}</span>
        </Button>
      {/each}
    </div>
    <div class="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
      <!-- Only the limit note is announced; the counter changes on every keystroke. -->
      <span role="status" class="text-danger">{#if limitHit}{i18n.t('report.limitReached', { max: MAX_BODY })}{/if}</span>
      <span class="tabular-nums">{i18n.t('report.counter', { n: count, max: MAX_BODY })}</span>
    </div>
  </div>
</div>
