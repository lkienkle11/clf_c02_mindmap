import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { JPEG_BYTES, PNG_BYTES } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeReportSeed, makeReportsScreenEnv } from '@/testing/reports-screen-env';
import type { ReportSeed, ReportsScreenEnv } from '@/testing/reports-screen-env';
import ReportsScreen from './ReportsScreen.svelte';

const START = new Date(2026, 5, 1, 12).getTime();
const HOUR = 3_600_000;
const when = (at: number) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(at);
const pad = (n: number) => String(n).padStart(2, '0');

/** Reports r01..rNN, one hour apart. Every third is a question, then lesson, then system report; every fifth is handled. */
function seeds(n: number): ReportSeed[] {
  return Array.from({ length: n }, (_, k) => {
    const i = k + 1;
    return makeReportSeed({
      id: `r${pad(i)}`,
      type: (['question', 'lesson', 'system'] as const)[i % 3 === 0 ? 0 : i % 3],
      status: i % 5 === 0 ? 'handled' : 'new',
      createdAt: START + i * HOUR,
      statusUpdatedAt: START + i * HOUR,
      body: `Report number ${i}`,
    });
  });
}

let env: ReportsScreenEnv;

async function mount(list: ReportSeed[] = seeds(45)) {
  env = await makeReportsScreenEnv(list);
  const view = renderWithI18n(ReportsScreen, { services: env.services, appState: env.appState });
  return view;
}

const rowOf = (n: number) => screen.getByRole('button', { name: new RegExp(`Report number ${n}\\b`) });
const nextPage = () => screen.getByRole('button', { name: 'Next page' });
const prevPage = () => screen.getByRole('button', { name: 'Previous page' });

describe('ReportsScreen list', () => {
  it('summarises the reports by type and by status', async () => {
    await mount();
    const summary = await screen.findByRole('region', { name: 'Summary' });
    expect(within(summary).getByText('Total').nextElementSibling).toHaveTextContent('45');
    expect(within(summary).getByText('Wrong question').nextElementSibling).toHaveTextContent('15');
    expect(within(summary).getByText('Wrong knowledge').nextElementSibling).toHaveTextContent('15');
    expect(within(summary).getByText('System').nextElementSibling).toHaveTextContent('15');
    expect(within(summary).getByText('New').nextElementSibling).toHaveTextContent('36');
    expect(within(summary).getByText('Handled').nextElementSibling).toHaveTextContent('9');
  });

  it('lists ten reports per page, newest first, each with type, status, date, excerpt and reference', async () => {
    await mount([
      ...seeds(12),
      makeReportSeed({ id: 'rq', type: 'question', questionId: 'q1', createdAt: START + 99 * HOUR, body: `${'x'.repeat(120)}` }),
    ]);
    const list = await screen.findByRole('list', { name: 'Reports' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(10);
    expect(screen.getByText('Page 1/2')).toBeInTheDocument();
    // newest first: the question report, then r12
    expect(rows[0]).toHaveTextContent('Wrong question');
    expect(rows[0]).toHaveTextContent('New');
    expect(rows[0]).toHaveTextContent(when(START + 99 * HOUR));
    expect(rows[0]).toHaveTextContent('q1');
    expect(rows[0]).toHaveTextContent(`${'x'.repeat(100)}…`);
    expect(rows[0]).not.toHaveTextContent('x'.repeat(101));
    expect(rows[1]).toHaveTextContent('Report number 12');
    await userEvent.click(nextPage());
    expect(await screen.findByText('Page 2/2')).toBeInTheDocument();
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('narrows the list with the type, status, date and text filters', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'lesson');
    expect(await screen.findByText('Page 1/2')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'handled');
    // lesson reports that are handled: i % 3 === 1 and i % 5 === 0 -> 10, 25, 40
    expect(await screen.findByText('Page 1/1')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    await userEvent.selectOptions(screen.getByLabelText('Type'), '');
    await userEvent.selectOptions(screen.getByLabelText('Status'), '');
    await userEvent.type(screen.getByLabelText('Search text'), 'NUMBER 4');
    // 4, 40..45 -> 7 reports
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(7));
    await userEvent.clear(screen.getByLabelText('Search text'));
    await fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-06-03' } });
    await fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-06-03' } });
    // 2026-06-03 00:00..23:59 local: hours 12+i in [48, 72) -> i in [36, 45]: 10 reports
    expect(await screen.findByText('Page 1/1')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(rowOf(36)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Report number 35\b/ })).toBeNull();
  });

  it('shows an empty message with page 0/0 and disabled paging when nothing matches', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.type(screen.getByLabelText('Search text'), 'no such words');
    expect(await screen.findByText('No report matches your filters.')).toBeInTheDocument();
    expect(screen.getByText('Page 0/0')).toBeInTheDocument();
    expect(prevPage()).toBeDisabled();
    expect(nextPage()).toBeDisabled();
    expect(screen.queryByRole('listitem')).toBeNull();
  });

  it('says so when there are no reports at all', async () => {
    await mount([]);
    expect(await screen.findByText('No reports yet.')).toBeInTheDocument();
    expect(screen.getByText('Page 0/0')).toBeInTheDocument();
    expect(nextPage()).toBeDisabled();
  });

  it.each([
    ['status', () => userEvent.selectOptions(screen.getByLabelText('Status'), 'new'), 'Page 1/4'],
    ['type', () => userEvent.selectOptions(screen.getByLabelText('Type'), 'question'), 'Page 1/2'],
    ['text', () => userEvent.type(screen.getByLabelText('Search text'), 'report'), 'Page 1/5'],
    ['from date', () => fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-06-01' } }), 'Page 1/5'],
    ['to date', () => fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-06-30' } }), 'Page 1/5'],
  ])('returns to page 1 when the %s filter changes while on page 3', async (_name, change, expected) => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(nextPage());
    await userEvent.click(nextPage());
    expect(await screen.findByText('Page 3/5')).toBeInTheDocument();
    await change();
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });

  it('shows an error with a retry when the reports cannot be loaded', async () => {
    env = await makeReportsScreenEnv(seeds(3));
    const real = env.services.repos.reports.list;
    let fails = 1;
    env.services.repos.reports.list = async (q) => {
      if (fails-- > 0) throw new Error('disk gone');
      return real(q);
    };
    renderWithI18n(ReportsScreen, { services: env.services, appState: env.appState });
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the reports.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('list', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('opens a report from the keyboard', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    rowOf(45).focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('region', { name: 'Report details' })).toBeInTheDocument();
    expect(rowOf(45)).toHaveAttribute('aria-current', 'true');
  });
});

describe('ReportsScreen date range', () => {
  it('shows a hint, and an empty list, when the start date is after the end date', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    expect(screen.queryByText(/start date is after/i)).toBeNull();
    await fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-06-03' } });
    await fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-06-01' } });
    const hint = await screen.findByText('The start date is after the end date, so no report can match.');
    expect(screen.getByLabelText('From date')).toHaveAccessibleDescription(hint.textContent ?? '');
    expect(await screen.findByText('Page 0/0')).toBeInTheDocument();
    await fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-06-03' } });
    await waitFor(() => expect(screen.queryByText(/start date is after/i)).toBeNull());
  });
});

describe('ReportsScreen detail on a narrow window', () => {
  const scrollIntoView = vi.fn();
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    scrollIntoView.mockClear();
  });
  const stubWidth = (wide: boolean) => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: wide && q.includes('min-width'), media: q }));
    Element.prototype.scrollIntoView = scrollIntoView;
  };

  it('scrolls the details into view and moves focus to their heading', async () => {
    stubWidth(false);
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(rowOf(41));
    const heading = await screen.findByRole('heading', { name: 'Report details' });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(heading);
    expect(heading).toHaveFocus();
  });

  it('leaves focus on the list row when the details sit beside the list', async () => {
    stubWidth(true);
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(rowOf(41));
    await screen.findByRole('heading', { name: 'Report details' });
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(rowOf(41)).toHaveFocus();
  });
});

