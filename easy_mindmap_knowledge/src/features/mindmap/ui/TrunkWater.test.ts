import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { makeTopics } from '@/testing/fixtures';
import { layoutTree } from '../logic/tree-layout';
import TrunkWater from './TrunkWater.svelte';

describe('TrunkWater', () => {
  it('disables the flow and pulse animations under prefers-reduced-motion', () => {
    const source = readFileSync(join(process.cwd(), 'src/features/mindmap/ui/TrunkWater.svelte'), 'utf8');
    expect(source).toContain('@media (prefers-reduced-motion: reduce)');
    expect(source).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^@]*animation:\s*none/);
  });

  it('draws the water segments and the head', () => {
    const layout = layoutTree(makeTopics(), { expandedTopicId: null });
    const b = layout.branches[0];
    const { container } = render(TrunkWater, {
      layout,
      water: {
        segments: [{ x1: layout.trunk.x, y1: layout.trunk.y1, x2: layout.trunk.x, y2: b.y, tone: 'next' }],
        head: { x: b.near, y: b.y },
      },
    });
    expect(container.querySelectorAll('[data-water]')).toHaveLength(1);
    expect(container.querySelector('[data-head]')).toBeInTheDocument();
  });
});
