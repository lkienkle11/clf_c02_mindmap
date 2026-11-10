import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { loadCatalog } from '@/content/load-catalog';
import { makePracticeEnv } from '@/testing/practice-env';
import { makeReportEnv } from '@/testing/report-env';
import { makeTreeRawCatalog } from '@/testing/fixtures';
import { renderWithI18n } from '@/testing/render-with-i18n';
import LessonPanel from './LessonPanel.svelte';

async function mount(lessonId: string, locale?: 'en' | 'vi') {
  const env = await makeReportEnv();
  const services = { ...env.services, catalog: loadCatalog(makeTreeRawCatalog()) };
  const { appState } = await makePracticeEnv();
  const lesson = services.catalog.lessons.find((l) => l.id === lessonId)!;
  renderWithI18n(LessonPanel, { services, appState, lesson, openExternal: vi.fn(async () => {}), canPractice: () => true }, locale);
  return env;
}

describe('LessonPanel report button', () => {
  it('sits directly above the lesson navigation footer', async () => {
    await mount('compute-lambda');
    const report = screen.getByRole('button', { name: 'Report' });
    const next = screen.getByRole('button', { name: /Next lesson/ });
    expect(report.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(report.closest('footer')).toBeNull();
    expect(report.nextElementSibling ?? report.parentElement?.nextElementSibling).toBe(next.closest('footer'));
  });

  it('stores a lesson report with the shown lesson id and sourceScreen "lesson"', async () => {
    const env = await mount('compute-lambda');
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect(screen.getByRole('dialog', { name: 'Report wrong knowledge' })).toBeInTheDocument();
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'outdated' } });
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ type: 'lesson', lessonId: 'compute-lambda', sourceScreen: 'lesson' });
  });

  it('titles the dialog "Báo cáo kiến thức sai" in Vietnamese', async () => {
    await mount('compute-lambda', 'vi');
    await userEvent.click(screen.getByRole('button', { name: 'Báo cáo' }));
    expect(screen.getByRole('dialog', { name: 'Báo cáo kiến thức sai' })).toBeInTheDocument();
  });
});
