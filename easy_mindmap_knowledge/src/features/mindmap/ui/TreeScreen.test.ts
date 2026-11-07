import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/svelte';
import { loadCatalog } from '@/content/load-catalog';
import { makeTreeRawCatalog } from '@/testing/fixtures';
import { makeFakeServices } from '@/testing/fake-services';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { Locale } from '@/i18n/i18n.svelte';
import { resetTreeScroll } from './scroll-memory';
import TreeScreen from './TreeScreen.svelte';

const PASSED = ['cloud-concepts', 'global-infrastructure']; // compute becomes current

async function mountTree(opts: { passed?: string[]; groups?: number[]; read?: string[]; noComputeQuestions?: boolean; locale?: Locale } = {}) {
  const raw = makeTreeRawCatalog();
  if (opts.noComputeQuestions) raw.questions = raw.questions.filter((q) => q.topicId !== 'compute');
  const fake = await makeFakeServices({
    catalog: loadCatalog(raw),
    passedTopicIds: opts.passed ?? PASSED,
    passedGroupIndexes: opts.groups ?? [],
    readIds: opts.read ?? [],
  });
  const view = renderWithI18n(TreeScreen, { services: fake.services, appState: fake.appState }, opts.locale ?? 'en');
  return { ...fake, ...view };
}

// The tree remembers its view between mounts, so every test starts like a fresh app launch.
beforeEach(() => resetTreeScroll());

const practiceButton = () => screen.getByRole('button', { name: /^Practice/ });

describe('TreeScreen scrolling', () => {
  const scroller = () => screen.getByRole('group').parentElement as HTMLDivElement;

  it('opens scrolled to the current topic instead of the left edge', async () => {
    await mountTree();
    expect(scroller().scrollLeft).toBeGreaterThan(0);
  });

  it('with no current topic, opens centred on the trunk', async () => {
    await mountTree({ passed: [] , groups: [] });
    expect(scroller().scrollLeft).toBeGreaterThan(0);
  });

  it('coming back to the tree keeps where the learner scrolled instead of re-centring', async () => {
    const first = await mountTree();
    scroller().scrollLeft = 123;
    await fireEvent.scroll(scroller());
    first.unmount();
    await mountTree();
    expect(scroller().scrollLeft).toBe(123);
  });

  it('resets to the current topic once the remembered position is cleared (app restart)', async () => {
    const first = await mountTree();
    scroller().scrollLeft = 0;
    await fireEvent.scroll(scroller());
    first.unmount();
    resetTreeScroll();
    await mountTree();
    expect(scroller().scrollLeft).toBeGreaterThan(0);
  });

  it('dragging empty space pans horizontally, dragging a node does not', async () => {
    await mountTree();
    const el = scroller();
    el.setPointerCapture = () => {};
    el.scrollLeft = 500;
    const svg = screen.getByRole('group');
    await fireEvent.pointerDown(svg, { button: 0, clientX: 300 });
    await fireEvent.pointerMove(el, { clientX: 200 });
    expect(el.scrollLeft).toBe(600);
    await fireEvent.pointerUp(el);

    el.scrollLeft = 500;
    await fireEvent.pointerDown(screen.getByRole('button', { name: /^compute/ }), { button: 0, clientX: 300 });
    await fireEvent.pointerMove(el, { clientX: 200 });
    expect(el.scrollLeft).toBe(500);
  });
});

