import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { loadCatalog } from '@/content/load-catalog';
import { makeFakeServices } from '@/testing/fake-services';
import { makeAttempt } from '@/testing/history-env';
import { makePracticeEnv } from '@/testing/practice-env';
import { makeTreeRawCatalog } from '@/testing/fixtures';
import { renderWithI18n } from '@/testing/render-with-i18n';
import TreeScreen from './TreeScreen.svelte';

async function mountTree(read: string[] = []) {
  const fake = await makeFakeServices({
    catalog: loadCatalog(makeTreeRawCatalog()),
    passedTopicIds: ['cloud-concepts', 'global-infrastructure'], // compute is current
    readIds: read,
  });
  renderWithI18n(TreeScreen, { services: fake.services, appState: fake.appState }, 'en');
  return fake;
}

const menuButton = (topic: string) => screen.getByRole('button', { name: `Actions for ${topic}` });

describe('topic menu', () => {
  it('is offered on done and current topics, never on locked ones', async () => {
    await mountTree();
    expect(screen.getAllByRole('button', { name: /^Actions for / }).map((b) => b.getAttribute('aria-label'))).toEqual([
      'Actions for cloud-concepts', 'Actions for global-infrastructure', 'Actions for compute',
    ]);
    expect(screen.queryByRole('button', { name: 'Actions for storage' })).not.toBeInTheDocument();
  });

  it('opens from the button with the keyboard and focuses the first item', async () => {
    await mountTree();
    const button = menuButton('cloud-concepts');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', { name: 'Actions for cloud-concepts' });
    const items = screen.getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Redo practice', 'Review lessons', 'History']);
    expect(menu).toBeInTheDocument();
    expect(items[0]).toHaveFocus();
  });

  it('moves with the arrow keys, wraps, and supports Home and End', async () => {
    await mountTree();
    menuButton('cloud-concepts').focus();
    await userEvent.keyboard('{ArrowDown}');
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(items[2]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(items[2]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
  });

  it('Escape closes it and returns focus to the button; Tab closes it too', async () => {
    await mountTree();
    const button = menuButton('cloud-concepts');
    await userEvent.click(button);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
    await userEvent.click(button);
    await userEvent.keyboard('{Tab}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on a click outside', async () => {
    await mountTree();
    await userEvent.click(menuButton('cloud-concepts'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Redo practice opens the practice route for a done topic', async () => {
    const { appState } = await mountTree();
    await userEvent.click(menuButton('cloud-concepts'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Redo practice' }));
    expect(appState.route).toEqual({ view: 'practice', topicId: 'cloud-concepts' });
  });

  it('History opens the history filtered by that topic', async () => {
    const { appState } = await mountTree();
    await userEvent.click(menuButton('cloud-concepts'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'History' }));
    expect(appState.route).toEqual({ view: 'history', topicId: 'cloud-concepts' });
  });

  it('Review lessons expands that topic', async () => {
    await mountTree();
    expect(screen.queryByRole('button', { name: /^Cloud intro/ })).not.toBeInTheDocument();
    await userEvent.click(menuButton('cloud-concepts'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Review lessons' }));
    expect(screen.getByRole('button', { name: /^Cloud intro/ })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not toggle the expansion of its topic', async () => {
    await mountTree();
    const compute = screen.getByRole('button', { name: /^compute/ });
    expect(compute).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(menuButton('compute'));
    await userEvent.keyboard('{Escape}');
    expect(compute).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /^EC2 basics/ })).toBeInTheDocument();
  });

  it('keeps Redo practice disabled while required lessons are unread (no way around the lock)', async () => {
    const { appState } = await mountTree();
    await userEvent.click(menuButton('compute'));
    const redo = screen.getByRole('menuitem', { name: 'Redo practice' });
    expect(redo).toHaveAttribute('aria-disabled', 'true');
    await fireEvent.click(redo);
    expect(appState.route).toEqual({ view: 'tree' });
  });

  it('a low-scoring redo leaves the topic done and the next one unlocked', async () => {
    const submitted = [
      makeAttempt('p1', { topicId: 'cloud-concepts', scorePct: 90, passed: true, submittedAt: 10 }),
    ];
    const env = await makePracticeEnv({ rawCatalog: makeTreeRawCatalog(), submitted });
    renderWithI18n(TreeScreen, { services: env.services, appState: env.appState }, 'en');
    expect(screen.getByRole('button', { name: /^cloud-concepts, Done/ })).toBeInTheDocument();
    await userEvent.click(menuButton('cloud-concepts'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Redo practice' }));
    expect(env.appState.route).toEqual({ view: 'practice', topicId: 'cloud-concepts' });
    // the redo is submitted with a low score
    submitted.push(makeAttempt('p2', { topicId: 'cloud-concepts', scorePct: 20, passed: false, submittedAt: 20 }));
    await env.appState.refresh();
    expect(env.appState.statuses.get('cloud-concepts')).toBe('done');
    expect(env.appState.statuses.get('global-infrastructure')).toBe('current');
    expect(await screen.findByRole('button', { name: /^cloud-concepts, Done/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^global-infrastructure.*Locked/ })).not.toBeInTheDocument();
  });
});
