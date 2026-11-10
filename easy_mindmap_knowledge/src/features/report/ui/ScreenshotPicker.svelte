<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { bytesToDataUrl } from './data-url';

  interface Props {
    target: () => HTMLElement | null;
    capture: (el: HTMLElement) => Promise<Uint8Array>;
    /** The captured PNG, or null. */
    image: Uint8Array | null;
  }

  let { target, capture, image = $bindable() }: Props = $props();

  const i18n = getI18n();
  let box = $state<HTMLElement>();
  let busy = $state(false);
  let failed = $state(false);
  // Set when the picker is removed (the draft was discarded); a capture that finishes later is dropped.
  let gone = false;
  onDestroy(() => (gone = true));

  const preview = $derived(image ? bytesToDataUrl(image) : null);

  async function focusAction(name: 'capture' | 'retake') {
    await tick();
    box?.querySelector<HTMLElement>(`[data-action="${name}"]`)?.focus();
  }

  function remove() {
    image = null;
    void focusAction('capture');
  }

  // A capture is optional, so every failure (a null target, a render error) only shows the alert;
  // an earlier screenshot is kept and the report can still be submitted.
  async function take() {
    if (busy) return;
    busy = true;
    failed = false;
    try {
      const el = target();
      if (!el) throw new Error('capture target is gone');
      const bytes = await capture(el);
      if (gone) return;
      image = bytes;
      void focusAction('retake');
    } catch {
      if (!gone) failed = true;
    } finally {
      busy = false;
    }
  }
</script>

<section bind:this={box} class="space-y-2" aria-label={i18n.t('report.shot.heading')}>
  <h3 class="text-sm font-medium">{i18n.t('report.shot.heading')}</h3>
  {#if preview}
    <img src={preview} alt={i18n.t('report.shot.alt')} class="max-h-40 rounded-lg border border-border-subtle object-contain" />
    <div class="flex flex-wrap gap-2">
      <Button variant="secondary" data-action="retake" aria-busy={busy} onclick={take}>{i18n.t('report.shot.retake')}</Button>
      <Button variant="secondary" onclick={remove}>{i18n.t('report.shot.remove')}</Button>
    </div>
  {:else}
    <Button variant="secondary" data-action="capture" aria-busy={busy} onclick={take}>{i18n.t('report.shot.capture')}</Button>
  {/if}
  {#if failed}
    <p role="alert" class="text-sm text-danger">{i18n.t('report.shot.failed')}</p>
  {/if}
</section>
