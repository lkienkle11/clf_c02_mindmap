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
  <ul class="list-disc pl-5 text-sm">
    {#each items as item (item)}
      <li>{item}</li>
    {/each}
  </ul>
{/if}