describe('TreeScreen', () => {
  it('expands the current topic by default and shows its lessons and practice leaf', async () => {
    await mountTree();
    expect(screen.getByRole('button', { name: /^EC2 basics/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Lambda/ })).toBeInTheDocument();
    expect(practiceButton()).toBeInTheDocument();
  });

  it('shows lesson titles in the current locale', async () => {
    await mountTree({ locale: 'vi' });
    expect(screen.getByRole('button', { name: /^EC2 cơ bản/ })).toBeInTheDocument();
  });

  it('locked topic: aria-label and title carry the lockedHint, shows a lock, never expands or navigates', async () => {
    const { appState } = await mountTree();
    const locked = screen.getByRole('button', { name: /Score 80% or higher in compute to unlock/ });
    expect(locked).toHaveAttribute('tabindex', '0');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(within(locked).getByText('🔒')).toBeInTheDocument();
    expect(locked.querySelector('title')).toHaveTextContent('Score 80% or higher in compute to unlock');
    await fireEvent.click(locked);
    await fireEvent.keyDown(locked, { key: 'Enter' });
    expect(screen.getAllByRole('button', { name: /^Practice/ })).toHaveLength(1); // only compute's leaves
    expect(appState.route).toEqual({ view: 'tree' });
  });

  it('clicking the current topic toggles its leaves', async () => {
    await mountTree();
    const compute = screen.getByRole('button', { name: /^compute/ });
    expect(compute).toHaveAttribute('aria-expanded', 'true');
    await fireEvent.click(compute);
    expect(screen.queryByRole('button', { name: /^EC2 basics/ })).not.toBeInTheDocument();
    await fireEvent.click(compute);
    expect(screen.getByRole('button', { name: /^EC2 basics/ })).toBeInTheDocument();
  });

  it('clicking a done topic expands it and collapses the other', async () => {
    await mountTree();
    await fireEvent.click(screen.getByRole('button', { name: /^cloud-concepts/ }));
    expect(screen.getByRole('button', { name: /^Cloud intro/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^EC2 basics/ })).not.toBeInTheDocument();
  });

  it('coming back to the tree keeps the topic the learner opened instead of re-opening the current one', async () => {
    const first = await mountTree();
    await fireEvent.click(screen.getByRole('button', { name: /^cloud-concepts/ }));
    first.unmount();
    await mountTree();
    expect(screen.getByRole('button', { name: /^Cloud intro/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^EC2 basics/ })).not.toBeInTheDocument();
  });

  it('collapsed topics show read/total lessons', async () => {
    await mountTree({ read: ['cloud-intro'] });
    expect(screen.getByText('1/1 lessons')).toBeInTheDocument();
  });

  it('lesson leaf click opens the lesson route; Enter and Space activate it too', async () => {
    const { appState } = await mountTree();
    await fireEvent.click(screen.getByRole('button', { name: /^EC2 basics/ }));
    expect(appState.route).toEqual({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    appState.open({ view: 'tree' });
    await fireEvent.keyDown(screen.getByRole('button', { name: /^Lambda/ }), { key: 'Enter' });
    expect(appState.route).toEqual({ view: 'lesson', topicId: 'compute', lessonId: 'compute-lambda' });
    appState.open({ view: 'tree' });
    await fireEvent.keyDown(screen.getByRole('button', { name: /^Lambda/ }), { key: ' ' });
    expect(appState.route).toEqual({ view: 'lesson', topicId: 'compute', lessonId: 'compute-lambda' });
  });

  it('marks read lessons with a check and optional lessons as optional', async () => {
    await mountTree({ read: ['compute-ec2'] });
    expect(screen.getByRole('button', { name: /^EC2 basics, Done/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^EC2 video, Optional/ })).toBeInTheDocument();
    expect(screen.getByText('✓ EC2 basics')).toBeInTheDocument();
    expect(screen.getByText('▶ EC2 video')).toBeInTheDocument();
  });

  it('practice leaf is disabled with a reason while required lessons are unread', async () => {
    const { appState } = await mountTree({ read: ['compute-ec2'] });
    const p = practiceButton();
    expect(p).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Read all required lessons first')).toBeInTheDocument();
    await fireEvent.click(p);
    await fireEvent.keyDown(p, { key: 'Enter' });
    expect(appState.route).toEqual({ view: 'tree' });
  });

  it('practice leaf is enabled once all required lessons are read and opens practice (optional video not needed)', async () => {
    const { appState } = await mountTree({ read: ['compute-ec2', 'compute-lambda'] });
    const p = practiceButton();
    expect(p).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByText('Read all required lessons first')).not.toBeInTheDocument();
    await fireEvent.click(p);
    expect(appState.route).toEqual({ view: 'practice', topicId: 'compute' });
  });

  it('practice leaf is disabled with the noQuestions reason when the topic has no questions', async () => {
    const { appState } = await mountTree({ read: ['compute-ec2', 'compute-lambda'], noComputeQuestions: true });
    const p = practiceButton();
    expect(p).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('No questions yet')).toBeInTheDocument();
    await fireEvent.click(p);
    expect(appState.route).toEqual({ view: 'tree' });
  });
});

