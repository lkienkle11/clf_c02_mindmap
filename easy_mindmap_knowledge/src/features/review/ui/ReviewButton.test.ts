import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeReviewEnv } from '@/testing/review-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import ReviewButton from './ReviewButton.svelte';

describe('ReviewButton', () => {
  it('shows the total number of due questions', async () => {
    const env = await makeReviewEnv();
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    expect(screen.getByRole('button', { name: 'Review (23)' })).toBeInTheDocument();
  });

  it('renders nothing when no question is due', async () => {
    const env = await makeReviewEnv({ due: {}, completedOnly: ['compute'] });
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing when the due questions belong to a topic that is not completed', async () => {
    const env = await makeReviewEnv({ due: { compute: 5 }, notCompleted: ['compute'] });
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is hidden after "Don\'t ask today"', async () => {
    const env = await makeReviewEnv();
    await env.appState.hideReviewButtonToday();
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the manual modal and starts the chosen review', async () => {
    const env = await makeReviewEnv();
    const onstart = vi.fn();
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart });
    await userEvent.click(screen.getByRole('button', { name: 'Review (23)' }));
    const dlg = screen.getByRole('dialog', { name: 'Review now' });
    expect(within(dlg).queryByRole('button', { name: "Don't ask today" })).not.toBeInTheDocument();
    await userEvent.click(within(dlg).getByRole('button', { name: 'Start now' }));
    expect(onstart).toHaveBeenCalledWith({ kind: 'full' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the manual modal with Later without starting', async () => {
    const env = await makeReviewEnv();
    const onstart = vi.fn();
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart });
    await userEvent.click(screen.getByRole('button', { name: 'Review (23)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onstart).not.toHaveBeenCalled();
  });
});
