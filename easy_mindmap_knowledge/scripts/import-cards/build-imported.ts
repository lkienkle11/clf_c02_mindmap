import type { Question } from '../../src/content/types';
import { classifyCard } from './classify';
import { isOrderDependent } from './order-dependent';
import type { RawCard } from './parse-cards';
import { stableQuestionId } from './stable-id';

export function buildImported(cards: RawCard[]): Question[] {
  return cards.map((card) => ({
    id: stableQuestionId(card),
    topicId: classifyCard(card),
    text: card.text,
    options: card.options.map((o) => ({ key: o.key, text: o.text })),
    correct: [...card.correctKeys],
    multi: card.multi,
    orderDependent: isOrderDependent(card.options.map((o) => o.text)),
    source: 'imported' as const,
  }));
}