describe('TreeScreen topics without lessons (ruling R17)', () => {
  const NOTE = 'Lessons for this topic are coming in a later update';

  it('a current topic with questions but no lessons is practisable and says lessons come later', async () => {
    // storage has a question (q2) and no lessons; it becomes current after the first three topics.
    const { appState } = await mountTree({ passed: [...PASSED, 'compute'], groups: [1] });
    const p = practiceButton();
    expect(p).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByText('Read all required lessons first')).not.toBeInTheDocument();
    expect(screen.getByText(NOTE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^storage/ })).toHaveAccessibleName(new RegExp(NOTE));
    await fireEvent.click(p);
    expect(appState.route).toEqual({ view: 'practice', topicId: 'storage' });
  });

  it('a topic with lessons never shows the note', async () => {
    await mountTree({ read: ['compute-ec2', 'compute-lambda'] });
    expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
  });

  it('capstone has no own questions but is practisable with the pooled questions', async () => {
    const all = ['cloud-concepts', 'global-infrastructure', 'compute', 'storage', 'networking', 'databases', 'deploy-operate',
      'shared-responsibility', 'iam-security', 'pricing-billing', 'migration-caf', 'support-ai-other'];
    const { appState } = await mountTree({ passed: all, groups: [1, 2, 3, 4] });
    const p = practiceButton();
    expect(p).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByText('No questions yet')).not.toBeInTheDocument();
    await fireEvent.click(p);
    expect(appState.route).toEqual({ view: 'practice', topicId: 'capstone' });
  });

  it('speaks Vietnamese', async () => {
    await mountTree({ passed: [...PASSED, 'compute'], groups: [1], locale: 'vi' });
    expect(screen.getByText('Bài học cho chủ đề này sẽ có trong bản cập nhật sau')).toBeInTheDocument();
  });
});

describe('TreeScreen review badge', () => {
  const summary = (topicId: string, daysOverdue: number) => ({ topicId, dueCount: 3, daysOverdue, urgency: 'soon' as const });
  const nodeOf = (name: RegExp) => screen.getByRole('button', { name });

  it('marks a done topic that has due questions, with the days since it was due', async () => {
    const { appState } = await mountTree();
    appState.summaries = [summary('cloud-concepts', 3)];
    expect(await screen.findByText('Needs review · 3 days')).toBeInTheDocument();
    expect(nodeOf(/^cloud-concepts/)).toHaveAccessibleName(/Needs review · 3 days/);
  });

  it('says "today" when zero full days have passed and "1 day" for one', async () => {
    const { appState } = await mountTree();
    appState.summaries = [summary('cloud-concepts', 0), summary('global-infrastructure', 1)];
    expect(await screen.findByText('Needs review · today')).toBeInTheDocument();
    expect(screen.getByText('Needs review · 1 day')).toBeInTheDocument();
  });

  it('shows no badge without a summary, nor on a topic that is not done', async () => {
    const { appState } = await mountTree();
    expect(screen.queryByText(/Needs review/)).not.toBeInTheDocument();
    appState.summaries = [summary('compute', 5), summary('storage', 2)]; // compute is current, storage locked
    await Promise.resolve();
    expect(screen.queryByText(/Needs review/)).not.toBeInTheDocument();
  });

  it('keeps the topic green and its status unchanged', async () => {
    const { appState } = await mountTree();
    const before = nodeOf(/^cloud-concepts/).querySelector('rect:not(.fill-none)')?.getAttribute('class');
    appState.summaries = [summary('cloud-concepts', 4)];
    await screen.findByText('Needs review · 4 days');
    const after = nodeOf(/^cloud-concepts/).querySelector('rect:not(.fill-none)')?.getAttribute('class');
    expect(before).toContain('fill-leaf-done-soft');
    expect(after).toBe(before);
    expect(appState.statuses.get('cloud-concepts')).toBe('done');
    expect(nodeOf(/^cloud-concepts/)).toHaveAccessibleName(/Done/);
  });

  it('speaks Vietnamese', async () => {
    const { appState } = await mountTree({ locale: 'vi' });
    appState.summaries = [summary('cloud-concepts', 3)];
    expect(await screen.findByText('Cần ôn · 3 ngày')).toBeInTheDocument();
  });
});

