import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { loadCatalog } from '@/content/load-catalog';
import { makeReportEnv } from '@/testing/report-env';
import { makeTreeRawCatalog } from '@/testing/fixtures';
import { renderWithI18n } from '@/testing/render-with-i18n';
import KnowledgeOverlay from './KnowledgeOverlay.svelte';

async function mount(onreportchange = vi.fn()) {
  const env = await makeReportEnv();
  // compute has 3 lessons in this catalog: compute-ec2, compute-lambda, compute-video.
  const services = { ...env.services, catalog: loadCatalog(makeTreeRawCatalog()) };
  renderWithI18n(KnowledgeOverlay, { services, topicId: 'compute', open: true, timeLeft: null, onclose: vi.fn(), onreportchange });
  return { env, onreportchange };
}

describe('KnowledgeOverlay report buttons', () => {
  it('offers one report button per lesson article', async () => {
    await mount();
    const dlg = screen.getByRole('dialog', { name: 'Review knowledge' });
    const articles = within(dlg).getAllByRole('article');
    expect(articles).toHaveLength(3);
    for (const a of articles) expect(within(a).getAllByRole('button', { name: 'Report' })).toHaveLength(1);
    expect(within(dlg).getAllByRole('button', { name: 'Report' })).toHaveLength(3);
  });

  it('reports the lesson of the clicked article with sourceScreen "knowledge"', async () => {
    const { env } = await mount();
    const second = within(screen.getByRole('dialog', { name: 'Review knowledge' })).getAllByRole('article')[1];
    await userEvent.click(within(second).getByRole('button', { name: 'Report' }));
    expect(screen.getByRole('dialog', { name: 'Report wrong knowledge' })).toBeInTheDocument();
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'wrong' } });
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ type: 'lesson', lessonId: 'compute-lambda', sourceScreen: 'knowledge' });
  });

  it('fires onreportchange(true) when the dialog opens, then (false) when it closes', async () => {
    const { onreportchange } = await mount();
    await userEvent.click(screen.getAllByRole('button', { name: 'Report' })[0]);
    expect(onreportchange.mock.calls).toEqual([[true]]);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' })); // confirm discarding
    await waitFor(() => expect(onreportchange.mock.calls).toEqual([[true], [false]]));
  });
});
