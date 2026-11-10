import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeReviewEnv } from '@/testing/review-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeReportSeed, makeReportsScreenEnv } from '@/testing/reports-screen-env';
import AppHeader from './AppHeader.svelte';

async function mount(over: Parameters<typeof makeReviewEnv>[0] = {}) {
  const env = await makeReviewEnv(over);
  const started: string[] = [];
  const view = renderWithI18n(AppHeader, { services: env.services, appState: env.appState, onreview: (m: string) => started.push(m) });
  return { ...env, ...view, started };
}

describe('AppHeader', () => {
  it('has a banner, a labelled navigation and the app title', async () => {
    await mount();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByText('AWS CLF-C02 Mindmap')).toBeInTheDocument();
  });

  it('marks the current section and moves between sections', async () => {
    const { appState } = await mount();
    expect(screen.getByRole('button', { name: 'Mindmap' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'History' })).not.toHaveAttribute('aria-current');
    await userEvent.click(screen.getByRole('button', { name: 'History' }));
    expect(appState.route).toEqual({ view: 'history' });
    expect(screen.getByRole('button', { name: 'History' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(appState.route).toEqual({ view: 'settings' });
    await userEvent.click(screen.getByRole('button', { name: 'Mindmap' }));
    expect(appState.route).toEqual({ view: 'tree' });
  });

  it('keeps Mindmap current while reading a lesson', async () => {
    const { appState } = await mount();
    appState.open({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    expect(await screen.findByRole('button', { name: 'Mindmap' })).toHaveAttribute('aria-current', 'page');
  });

  it('is reachable with the keyboard', async () => {
    const { appState } = await mount();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Mindmap' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(appState.route).toEqual({ view: 'history' });
  });

  it('shows the Review button when there is something to review', async () => {
    await mount();
    expect(screen.getByRole('button', { name: 'Review (23)' })).toBeInTheDocument();
  });

  it('follows the language', async () => {
    const { i18n } = await mount();
    i18n.setLocale('vi');
    expect(await screen.findByRole('button', { name: 'Lịch sử' })).toBeInTheDocument();
  });

  it.each([
    [{ view: 'practice', topicId: 'compute' }],
    [{ view: 'review' }],
  ] as const)('is hidden while a session runs (%o)', async (route) => {
    const { appState } = await mount();
    appState.open(route);
    await waitFor(() => expect(screen.queryByRole('banner')).not.toBeInTheDocument());
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
    appState.open({ view: 'tree' });
    expect(await screen.findByRole('banner')).toBeInTheDocument();
  });

  describe('Reports tab', () => {
    const seeds = [
      makeReportSeed({ id: 'a' }),
      makeReportSeed({ id: 'b' }),
      makeReportSeed({ id: 'c', status: 'handled' }),
    ];
    const mountReports = async (list = seeds, locale: 'en' | 'vi' = 'en') => {
      const env = await makeReportsScreenEnv(list);
      const view = renderWithI18n(AppHeader, { services: env.services, appState: env.appState, onreview: () => {} }, locale);
      return { ...env, ...view };
    };

    it('shows a Reports tab between History and Settings with the number of new reports', async () => {
      await mountReports();
      const before = (x: HTMLElement, y: HTMLElement) => Boolean(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING);
      const history = screen.getByRole('button', { name: 'History' });
      const reports = screen.getByRole('button', { name: 'Reports, 2 new' });
      const settings = screen.getByRole('button', { name: 'Settings' });
      expect(before(history, reports)).toBe(true);
      expect(before(reports, settings)).toBe(true);
      const tab = screen.getByRole('button', { name: 'Reports, 2 new' });
      expect(tab).toHaveTextContent('2');
    });

    it('hides the badge when no report is new', async () => {
      await mountReports([makeReportSeed({ id: 'c', status: 'handled' })]);
      const tab = screen.getByRole('button', { name: 'Reports' });
      expect(tab).not.toHaveTextContent(/\d/);
      expect(screen.queryByText(/new$/)).toBeNull();
    });

    it('is named Báo cáo in Vietnamese and opens the reports route, marked current', async () => {
      const { appState } = await mountReports(seeds, 'vi');
      const tab = screen.getByRole('button', { name: 'Báo cáo, 2 mới' });
      expect(tab).not.toHaveAttribute('aria-current');
      await userEvent.click(tab);
      expect(appState.route).toEqual({ view: 'reports' });
      expect(screen.getByRole('button', { name: 'Báo cáo, 2 mới' })).toHaveAttribute('aria-current', 'page');
    });

    it('can be reached and activated from the keyboard', async () => {
      const { appState } = await mountReports();
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      expect(screen.getByRole('button', { name: 'Reports, 2 new' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(appState.route).toEqual({ view: 'reports' });
    });

    it('follows the new-report count', async () => {
      const { appState, services } = await mountReports();
      await services.repos.reports.setStatus('a', 'handled', 1);
      await appState.refresh();
      expect(await screen.findByRole('button', { name: 'Reports, 1 new' })).toBeInTheDocument();
    });
  });
});
