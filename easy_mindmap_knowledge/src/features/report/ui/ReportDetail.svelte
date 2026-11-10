<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { ReportRow } from '@/persistence';
  import Button from '@/ui/Button.svelte';
  import { formatDateTime } from './format';
  import { STATUS_KEY, TYPE_KEY } from './labels';
  import { renderReportMarkdown } from './render-markdown';
  import ReportImage from './ReportImage.svelte';

  interface Props {
    services: Services;
    report: ReportRow;
    /** True while the status is being saved. */
    busy: boolean;
    /** True when the last status change could not be saved. */
    failed: boolean;
    onstatus: (status: 'new' | 'handled') => void;
    onclose: () => void;
  }

  let { services, report, busy, failed, onstatus, onclose }: Props = $props();

  const i18n = getI18n();
  const uid = $props.id();

  // The catalog is bundled content: a question or lesson removed since the report was filed is simply absent.
  /** Below the `lg` breakpoint the pane sits under the whole list, so bring it into view and put focus on it. */
  function reveal(heading: HTMLElement): void {
    if (typeof window.matchMedia !== 'function' || window.matchMedia('(min-width: 1024px)').matches) return;
    heading.scrollIntoView?.({ block: 'start' });
    heading.focus();
  }

  const questionText = $derived(services.catalog.questions.find((q) => q.id === report.questionId)?.text);
  const lessonTitle = $derived(services.catalog.lessons.find((l) => l.id === report.lessonId)?.title[i18n.locale]);
  const refs = $derived.by(() => {
    const out: { label: string; value: string; title?: string; lang?: string }[] = [];
    if (report.questionId !== null) out.push({ label: i18n.t('report.ref.question'), value: report.questionId, title: questionText, lang: 'en' });
    if (report.lessonId !== null) out.push({ label: i18n.t('report.ref.lesson'), value: report.lessonId, title: lessonTitle });
    if (report.attemptId !== null) out.push({ label: i18n.t('report.ref.attempt'), value: report.attemptId });
    if (report.position !== null) out.push({ label: i18n.t('report.ref.position'), value: String(report.position + 1) });
    if (report.selected !== null) out.push({ label: i18n.t('report.ref.selected'), value: report.selected.join(', ') });
    if (report.optionOrder !== null) out.push({ label: i18n.t('report.ref.optionOrder'), value: report.optionOrder.join(', ') });
    if (report.isCorrect !== null) out.push({ label: i18n.t('report.ref.result'), value: i18n.t(report.isCorrect ? 'report.ref.correct' : 'report.ref.wrong') });
    if (report.sourceScreen !== null) out.push({ label: i18n.t('report.ref.screen'), value: report.sourceScreen });
    out.push({ label: i18n.t('report.ref.version'), value: report.appVersion });
    out.push({ label: i18n.t('report.ref.language'), value: report.locale });
    out.push({ label: i18n.t('report.ref.created'), value: formatDateTime(report.createdAt, i18n.locale) });
    out.push({ label: i18n.t('report.ref.updated'), value: formatDateTime(report.statusUpdatedAt, i18n.locale) });
    return out;
  });
</script>

<section aria-labelledby="{uid}-title" class="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-4">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h2 id="{uid}-title" tabindex="-1" class="text-lg font-semibold" {@attach reveal}>{i18n.t('report.detail.title')}</h2>
    <Button variant="ghost" onclick={onclose}>{i18n.t('report.detail.close')}</Button>
  </div>
  <p class="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
    <span class="font-medium text-foreground">{i18n.t(TYPE_KEY[report.type])}</span>
    <span>{i18n.t(STATUS_KEY[report.status])}</span>
  </p>

  <div class="flex flex-col gap-1">
    <h3 class="text-sm font-semibold text-muted-foreground">{i18n.t('report.detail.body')}</h3>
    <!-- Only the output of renderReportMarkdown reaches {@html}: it escapes raw HTML and drops links and images. -->
    <div class="break-words [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6">{@html renderReportMarkdown(report.body)}</div>
  </div>

  {#if report.images.length > 0}
    <div class="flex flex-col gap-2">
      <h3 class="text-sm font-semibold text-muted-foreground">{i18n.t('report.detail.images')}</h3>
      {#each report.images as path, i (path)}
        <ReportImage {services} {path} n={i + 1} />
      {/each}
    </div>
  {/if}

  <div class="flex flex-col gap-1">
    <h3 class="text-sm font-semibold text-muted-foreground">{i18n.t('report.detail.refs')}</h3>
    <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {#each refs as ref (ref.label)}
        <dt class="text-muted-foreground">{ref.label}</dt>
        <dd class="break-words">
          {#if ref.title}<span lang={ref.lang} class="block font-medium">{ref.title}</span>{/if}
          <span class="font-mono">{ref.value}</span>
        </dd>
      {/each}
    </dl>
  </div>

  {#if failed}
    <p role="alert" class="font-medium text-danger">{i18n.t('report.detail.updateFailed')}</p>
  {/if}
  <div class="flex">
    {#if report.status === 'new'}
      <Button disabled={busy} onclick={() => onstatus('handled')}>{i18n.t('report.detail.markHandled')}</Button>
    {:else}
      <Button variant="secondary" disabled={busy} onclick={() => onstatus('new')}>{i18n.t('report.detail.reopen')}</Button>
    {/if}
  </div>
</section>
