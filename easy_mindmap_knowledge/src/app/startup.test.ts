import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { startApp } from './startup';

function target(): HTMLElement {
  document.body.replaceChildren();
  const el = document.createElement('div');
  document.body.append(el);
  return el;
}

describe('startApp', () => {
  it('shows a bilingual loading screen before boot settles, and boot replaces it', async () => {
    const el = target();
    let release!: () => void;
    const started = startApp({
      target: el,
      language: 'en-US',
      reload: vi.fn(),
      boot: () => new Promise<void>((r) => { release = r; }).then(() => { el.replaceChildren('APP'); }),
    });
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading...');
    expect(status).toHaveTextContent('Đang tải...');
    release();
    await started;
    expect(el).toHaveTextContent('APP');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('on failure shows an English headline, a hint and a Reload button; the raw error sits in details', async () => {
    const el = target();
    const reload = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await startApp({ target: el, language: 'en-GB', reload, boot: async () => { throw new Error('SQLITE_CANTOPEN: unable to open'); } });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('lang', 'en');
    const heading = within(alert).getByRole('heading', { name: 'The app could not start' });
    expect(heading).not.toHaveTextContent('SQLITE');
    expect(within(alert).getByText(/Try reloading/)).toBeInTheDocument();
    const details = alert.querySelector('details')!;
    expect(details).not.toHaveAttribute('open');
    expect(details).toHaveTextContent('SQLITE_CANTOPEN: unable to open');
    await userEvent.click(within(alert).getByRole('button', { name: 'Reload' }));
    expect(reload).toHaveBeenCalledOnce();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('speaks Vietnamese when the system language is Vietnamese', async () => {
    const el = target();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await startApp({ target: el, language: 'vi-VN', reload: vi.fn(), boot: async () => { throw 'boom'; } });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('lang', 'vi');
    expect(within(alert).getByRole('heading', { name: 'Không thể khởi động ứng dụng' })).toBeInTheDocument();
    expect(within(alert).getByRole('button', { name: 'Tải lại' })).toBeInTheDocument();
    expect(alert.querySelector('details')).toHaveTextContent('boom');
  });
});
