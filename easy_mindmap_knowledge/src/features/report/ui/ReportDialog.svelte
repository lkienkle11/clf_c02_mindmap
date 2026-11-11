<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';
  import { captureFrame } from '../capture';
  import { MAX_SYSTEM_IMAGES, validateDraft } from '../logic/report-draft';
  import type { ReportContext } from '../logic/report-draft';
  import { notifyReportSubmitted } from '../report-events';
  import { submitReport } from '../submit-report';
  import { APP_VERSION } from './app-version';
  import ImageUpload from './ImageUpload.svelte';
  import RichTextInput from './RichTextInput.svelte';
  import ScreenshotPicker from './ScreenshotPicker.svelte';

  interface Props {
    services: Services;
    context: ReportContext;
    open: boolean;
    /**
     * Returns the element to capture for a question or lesson report; omit it for a system report.
     * It must be the un-clipped CONTENT element, not a scrolling container: html-to-image sizes the
     * image from clientWidth/clientHeight, so a scroller would cut off what is scrolled out of view.
     * The dialog marks itself `data-report-ignore`, so it is left out of the image.
     */
    captureTarget?: () => HTMLElement | null;
    /** Called after the draft is discarded or a submit succeeded; the owner then sets `open` to false. */
    onclose: () => void;
    onsubmitted?: (reportId: string) => void;
    /** Test seam: renders the target to PNG bytes. Defaults to captureFrame (html-to-image). */
    capture?: (el: HTMLElement) => Promise<Uint8Array>;
  }

  let { services, context, open, captureTarget, onclose, onsubmitted, capture = (el) => captureFrame(el) }: Props = $props();

  const i18n = getI18n();
  const IGNORE = { 'data-report-ignore': '' } as const;
  const TITLE = {
    question: 'report.title.question',
    lesson: 'report.title.lesson',
    attempt: 'report.title.attempt',
    system: 'report.title.system',
  } as const;
  const PLACEHOLDER = {
    question: 'report.placeholder.question',
    lesson: 'report.placeholder.lesson',
    attempt: 'report.placeholder.attempt',
    system: 'report.placeholder.system',
  } as const;

  let body = $state('');
  let shot = $state.raw<Uint8Array | null>(null);
  let uploads = $state.raw<Uint8Array[]>([]);
  let confirming = $state(false);
  let submitting = $state(false);
  let failed = $state(false);
  // Bumped when the draft is cleared, so the screenshot and upload controls start over (and drop late results).
  let epoch = $state(0);

  const images = $derived(context.type === 'system' ? uploads : shot ? [shot] : []);
  const valid = $derived(validateDraft({ context, body, images }).ok);

  function clear() {
    body = '';
    shot = null;
    uploads = [];
    failed = false;
    confirming = false;
    epoch++;
    onclose();
  }

  // While a save runs, closing is refused: the report is going to be saved, so "discard" would be a lie.
  function requestClose() {
    if (!submitting) confirming = true;
  }

  function discard() {
    if (!submitting) clear();
  }

  async function submit() {
    if (!valid || submitting) return;
    submitting = true;
    failed = false;
    let id: string;
    try {
      id = await submitReport(services, { context, body, images }, { appVersion: APP_VERSION, locale: i18n.locale });
    } catch {
      // Saving failed (or, impossibly, the draft was invalid): keep the draft so the user can retry.
      failed = true;
      submitting = false;
      return;
    }
    submitting = false;
    notifyReportSubmitted();
    // The report is saved. A throwing parent callback must not look like a save failure or allow a duplicate.
    try {
      onsubmitted?.(id);
    } catch (e) {
      console.error('onsubmitted failed', e);
    }
    clear();
  }
</script>

<Modal {open} title={i18n.t(TITLE[context.type])} onclose={requestClose} closeOnBackdrop attrs={IGNORE}>
  <div class="space-y-4">
    <RichTextInput bind:value={body} placeholder={i18n.t(PLACEHOLDER[context.type])} />
    {#key epoch}
      {#if context.type === 'system'}
        <ImageUpload bind:images={uploads} max={MAX_SYSTEM_IMAGES} />
      {:else if captureTarget}
        <ScreenshotPicker target={captureTarget} {capture} bind:image={shot} />
      {/if}
    {/key}
    {#if failed}
      <p role="alert" class="text-sm text-danger">{i18n.t('report.submitFailed')}</p>
    {/if}
  </div>
  {#snippet footer()}
    <div class="flex justify-end gap-2">
      <Button variant="secondary" disabled={submitting} onclick={requestClose}>{i18n.t('common.close')}</Button>
      <Button disabled={!valid || submitting} onclick={submit}>{i18n.t('report.submit')}</Button>
    </div>
  {/snippet}
</Modal>

<!-- A sibling, not a child: stacked on top, so Escape and the backdrop reach only this one. -->
<Modal open={open && confirming} title={i18n.t('report.confirm.title')} onclose={() => (confirming = false)} closeOnBackdrop attrs={IGNORE}>
  <p>{i18n.t('report.confirm.hint')}</p>
  {#snippet footer()}
    <div class="flex justify-end gap-2">
      <Button variant="secondary" onclick={() => (confirming = false)}>{i18n.t('report.confirm.keep')}</Button>
      <Button onclick={discard}>{i18n.t('report.confirm.discard')}</Button>
    </div>
  {/snippet}
</Modal>
