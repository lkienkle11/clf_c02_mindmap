<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { cn } from '@/ui/cn';
  import type { ReportContext } from '../logic/report-draft';
  import ReportDialog from './ReportDialog.svelte';

  interface Props {
    services: Services;
    context: ReportContext;
    /** The un-clipped content element to screenshot (see ReportDialog); omit for a system report. */
    captureTarget?: () => HTMLElement | null;
    /** True when the dialog opens, false when it closes (after a discard or a successful submit). */
    onopenchange?: (open: boolean) => void;
    class?: string;
  }

  let { services, context, captureTarget, onopenchange, class: className }: Props = $props();

  const i18n = getI18n();
  let open = $state(false);

  function setOpen(next: boolean) {
    if (open === next) return;
    open = next;
    onopenchange?.(next);
  }
</script>

<Button
  aria-haspopup="dialog"
  class={cn('border-2 border-report-border bg-report font-semibold text-report-foreground hover:bg-report-hover', className)}
  onclick={() => setOpen(true)}
>
  {i18n.t('report.button')}
</Button>
<ReportDialog {services} {context} {open} {captureTarget} onclose={() => setOpen(false)} />
