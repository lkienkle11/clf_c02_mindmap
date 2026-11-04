<script lang="ts">
  import type { Services } from '@/app/composition';
  import { SvelteMap } from 'svelte/reactivity';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { SubmitResult } from '@/features/practice';

  interface Props {
    services: Services;
    items: SubmitResult['items'];
  }

  let { services, items }: Props = $props();

  const i18n = getI18n();

  /**
   * Correct and total answers per catalog topic, in topic order. A question without a topic counts
   * only in the overall score, so it gets no row here.
   */
  const rows = $derived.by(() => {
    const topicOf = new Map(services.catalog.questions.map((q) => [q.id, q.topicId]));
    const tally = new SvelteMap<string, { correct: number; total: number }>();
    for (const item of items) {
      const topicId = topicOf.get(item.questionId);
      if (!topicId) continue;
      const count = tally.get(topicId) ?? { correct: 0, total: 0 };
      count.total += 1;
      if (item.isCorrect) count.correct += 1;
      tally.set(topicId, count);
    }
    return services.catalog.topics
      .filter((topic) => tally.has(topic.id))
      .map((topic) => ({ topicId: topic.id, title: topic.title[i18n.locale], ...tally.get(topic.id)! }));
  });
</script>

{#if rows.length > 0}
  <section aria-labelledby="exam-breakdown-title" class="flex flex-col gap-3">
    <h2 id="exam-breakdown-title" class="text-xl font-semibold">{i18n.t('exam.breakdown.title')}</h2>
    <table class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-border">
          <th scope="col" class="py-2 font-medium">{i18n.t('exam.breakdown.topic')}</th>
          <th scope="col" class="py-2 font-medium">{i18n.t('exam.breakdown.score')}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.topicId)}
          <tr class="border-b border-border-subtle">
            <th scope="row" class="py-2 font-normal">{row.title}</th>
            <td class="py-2 tabular-nums">{i18n.t('practice.result.correctCount', { correct: row.correct, total: row.total })}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}
