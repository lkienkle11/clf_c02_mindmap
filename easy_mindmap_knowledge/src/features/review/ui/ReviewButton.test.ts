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

  // Spec 5.1: the Review button is always on the main view; with nothing due it is disabled and says why.
  it('is present but disabled with a visible reason when no question is due', async () => {
    const env = await makeReviewEnv({ due: {}, completedOnly: ['compute'] });
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    const button = screen.getByRole('button', { name: 'Review' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Nothing to review right now')).toBeVisible();
    expect(button).toHaveAccessibleDescription('Nothing to review right now');
    await userEvent.click(button);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is disabled when the due questions belong to a topic that is not completed', async () => {
    const env = await makeReviewEnv({ due: { compute: 5 }, notCompleted: ['compute'] });
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    expect(screen.getByRole('button', { name: 'Review' })).toBeDisabled();
  });

  it('speaks Vietnamese when disabled', async () => {
    const env = await makeReviewEnv({ due: {}, completedOnly: ['compute'] });
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() }, 'vi');
    expect(screen.getByRole('button', { name: 'Ôn tập' })).toBeDisabled();
  });

  it('is hidden after "Don\'t ask today" even when nothing is due', async () => {
    const env = await makeReviewEnv({ due: {}, completedOnly: ['compute'] });
    await env.appState.hideReviewButtonToday();
    renderWithI18n(ReviewButton, { services: env.services, appState: env.appState, onstart: vi.fn() });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Nothing to review right now')).not.toBeInTheDocument();
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
