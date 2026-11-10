<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { bytesToDataUrl, detectImageMime } from './data-url';

  interface Props {
    /** The accepted images (PNG or JPEG bytes). */
    images: Uint8Array[];
    max: number;
  }

  let { images = $bindable(), max }: Props = $props();

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const ACCEPT = ['image/png', 'image/jpeg'];

  const i18n = getI18n();
  const uid = $props.id();
  const inputId = `report-images-${uid}`;
  let input = $state<HTMLInputElement>();
  let problems = $state<string[]>([]);
  // Set when the control is removed (the draft was discarded); a file read that finishes later is dropped.
  let gone = false;
  onDestroy(() => (gone = true));

  const previews = $derived(images.map((bytes) => ({ bytes, url: bytesToDataUrl(bytes) })));

  async function onchange(e: Event & { currentTarget: HTMLInputElement }) {
    const files = [...(e.currentTarget.files ?? [])];
    e.currentTarget.value = '';
    const found: string[] = [];
    const note = (key: string) => void (found.includes(key) || found.push(key));
    for (const file of files) {
      if (!ACCEPT.includes(file.type)) {
        note('report.images.badType');
      } else if (file.size > MAX_IMAGE_BYTES) {
        note('report.images.tooBig');
      } else if (images.length >= max) {
        note('report.images.tooMany');
      } else {
        try {
          const bytes = new Uint8Array(await file.arrayBuffer());
          if (gone) return;
          // Checked again after the wait: another selection may have filled the list meanwhile, and `images`
          // is updated one file at a time so this always sees the current list.
          if (images.length >= max) note('report.images.tooMany');
          // The file type comes from the name; the signature says what the bytes really are.
          else if (detectImageMime(bytes)) images = [...images, bytes];
          else note('report.images.badType');
        } catch {
          note('report.images.readFailed');
        }
      }
    }
    if (!gone) problems = found;
  }

  function remove(bytes: Uint8Array) {
    images = images.filter((b) => b !== bytes);
    problems = [];
    input?.focus();
  }
</script>

<section class="space-y-2" aria-label={i18n.t('report.images.heading', { max })}>
  <h3 class="text-sm font-medium">{i18n.t('report.images.heading', { max })}</h3>
  <label for={inputId} class="block text-sm">{i18n.t('report.images.upload')}</label>
  <input
    bind:this={input}
    id={inputId}
    type="file"
    accept={ACCEPT.join(',')}
    multiple
    class="block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-border file:bg-surface file:px-4 file:text-base file:font-medium"
    {onchange}
  />
  {#if problems.length > 0}
    <div role="alert" class="space-y-1 text-sm text-danger">
      {#each problems as key (key)}
        <p>{i18n.t(key, { max })}</p>
      {/each}
    </div>
  {/if}
  {#if previews.length > 0}
    <ul class="flex flex-wrap gap-3">
      {#each previews as p, i (p.bytes)}
        <li class="space-y-1">
          <img src={p.url} alt={i18n.t('report.images.alt', { n: i + 1 })} class="h-24 w-32 rounded-lg border border-border-subtle object-contain" />
          <Button variant="secondary" class="w-full" onclick={() => remove(p.bytes)}>{i18n.t('report.images.remove', { n: i + 1 })}</Button>
        </li>
      {/each}
    </ul>
  {/if}
</section>
