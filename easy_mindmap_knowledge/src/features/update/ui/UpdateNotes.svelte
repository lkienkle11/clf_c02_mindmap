<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import { parseNotes, pickNotes } from '../logic/changelog';

  interface Props {
    notes: string | null;
  }

  let { notes }: Props = $props();

  const i18n = getI18n();
  const items = $derived(pickNotes(parseNotes(notes), i18n.locale));
</script>

{#if items.length > 0}
  <!-- A scrollable region must be focusable so keyboard users can scroll it. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    role="region"
    tabindex="0"
    aria-label={i18n.t('update.notes.heading')}
    class="max-h-[30vh] overflow-y-auto pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    <ul class="list-disc pl-5 text-sm">
      {#each items as item}
        <li>{item}</li>
      {/each}
    </ul>
  </div>
{/if}
