import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeReportEnv } from '@/testing/report-env';
import type { ReportEnv } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import ReportButton from './ReportButton.svelte';

let env: ReportEnv;
beforeEach(async () => {
  env = await makeReportEnv();
});

function mount(over: Record<string, unknown> = {}, locale: 'en' | 'vi' = 'en') {
  const onopenchange = vi.fn();
  const view = renderWithI18n(
    ReportButton,
    { services: env.services, context: { type: 'question', questionId: 'q1', sourceScreen: 'practice' }, captureTarget: () => document.body, onopenchange, ...over },
    locale,
  );
  return { onopenchange, ...view };
}

describe('ReportButton', () => {
  it('shows the label "Báo cáo" / "Report"', () => {
    mount({}, 'vi');
    expect(screen.getByRole('button', { name: 'Báo cáo' })).toBeInTheDocument();
  });
  it('is closed at first and opens a dialog titled "Báo cáo câu hỏi sai"', async () => {
    const { onopenchange } = mount({}, 'vi');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onopenchange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Báo cáo' }));
    expect(screen.getByRole('dialog', { name: 'Báo cáo câu hỏi sai' })).toBeInTheDocument();
    expect(onopenchange).toHaveBeenCalledTimes(1);
    expect(onopenchange).toHaveBeenLastCalledWith(true);
  });
  it('fires onopenchange(false) after the close is confirmed, and the dialog goes away', async () => {
    const { onopenchange } = mount();
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onopenchange).toHaveBeenCalledTimes(1);
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onopenchange.mock.calls).toEqual([[true], [false]]);
  });
  it('fires onopenchange(false) once after a successful submit', async () => {
    const { onopenchange } = mount();
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'bad answer' } });
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onopenchange.mock.calls).toEqual([[true], [false]]);
    expect(env.created).toHaveLength(1);
  });
  it('returns focus to the button when the dialog closes', async () => {
    mount();
    const btn = screen.getByRole('button', { name: 'Report' });
    await userEvent.click(btn);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
    await waitFor(() => expect(document.activeElement).toBe(btn));
  });
  it('can be opened again with an empty draft', async () => {
    mount();
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'draft' } });
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('');
  });
  it('accepts a class for placement and keeps the report colours', () => {
    mount({ class: 'ml-2' });
    const cls = screen.getByRole('button', { name: 'Report' }).className;
    expect(cls).toContain('ml-2');
    expect(cls).toContain('bg-report');
    expect(cls).toContain('text-report-foreground');
    expect(cls).toContain('border-report-border');
    expect(cls).not.toContain('bg-primary');
    expect(cls).toContain('min-h-11');
  });
});

describe('report colour tokens', () => {
  const css = readFileSync(join(process.cwd(), 'src', 'ui', 'tokens.css'), 'utf8');
  const token = (name: string): string => {
    const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`).exec(css);
    if (!m) throw new Error(`missing token --color-${name}`);
    return m[1];
  };
  const lum = (hex: string): number => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string): number => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  it('uses the pale yellow fill', () => {
    expect(token('report').toLowerCase()).toBe('#fde68a');
  });
  it('text contrast is at least 7:1 on the fill and on hover', () => {
    expect(contrast(token('report-foreground'), token('report'))).toBeGreaterThanOrEqual(7);
    expect(contrast(token('report-foreground'), token('report-hover'))).toBeGreaterThanOrEqual(7);
  });
  it('the amber border stands out from the white surface (3:1 for UI components)', () => {
    expect(contrast(token('report-border'), '#ffffff')).toBeGreaterThanOrEqual(3);
  });
});
