import { createHash } from 'node:crypto';
import type { RawCard } from './parse-cards';

export function stableQuestionId(card: RawCard): string {
  const options = [...card.options]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((o) => `${o.key}.${o.text}`);
  const payload = [card.text.replace(/\s+/g, ' ').trim(), ...options].join('\n');
  return 'q_' + createHash('sha1').update(payload).digest('hex').slice(0, 12);
}
