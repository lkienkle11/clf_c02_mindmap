import type { RawCard } from './parse-cards';
import { TOPIC_RULES } from './topic-rules';

const CORRECT_MULTIPLIER = 2;
const DISTRACTOR_MULTIPLIER = 0.5;

/**
 * Sums keyword weights per topic. A keyword counts once; if it matches the text of a
 * correct option it counts double (answers carry the topic best), otherwise it counts
 * once when it appears in the question and half when it only appears in a wrong option
 * (distractors name unrelated services, so they are the weakest signal). The top topic wins;
 * a tie for the top score, or no match at all, yields null (the "Tổng hợp" pool).
 */
export function classifyCard(card: RawCard): string | null {
  const correct = new Set(card.correctKeys);
  const correctText = card.options.filter((o) => correct.has(o.key)).map((o) => o.text).join('\n');
  const questionText = card.text;
  const distractorText = card.options.filter((o) => !correct.has(o.key)).map((o) => o.text).join('\n');
  let best: string | null = null;
  let bestScore = 0;
  let tie = false;
  for (const rule of TOPIC_RULES) {
    let score = 0;
    for (const { pattern, weight } of rule.keywords) {
      if (pattern.test(correctText)) score += weight * CORRECT_MULTIPLIER;
      else if (pattern.test(questionText)) score += weight;
      else if (pattern.test(distractorText)) score += weight * DISTRACTOR_MULTIPLIER;
    }
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
