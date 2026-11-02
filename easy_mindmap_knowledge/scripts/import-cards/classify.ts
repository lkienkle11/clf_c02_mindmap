import type { RawCard } from './parse-cards';
import { TOPIC_RULES } from './topic-rules';

/**
 * Topic with the most distinct keyword matches over question text + option texts.
 * A tie for the top score, or no match at all, yields null (the "Tổng hợp" pool).
 */
export function classifyCard(card: RawCard): string | null {
  const haystack = [card.text, ...card.options.map((o) => o.text)].join('\n');
  let best: string | null = null;
  let bestScore = 0;
  let tie = false;
  for (const rule of TOPIC_RULES) {
    const score = rule.keywords.filter((k) => k.test(haystack)).length;
    if (score === 0) continue;
    if (score > bestScore) {
      best = rule.topicId;
      bestScore = score;
      tie = false;
    } else if (score === bestScore) {
      tie = true;
    }
  }
  return tie ? null : best;
}