describe('ReportsScreen detail', () => {
  const open = async (n: number) => {
    await userEvent.click(rowOf(n));
    return await screen.findByRole('region', { name: 'Report details' });
  };

  it('shows the rendered body, the references and the dates', async () => {
    await mount([
      makeReportSeed({
        id: 'rq', type: 'question', questionId: 'q1', attemptId: 'att-9', position: 2, sourceScreen: 'practice',
        optionOrder: ['B', 'A'], selected: ['B'], isCorrect: false, createdAt: START, statusUpdatedAt: START + HOUR,
        body: 'The **answer** is wrong', appVersion: '2.3.4', locale: 'vi',
      }),
    ]);
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(screen.getByRole('button', { name: /is wrong/ }));
    const detail = await screen.findByRole('region', { name: 'Report details' });
    expect(detail.querySelector('strong')).toHaveTextContent('answer');
    expect(within(detail).getByText('Pick the first?')).toBeInTheDocument();
    expect(detail).toHaveTextContent('q1');
    expect(detail).toHaveTextContent('att-9');
    expect(detail).toHaveTextContent('practice');
    expect(detail).toHaveTextContent('2.3.4');
    expect(detail).toHaveTextContent(when(START));
    expect(detail).toHaveTextContent(when(START + HOUR));
  });

  it('shows the lesson title from the catalog for a lesson report', async () => {
    await mount([makeReportSeed({ id: 'rl', type: 'lesson', lessonId: 'compute-ec2', body: 'typo in lesson' })]);
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(screen.getByRole('button', { name: /typo in lesson/ }));
    const detail = await screen.findByRole('region', { name: 'Report details' });
    expect(within(detail).getByText('EC2 basics')).toBeInTheDocument();
    expect(detail).toHaveTextContent('compute-ec2');
  });

  it('shows the raw id, and does not crash, for a question that is no longer in the catalog', async () => {
    await mount([makeReportSeed({ id: 'rg', type: 'question', questionId: 'gone-question', body: 'removed one' })]);
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(screen.getByRole('button', { name: /removed one/ }));
    const detail = await screen.findByRole('region', { name: 'Report details' });
    expect(detail).toHaveTextContent('gone-question');
    expect(within(detail).getByText('removed one')).toBeInTheDocument();
  });

  it('renders a script in the body as text, not as a script', async () => {
    await mount([makeReportSeed({ id: 'rs', body: '<script>window.__pwned = 1</script> hello' })]);
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(screen.getByRole('button', { name: /hello/ }));
    const detail = await screen.findByRole('region', { name: 'Report details' });
    expect(detail).toHaveTextContent('<script>window.__pwned = 1</script> hello');
    expect(detail.querySelector('script')).toBeNull();
    expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined();
  });

  it('shows screenshots as data URLs whose type comes from the file bytes', async () => {
    await mount([makeReportSeed({ id: 'ri', body: 'with pics', imageBytes: [PNG_BYTES, JPEG_BYTES] })]);
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(screen.getByRole('button', { name: /with pics/ }));
    const first = await screen.findByAltText('Screenshot 1');
    const second = await screen.findByAltText('Screenshot 2');
    expect(first.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    expect(second.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('shows a placeholder, not a crash, for a screenshot whose file is missing', async () => {
    await mount([makeReportSeed({ id: 'rm', body: 'lost pic', imageBytes: [PNG_BYTES], missingImages: ['report-images/rm-9.png'] })]);
    await screen.findByRole('list', { name: 'Reports' });
    await userEvent.click(screen.getByRole('button', { name: /lost pic/ }));
    expect(await screen.findByText('Screenshot 2 could not be loaded.')).toBeInTheDocument();
    expect(await screen.findByAltText('Screenshot 1')).toBeInTheDocument();
    expect(screen.queryByAltText('Screenshot 2')).toBeNull();
  });

  it('marks a report handled: the row, the new-report count and statusUpdatedAt all change', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    expect(env.appState.newReportCount).toBe(36);
    env.clock.now = 7_777_777;
    const detail = await open(41);
    expect(rowOf(41)).toHaveTextContent('New');
    await userEvent.click(within(detail).getByRole('button', { name: 'Mark as handled' }));
    await waitFor(() => expect(rowOf(41)).toHaveTextContent('Handled'));
    expect(within(detail).getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
    expect(detail).toHaveTextContent(when(7_777_777));
    expect(env.appState.newReportCount).toBe(35);
    const stored = await env.services.repos.reports.get('r41');
    expect(stored).toMatchObject({ status: 'handled', statusUpdatedAt: 7_777_777 });
    expect(within(screen.getByRole('region', { name: 'Summary' })).getByText('Handled').nextElementSibling).toHaveTextContent('10');
  });

  it('reopens a handled report', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    env.clock.now = 8_000_000;
    const detail = await open(40);
    await userEvent.click(within(detail).getByRole('button', { name: 'Reopen' }));
    await waitFor(() => expect(rowOf(40)).toHaveTextContent('New'));
    expect(within(detail).getByRole('button', { name: 'Mark as handled' })).toBeInTheDocument();
    expect(env.appState.newReportCount).toBe(37);
    expect(await env.services.repos.reports.get('r40')).toMatchObject({ status: 'new', statusUpdatedAt: 8_000_000 });
  });

  it('keeps the report as it was and says so when the status cannot be saved', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    env.services.repos.reports.setStatus = async () => {
      throw new Error('disk full');
    };
    const detail = await open(41);
    await userEvent.click(within(detail).getByRole('button', { name: 'Mark as handled' }));
    expect(await within(detail).findByRole('alert')).toHaveTextContent('Could not update the report.');
    expect(rowOf(41)).toHaveTextContent('New');
    expect(env.appState.newReportCount).toBe(36);
  });

  it('closes the details', async () => {
    await mount();
    await screen.findByRole('list', { name: 'Reports' });
    const detail = await open(41);
    await userEvent.click(within(detail).getByRole('button', { name: 'Close details' }));
    expect(screen.queryByRole('region', { name: 'Report details' })).toBeNull();
  });

  it('speaks Vietnamese', async () => {
    env = await makeReportsScreenEnv(seeds(3));
    renderWithI18n(ReportsScreen, { services: env.services, appState: env.appState }, 'vi');
    await userEvent.click(await screen.findByRole('button', { name: /Report number 3\b/ }));
    expect(await screen.findByRole('button', { name: 'Đánh dấu đã xử lý' })).toBeInTheDocument();
    expect(screen.getByText('Trang 1/1')).toBeInTheDocument();
  });
});