describe('TreeScreen checkpoint nodes', () => {
  const GROUP1 = ['cloud-concepts', 'global-infrastructure', 'compute'];

  it('group 1 finished but unpassed: checkpoint 1 is available and opens the checkpoint route; storage is locked by it', async () => {
    const { appState } = await mountTree({ passed: GROUP1 });
    const cp = screen.getByRole('button', { name: /^Checkpoint 1/ });
    expect(cp).toHaveAccessibleName(/Ready/);
    expect(cp).not.toHaveAttribute('aria-disabled', 'true');
    const locked = screen.getByRole('button', { name: /^storage/ });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(locked).toHaveAccessibleName(/Pass checkpoint 1 to unlock/);
    expect(locked).not.toHaveAccessibleName(/Score 80%/);
    expect(screen.queryByRole('button', { name: /^Practice/ })).not.toBeInTheDocument(); // nothing expanded
    await fireEvent.click(cp);
    expect(appState.route).toEqual({ view: 'checkpoint', groupIndex: 1 });
    appState.open({ view: 'tree' });
    await fireEvent.keyDown(cp, { key: 'Enter' });
    expect(appState.route).toEqual({ view: 'checkpoint', groupIndex: 1 });
  });

  it('nothing completed: checkpoint 1 is locked, explains why, and is not clickable', async () => {
    const { appState } = await mountTree({ passed: [] });
    const cp = screen.getByRole('button', { name: /^Checkpoint 1/ });
    expect(cp).toHaveAttribute('aria-disabled', 'true');
    expect(cp).toHaveAccessibleName(/Locked/);
    expect(within(cp).getByText('🔒')).toBeInTheDocument();
    expect(cp.querySelector('title')).toHaveTextContent('Finish all topics in group 1 first');
    await fireEvent.click(cp);
    await fireEvent.keyDown(cp, { key: 'Enter' });
    expect(appState.route).toEqual({ view: 'tree' });
  });

  it('group 1 passed: shows a check and storage becomes current', async () => {
    await mountTree({ passed: GROUP1, groups: [1] });
    const cp = screen.getByRole('button', { name: /^Checkpoint 1/ });
    expect(cp).toHaveAccessibleName(/Passed/);
    expect(within(cp).getByText('✓')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^storage/ })).toHaveAccessibleName(/Up next/);
  });

  it('renders the four checkpoints and speaks Vietnamese', async () => {
    await mountTree({ passed: GROUP1, locale: 'vi' });
    expect(screen.getAllByRole('button', { name: /^Bài kiểm tra mốc \d/ })).toHaveLength(4);
    expect(screen.getByRole('button', { name: /^storage/ })).toHaveAccessibleName(/Đạt bài kiểm tra mốc 1 để mở/);
  });
});
