<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';

  export interface Notice {
    id: string;
    text: string;
    onclose: () => void;
  }

  interface Props {
    notices: Notice[];
  }

  let { notices }: Props = $props();

  const i18n = getI18n();
</script>

<!-- One positioned stack for every app notice, so two notices never overlap each other. -->
{#if notices.length > 0}
  <div data-testid="notices" class="fixed top-4 left-1/2 z-40 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2">
    {#each notices as notice (notice.id)}
      <div role="status" class="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg">
        <p class="flex-1">{notice.text}</p>
        <Button variant="ghost" onclick={notice.onclose}>{i18n.t('common.close')}</Button>
      </div>
    {/each}
  </div>
{/if}
