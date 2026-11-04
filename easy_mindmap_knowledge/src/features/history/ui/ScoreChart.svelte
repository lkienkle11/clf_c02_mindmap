<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { ScorePoint } from '../logic/history-stats';
  import { formatDateTime, formatPct } from './format';

  interface Props {
    points: ScorePoint[];
    topicName: (topicId: string | null) => string;
  }

  let { points, topicName }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);

  const W = 640;
  const H = 260;
  const PAD = { l: 44, r: 60, t: 16, b: 24 };
  const THRESHOLD = 80;
  const y = (pct: number): number => PAD.t + (1 - pct / 100) * (H - PAD.t - PAD.b);
  const x = (i: number, n: number): number =>
    n === 1 ? (PAD.l + W - PAD.r) / 2 : PAD.l + (i * (W - PAD.l - PAD.r)) / (n - 1);

  const coords = $derived(points.map((p, i) => ({ p, cx: x(i, points.length), cy: y(p.scorePct) })));
  const line = $derived(coords.map((c) => `${c.cx},${c.cy}`).join(' '));
  const label = $derived(
    i18n.t(points.length === 1 ? 'history.chart.label.one' : 'history.chart.label', {
      count: points.length,
      latest: formatPct(points.at(-1)?.scorePct ?? 0, locale),
      best: formatPct(Math.max(0, ...points.map((p) => p.scorePct)), locale),
    }),
  );
</script>

<figure class="flex flex-col gap-3">
  <figcaption class="flex flex-wrap items-center justify-between gap-2">
    <span class="font-semibold">{i18n.t('history.chart.title')}</span>
    <span class="text-sm text-muted-foreground">{i18n.t('history.chart.seeTable')}</span>
  </figcaption>

  <svg role="img" aria-label={label} viewBox="0 0 {W} {H}" class="h-auto w-full max-w-3xl rounded-lg border border-border-subtle bg-surface font-sans">
    {#each [0, 25, 50, 75, 100] as tick (tick)}
      <line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} class="stroke-border-subtle" stroke-width="1" />
      <text x={PAD.l - 6} y={y(tick) + 4} text-anchor="end" font-size="11" class="fill-muted-foreground">{tick}%</text>
    {/each}
    <line data-testid="threshold-line" x1={PAD.l} x2={W - PAD.r} y1={y(THRESHOLD)} y2={y(THRESHOLD)} stroke-dasharray="6 4" stroke-width="2" class="stroke-leaf-done-ink" />
    <text x={W - PAD.r + 6} y={y(THRESHOLD) + 4} text-anchor="start" font-size="11" font-weight="600" class="fill-leaf-done-ink">
      {i18n.t('history.chart.threshold', { pct: formatPct(THRESHOLD, locale) })}
    </text>
    <polyline points={line} fill="none" stroke-width="2" class="stroke-primary" />
    {#each coords as { p, cx, cy } (p.attemptId)}
      {#if p.kind === 'practice'}
        <circle data-testid="score-marker" data-kind="practice" {cx} {cy} r="6" class="fill-primary stroke-surface" stroke-width="2">
          <title>{formatDateTime(p.at, locale)}: {formatPct(p.scorePct, locale)}</title>
        </circle>
      {:else}
        <rect data-testid="score-marker" data-kind="review" x={cx - 6} y={cy - 6} width="12" height="12" class="fill-surface stroke-primary" stroke-width="3">
          <title>{formatDateTime(p.at, locale)}: {formatPct(p.scorePct, locale)}</title>
        </rect>
      {/if}
    {/each}
  </svg>

  <ul class="flex flex-wrap gap-4 text-sm text-muted-foreground">
    <li class="flex items-center gap-1.5"><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" class="fill-primary" /></svg>{i18n.t('history.kind.practice')}</li>
    <li class="flex items-center gap-1.5"><svg width="14" height="14" aria-hidden="true"><rect x="2" y="2" width="10" height="10" stroke-width="3" class="fill-surface stroke-primary" /></svg>{i18n.t('history.kind.review')}</li>
  </ul>
</figure>
