<script lang="ts">
  import type { Component } from 'svelte';
  import { setI18n } from '@/i18n/i18n.svelte';
  import type { I18n } from '@/i18n/i18n.svelte';

  // Test/preview-only: provides the i18n context to a component under test.
  let { i18n, component: Target, props }: { i18n: I18n; component: Component<any>; props: Record<string, unknown> } = $props();

  // Safe: the host is mounted once per test with one fixed i18n instance.
  // svelte-ignore state_referenced_locally
  setI18n(i18n);
</script>

<Target {...props} />
