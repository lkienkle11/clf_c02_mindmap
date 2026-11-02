<script module lang="ts">
  export type Length = 'full' | 'quick' | 'custom';
</script>

<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';

  interface Props {
    value: Length;
  }

  let { value = $bindable() }: Props = $props();

  const i18n = getI18n();
  const uid = $props.id();
  const choices: { id: Length; label: string; hint: string }[] = [
    { id: 'full', label: 'review.mode.full', hint: 'review.mode.fullHint' },
    { id: 'quick', label: 'review.mode.quick', hint: 'review.mode.quickHint' },
    { id: 'custom', label: 'review.mode.custom', hint: 'review.mode.customHint' },
  ];
</script>

<fieldset class="flex flex-col gap-2">
  <legend class="mb-2 font-semibold">{i18n.t('review.lengthLegend')}</legend>
  {#each choices as c (c.id)}
    <label class="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 has-[:checked]:border-primary">
      <input type="radio" name="{uid}-length" class="mt-1 size-5 shrink-0 accent-primary" value={c.id} bind:group={value} aria-describedby="{uid}-{c.id}" />
      <span class="flex flex-col">
        <span class="font-medium">{i18n.t(c.label)}</span>
        <span id="{uid}-{c.id}" class="text-sm text-muted-foreground">{i18n.t(c.hint)}</span>
      </span>
    </label>
  {/each}
</fieldset>
