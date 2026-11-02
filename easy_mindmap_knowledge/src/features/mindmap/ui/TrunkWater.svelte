<script lang="ts">
  import type { TreeLayout } from '../logic/tree-layout';
  import type { WaterPath, WaterSegment } from '../logic/water-path';

  interface Props {
    layout: TreeLayout;
    water: WaterPath;
  }

  let { layout, water }: Props = $props();

  const TRUNK_W = 12;
  const BRANCH_W = 8;

  const widthOf = (s: WaterSegment): number => (s.x1 === s.x2 ? TRUNK_W : BRANCH_W);
  const toneClass: Record<WaterSegment['tone'], string> = {
    done: 'stroke-leaf-done',
    next: 'stroke-leaf-next',
  };
</script>

<!-- Dry track: trunk, one arm per topic, and the fishbone spine of the expanded topic. -->
<g class="stroke-track" fill="none" stroke-linecap="round" aria-hidden="true">
  <line x1={layout.trunk.x} y1={layout.trunk.y1} x2={layout.trunk.x} y2={layout.trunk.y2} stroke-width={TRUNK_W} />
  {#each layout.branches as b (b.topicId)}
    <line x1={layout.trunk.x} y1={b.y} x2={b.near} y2={b.y} stroke-width={BRANCH_W} />
    {#if b.leaves.length > 0}
      <line x1={b.far} y1={b.y} x2={b.leaves[b.leaves.length - 1].x} y2={b.y} stroke-width={BRANCH_W} />
    {/if}
  {/each}
</g>

<!-- Water: solid colour by tone, then flowing dashes on top. -->
<g fill="none" stroke-linecap="round" aria-hidden="true">
  {#each water.segments as s, i (i)}
    <line data-water x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke-width={widthOf(s)} class={toneClass[s.tone]} />
    <line
      x1={s.x1}
      y1={s.y1}
      x2={s.x2}
      y2={s.y2}
      stroke-width={widthOf(s) / 3}
      class="flow stroke-surface/75"
    />
  {/each}
</g>

{#if water.head}
  <g data-head transform="translate({water.head.x} {water.head.y})" aria-hidden="true">
    <circle r="9" class="halo fill-water" />
    <circle r="6" class="fill-surface" />
    <circle r="4" class="fill-leaf-next" />
  </g>
{/if}

<style>
  .flow {
    stroke-dasharray: 3 19;
    animation: water-flow 0.9s linear infinite;
  }
  .halo {
    transform-box: fill-box;
    transform-origin: center;
    animation: water-pulse 1.4s ease-in-out infinite;
  }
  @keyframes water-flow {
    to {
      stroke-dashoffset: -22;
    }
  }
  @keyframes water-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.55);
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flow,
    .halo {
      animation: none;
    }
  }
</style>
