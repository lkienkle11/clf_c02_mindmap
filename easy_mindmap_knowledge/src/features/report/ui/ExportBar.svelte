<script lang="ts">
  import { onMount } from 'svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { ExportFolderInaccessibleError, currentExportDir, exportReports, rememberExportDir, savedExportDir, syncReports } from '../export-reports';

  interface Props {
    services: Services;
    /** Called after a sync changed report statuses in the database. */
    onchanged: () => void;
  }

  let { services, onchanged }: Props = $props();

  const i18n = getI18n();

  let dir = $state<string | null>(null);
  let busy = $state(false);
  let error = $state<'export' | 'sync' | 'inaccessible' | null>(null);
  const MESSAGE = { export: 'report.export.failed', sync: 'report.export.syncFailed', inaccessible: 'report.export.folderInaccessible' } as const;

  /** Syncs the files into the database and tells the screen when a status changed. Callers hold `busy`. */
  async function sync(target: string): Promise<void> {
    const { updatedDb } = await syncReports(services, target);
    if (updatedDb > 0) onchanged();
  }

  onMount(() => {
    void (async () => {
      let saved: string | null = null;
      try {
        saved = await savedExportDir(services);
        dir = await currentExportDir(services);
      } catch (e) {
        console.error('Could not read the export folder', e);
        return;
      }
      // Silently skipped when no folder has ever been exported.
      if (saved === null || busy) return;
      busy = true;
      try {
        await sync(saved);
      } catch (e) {
        console.error('Could not sync the report files', e);
        error = e instanceof ExportFolderInaccessibleError ? 'inaccessible' : 'sync';
      } finally {
        busy = false;
      }
    })();
  });

  async function pick(): Promise<void> {
    if (busy) return;
    try {
      const picked = await services.reportStorage.pickExportDir();
      if (picked) dir = picked;
    } catch (e) {
      console.error('Could not pick a folder', e);
      error = 'export';
    }
  }

  async function runExport(): Promise<void> {
    if (busy || dir === null) return;
    busy = true;
    error = null;
    try {
      // exportReports syncs first, so a status an agent changed in a file is not overwritten.
      const { updatedDb } = await exportReports(services, dir);
      if (updatedDb > 0) onchanged();
      await rememberExportDir(services, dir);
    } catch (e) {
      console.error('Could not export the reports', e);
      error = e instanceof ExportFolderInaccessibleError ? 'inaccessible' : 'export';
      onchanged(); // the sync inside the export may already have changed statuses
    } finally {
      busy = false;
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-wrap items-center gap-3">
    <Button disabled={busy || dir === null} onclick={runExport}>
      {busy ? i18n.t('report.export.running') : i18n.t('report.export.button')}
    </Button>
    <Button variant="secondary" disabled={busy} onclick={pick}>{i18n.t('report.export.choose')}</Button>
    {#if dir !== null}
      <p class="text-sm text-muted-foreground">
        {i18n.t('report.export.folder')} <code class="break-all">{dir}</code>
      </p>
    {/if}
  </div>
  {#if error}
    <div role="alert" class="flex items-center gap-3 text-sm text-danger">
      <p>{i18n.t(MESSAGE[error])}</p>
      <Button variant="ghost" onclick={() => (error = null)}>{i18n.t('report.export.dismiss')}</Button>
    </div>
  {/if}
</div>
