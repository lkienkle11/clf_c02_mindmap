<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import bundled from '../../../../CHANGELOG.md?raw';
  import { entriesUpTo, parseChangelog, pickNotes } from '../logic/changelog';

  interface Props {
    installedVersion: string;
    changelog?: string;
  }

  let { installedVersion, changelog = bundled }: Props = $props();

  const i18n = getI18n();
  const headingId = $props.id();
  const entries = $derived(entriesUpTo(parseChangelog(changelog), installedVersion));
</script>

{#if entries.length > 0}
  <section class="flex flex-col gap-3" aria-labelledby={headingId}>
    <h2 id={headingId} class="text-lg font-semibold">{i18n.t('update.whatsNew.heading')}</h2>
    {#each entries as entry, index (entry.version)}
      <details open={index === 0} class="rounded-lg border border-border-subtle bg-surface px-3 py-2">
        <summary class="cursor-pointer font-medium">
          {i18n.t('update.whatsNew.version', { version: entry.version })}
        </summary>
        <ul class="mt-2 list-disc pl-5 text-sm">
          {#each pickNotes(entry.notes, i18n.locale) as note, noteIndex (noteIndex)}
            <li>{note}</li>
          {/each}
        </ul>
      </details>
    {/each}
  </section>
{/if}
