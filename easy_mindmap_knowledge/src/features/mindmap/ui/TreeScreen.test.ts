import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/svelte';
import { loadCatalog } from '@/content/load-catalog';
import { makeTreeRawCatalog } from '@/testing/fixtures';
import { makeFakeServices } from '@/testing/fake-services';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { Locale } from '@/i18n/i18n.svelte';
import TreeScreen from './TreeScreen.svelte';

const PASSED = ['cloud-concepts', 'global-infrastructure']; // compute becomes current

async function mountTree(opts: { passed?: string[]; read?: string[]; noComputeQuestions?: boolean; locale?: Locale } = {}) {
  const raw = makeTreeRawCatalog();
  if (opts.noComputeQuestions) raw.questions = raw.questions.filter((q) => q.topicId !== 'compute');
  const fake = await makeFakeServices({
    catalog: loadCatalog(raw),
    passedTopicIds: opts.passed ?? PASSED,
    readIds: opts.read ?? [],
  });
  const view = renderWithI18n(TreeScreen, { services: fake.services, appState: fake.appState }, opts.locale ?? 'en');
  return { ...fake, ...view };
}

const practiceButton = () => screen.getByRole('button', { name: /^Practice/ });

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
    const locked = screen.getByRole('button', { name: /Score above 80% in compute to unlock/ });
    expect(locked).toHaveAttribute('tabindex', '0');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(within(locked).getByText('🔒')).toBeInTheDocument();
    expect(locked.querySelector('title')).toHaveTextContent('Score above 80% in compute to unlock');
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
