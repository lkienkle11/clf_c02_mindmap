<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { ReportRow, ReportStatus } from '@/persistence';
  import Button from '@/ui/Button.svelte';
  import { pageCount } from '../logic/paginate';
  import { buildReportQuery, emptyFilters } from '../logic/report-query';
  import type { ReportFilters as Filters } from '../logic/report-query';
  import type { ReportCounts } from './labels';
  import ExportBar from './ExportBar.svelte';
  import ReportDetail from './ReportDetail.svelte';
  import ReportFilters from './ReportFilters.svelte';
  import ReportList from './ReportList.svelte';
  import ReportSummary from './ReportSummary.svelte';

  interface Props {
    services: Services;
    appState: AppState;
  }

  let { services, appState }: Props = $props();

  const PAGE_SIZE = 10;
  const i18n = getI18n();

  let phase = $state<'loading' | 'ready' | 'error'>('loading');
  let filters = $state.raw<Filters>(emptyFilters());
  let page = $state(1);
  let items = $state.raw<ReportRow[]>([]);
  let total = $state(0);
  let counts = $state.raw<ReportCounts | null>(null);
  let selected = $state.raw<ReportRow | null>(null);
  let saving = $state(false);
  let saveFailed = $state(false);
  let loadSeq = 0;

  const pages = $derived(pageCount(total, PAGE_SIZE));
  const filtered = $derived(
    filters.type !== '' || filters.status !== '' || filters.from !== '' || filters.to !== '' || filters.text.trim() !== '',
  );

  /** Loads the current page and the summary; only the latest call applies its result. */
  async function load(): Promise<void> {
    const seq = ++loadSeq;
    const { reports } = services.repos;
    try {
      const [result, summary] = await Promise.all([reports.list(buildReportQuery(filters, page, PAGE_SIZE)), reports.counts()]);
      if (seq !== loadSeq) return;
      const last = pageCount(result.total, PAGE_SIZE);
      if (page > last && last > 0) {
        // The page we were on no longer exists (its last report left the filtered list).
        page = last;
        return load();
      }
      items = result.items;
      total = result.total;
      counts = summary;
      phase = 'ready';
    } catch (e) {
      console.error('Could not load the reports', e);
      if (seq === loadSeq) phase = 'error';
    }
  }

  onMount(() => {
    void load();
    void appState.refreshReportCount(); // the header badge may be stale
  });

  function changeFilters(next: Filters): void {
    filters = next;
    page = 1;
    void load();
  }

  function goToPage(next: number): void {
    page = next;
    void load();
  }

  function select(report: ReportRow): void {
    selected = report;
    saveFailed = false;
  }

  /** After a sync changed statuses behind our back: reload the lists and the open detail (by id). */
  async function reloadAfterSync(): Promise<void> {
    const id = selected?.id;
    await Promise.all([load(), appState.refreshReportCount()]);
    if (id === undefined) return;
    try {
      const fresh = await services.repos.reports.get(id);
      if (selected?.id === id && fresh) selected = fresh;
    } catch (e) {
      console.error('Could not reload the selected report', e);
    }
  }

  async function changeStatus(report: ReportRow, status: ReportStatus): Promise<void> {
    if (saving) return;
    saving = true;
    saveFailed = false;
    const at = services.now();
    try {
      await services.repos.reports.setStatus(report.id, status, at);
    } catch (e) {
      console.error('Could not update the report status', e);
      saveFailed = true;
      saving = false;
      return;
    }
    if (selected?.id === report.id) selected = { ...report, status, statusUpdatedAt: at };
    saving = false;
    await Promise.all([load(), appState.refreshReportCount()]);
  }
</script>

<section class="mx-auto flex max-w-6xl flex-col gap-6 p-4">
  <h1 class="text-2xl font-semibold">{i18n.t('report.screen.title')}</h1>
  <ExportBar {services} onchanged={() => void reloadAfterSync()} />

  {#if phase === 'loading'}
    <p role="status" class="text-muted-foreground">{i18n.t('common.loading')}</p>
  {:else if phase === 'error'}
    <div role="alert" class="flex flex-col items-start gap-3">
      <p class="font-medium text-danger">{i18n.t('report.list.loadFailed')}</p>
      <Button
        variant="secondary"
        onclick={() => {
          phase = 'loading';
          void load();
        }}>{i18n.t('common.retry')}</Button>
    </div>
  {:else}
    {#if counts}<ReportSummary {counts} />{/if}
    <ReportFilters {filters} onchange={changeFilters} />
    <div class="grid gap-6 lg:grid-cols-2">
      <ReportList
        {items}
        emptyKey={filtered ? 'report.list.empty' : 'report.list.none'}
        {page}
        {pages}
        selectedId={selected?.id ?? null}
        onselect={select}
        onpage={goToPage}
      />
      {#if selected}
        {#key selected.id}
          <ReportDetail
            {services}
            report={selected}
            busy={saving}
            failed={saveFailed}
            onstatus={(status) => selected && changeStatus(selected, status)}
            onclose={() => (selected = null)}
          />
        {/key}
      {/if}
    </div>
  {/if}
</section>
