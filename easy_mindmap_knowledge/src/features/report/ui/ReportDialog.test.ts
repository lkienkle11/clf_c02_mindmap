import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { PNG_BYTES, makeReportEnv } from '@/testing/report-env';
import type { ReportEnv } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { ReportContext } from '../logic/report-draft';
import { CaptureError } from '../capture';
import { onReportSubmitted } from '../report-events';
import ReportDialog from './ReportDialog.svelte';

const question: ReportContext = { type: 'question', questionId: 'q1', sourceScreen: 'practice' };
const lesson: ReportContext = { type: 'lesson', lessonId: 'compute-ec2', sourceScreen: 'lesson' };
const system: ReportContext = { type: 'system' };

let env: ReportEnv;
beforeEach(async () => {
  env = await makeReportEnv();
});

function mount(over: Record<string, unknown> = {}, locale: 'en' | 'vi' = 'en') {
  const onclose = vi.fn();
  const onsubmitted = vi.fn();
  const capture = vi.fn(async (_el: HTMLElement) => PNG_BYTES);
  const frame = document.createElement('div');
  const view = renderWithI18n(
    ReportDialog,
    { services: env.services, context: question, open: true, captureTarget: () => frame, capture, onclose, onsubmitted, ...over },
    locale,
  );
  return { onclose, onsubmitted, capture, frame, ...view };
}

const body = () => screen.getByRole('textbox') as HTMLTextAreaElement;
const write = (text: string) => fireEvent.input(body(), { target: { value: text } });
const submitBtn = () => screen.getByRole('button', { name: 'Submit report' });
const confirmTitle = 'Are you sure you want to close the report?';
const dialogs = () => screen.getAllByRole('dialog');

describe('ReportDialog shell', () => {
  it('uses the Vietnamese title and placeholder for each type', () => {
    const cases: [ReportContext, string, string][] = [
      [question, 'Báo cáo câu hỏi sai', 'Bạn có góp ý gì đối với câu hỏi này?'],
      [lesson, 'Báo cáo kiến thức sai', 'Bạn có góp ý gì với kiến thức này?'],
      [system, 'Báo cáo hệ thống', 'Hệ thống đang có bug gì?'],
    ];
    for (const [context, title, placeholder] of cases) {
      const { unmount } = mount({ context }, 'vi');
      expect(screen.getByRole('dialog', { name: title })).toBeInTheDocument();
      expect(body()).toHaveAttribute('placeholder', placeholder);
      unmount();
    }
  });
  it('uses the English title for each type', () => {
    const cases: [ReportContext, string][] = [
      [question, 'Report wrong question'],
      [lesson, 'Report wrong knowledge'],
      [system, 'Report system issue'],
    ];
    for (const [context, title] of cases) {
      const { unmount } = mount({ context });
      expect(screen.getByRole('dialog', { name: title })).toBeInTheDocument();
      unmount();
    }
  });
  it('has "Nộp báo cáo" and "Đóng" in the footer', () => {
    mount({}, 'vi');
    expect(screen.getByRole('button', { name: 'Nộp báo cáo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
  });
  it('renders nothing when closed', () => {
    mount({ open: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('marks the dialog and its backdrop data-report-ignore so a capture leaves them out', () => {
    mount();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-report-ignore');
    expect(screen.getByTestId('modal-backdrop')).toHaveAttribute('data-report-ignore');
  });
});

describe('ReportDialog closing', () => {
  it('Đóng asks for confirmation (vi text) and the report stays open', async () => {
    const { onclose } = mount({}, 'vi');
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.getByRole('dialog', { name: 'Bạn có chắc chắn muốn đóng báo cáo không?' })).toBeInTheDocument();
    expect(dialogs()).toHaveLength(2);
    expect(onclose).not.toHaveBeenCalled();
  });
  it('Escape asks for confirmation', async () => {
    const { onclose } = mount();
    await userEvent.keyboard('{Escape}');
    expect(await screen.findByRole('dialog', { name: confirmTitle })).toBeInTheDocument();
    expect(onclose).not.toHaveBeenCalled();
  });
  it('a backdrop click asks for confirmation', async () => {
    const { onclose } = mount();
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(await screen.findByRole('dialog', { name: confirmTitle })).toBeInTheDocument();
    expect(onclose).not.toHaveBeenCalled();
  });
  it('Escape with the confirmation open closes only the confirmation', async () => {
    const { onclose } = mount();
    await userEvent.keyboard('{Escape}');
    await screen.findByRole('dialog', { name: confirmTitle });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: confirmTitle })).toBeNull());
    expect(screen.getByRole('dialog', { name: 'Report wrong question' })).toBeInTheDocument();
    expect(onclose).not.toHaveBeenCalled();
  });
  it('a backdrop click on the confirmation closes only the confirmation', async () => {
    const { onclose } = mount();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    const confirm = await screen.findByRole('dialog', { name: confirmTitle });
    await userEvent.click(confirm.parentElement!);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: confirmTitle })).toBeNull());
    expect(onclose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Report wrong question' })).toBeInTheDocument();
  });
  it('"Keep editing" returns to the report with the draft intact', async () => {
    mount();
    await write('typed text');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: confirmTitle })).toBeNull());
    expect(body().value).toBe('typed text');
  });
  it('confirming closes the report and discards the draft', async () => {
    const { onclose } = mount();
    await write('typed text');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
    expect(onclose).toHaveBeenCalledTimes(1);
    expect(env.created).toHaveLength(0);
    // The owner keeps the dialog mounted, so a reopened dialog must come back empty.
    expect(body().value).toBe('');
    expect(screen.queryByRole('dialog', { name: confirmTitle })).toBeNull();
  });
});

describe('ReportDialog submit', () => {
  it('disables submit for an empty body and enables it once there is text', async () => {
    mount();
    expect(submitBtn()).toBeDisabled();
    await write('   ');
    expect(submitBtn()).toBeDisabled();
    await write('wrong answer');
    expect(submitBtn()).toBeEnabled();
  });
  it('a body of 1500 characters is accepted and the counter shows 1500/1500', async () => {
    mount();
    await write('a'.repeat(1500));
    expect(screen.getByText('1500/1500')).toBeInTheDocument();
    expect(submitBtn()).toBeEnabled();
  });
  it('submits the question report, then calls onsubmitted with the id and closes', async () => {
    const { onclose, onsubmitted } = mount();
    await write('The answer is wrong');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(onsubmitted).toHaveBeenCalledTimes(1));
    expect(env.created).toHaveLength(1);
    const { row, paths } = env.created[0];
    expect(onsubmitted).toHaveBeenCalledWith(row.id);
    expect(onclose).toHaveBeenCalledTimes(1);
    expect(row).toMatchObject({ type: 'question', questionId: 'q1', sourceScreen: 'practice', body: 'The answer is wrong', locale: 'en' });
    expect(row.appVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(paths).toEqual([]);
  });
  it('notifies report listeners once the report is saved', async () => {
    const seen = vi.fn(() => expect(env.created).toHaveLength(1));
    const off = onReportSubmitted(seen);
    mount();
    await write('The answer is wrong');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(seen).toHaveBeenCalledTimes(1));
    off();
  });
  it('sends the locale in use', async () => {
    mount({}, 'vi');
    await write('sai');
    await userEvent.click(screen.getByRole('button', { name: 'Nộp báo cáo' }));
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row.locale).toBe('vi');
  });
  it('does not submit twice when clicked again while the save is still running', async () => {
    const hold = env.holdCreate();
    const { onsubmitted } = mount();
    await write('text');
    // Two clicks in the same task: the button is not yet re-rendered as disabled, so only the guard stops the second.
    const btn = submitBtn();
    btn.click();
    btn.click();
    await waitFor(() => expect(env.createCalls()).toBe(1));
    expect(btn).toBeDisabled();
    hold.release();
    await waitFor(() => expect(onsubmitted).toHaveBeenCalledTimes(1));
    expect(env.createCalls()).toBe(1);
    expect(env.created).toHaveLength(1);
  });
  it('a failed save shows an alert, keeps the draft and does not close; a retry works', async () => {
    const { onclose, onsubmitted } = mount();
    await write('keep me');
    env.failCreateOnce();
    await userEvent.click(submitBtn());
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not save/i);
    expect(body().value).toBe('keep me');
    expect(onclose).not.toHaveBeenCalled();
    expect(onsubmitted).not.toHaveBeenCalled();
    expect(submitBtn()).toBeEnabled();
    await userEvent.click(submitBtn());
    await waitFor(() => expect(onsubmitted).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('ReportDialog while a save is running', () => {
  async function startHeldSubmit() {
    const hold = env.holdCreate();
    const view = mount();
    await write('slow report');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(env.createCalls()).toBe(1));
    return { hold, ...view };
  }

  it('ignores Escape, backdrop and Close, saves once, and closes by success', async () => {
    const { hold, onclose, onsubmitted } = await startHeldSubmit();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByRole('dialog', { name: confirmTitle })).toBeNull();
    expect(dialogs()).toHaveLength(1);
    expect(onclose).not.toHaveBeenCalled();
    hold.release();
    await waitFor(() => expect(onsubmitted).toHaveBeenCalledTimes(1));
    expect(onclose).toHaveBeenCalledTimes(1);
    expect(env.created).toHaveLength(1);
    expect(env.createCalls()).toBe(1);
  });
  it('a failing save after a close attempt keeps the draft and shows the alert', async () => {
    const { hold, onclose, onsubmitted } = await startHeldSubmit();
    await userEvent.keyboard('{Escape}');
    hold.fail();
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not save/i);
    expect(body().value).toBe('slow report');
    expect(onclose).not.toHaveBeenCalled();
    expect(onsubmitted).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: confirmTitle })).toBeNull();
    expect(submitBtn()).toBeEnabled();
  });
  it('a throwing onsubmitted is not reported as a save failure and does not allow a duplicate', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onsubmitted = vi.fn(() => {
      throw new Error('parent broke');
    });
    const { onclose } = mount({ onsubmitted });
    await write('text');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(onclose).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(env.created).toHaveLength(1);
    expect(body().value).toBe('');
    expect(log).toHaveBeenCalledTimes(1);
    log.mockRestore();
  });
});

describe('ReportDialog stale async results and focus', () => {
  const deferred = <T,>() => {
    let resolve!: (v: T) => void;
    const promise = new Promise<T>((r) => (resolve = r));
    return { promise, resolve };
  };
  const discardNow = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
  };

  it('a capture that finishes after Discard does not fill the reopened dialog', async () => {
    const shot = deferred<Uint8Array>();
    const { onclose } = mount({ capture: () => shot.promise });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    await discardNow();
    expect(onclose).toHaveBeenCalledTimes(1);
    shot.resolve(PNG_BYTES);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('button', { name: 'Take screenshot' })).toBeInTheDocument();
  });
  it('a file read that finishes after Discard does not fill the reopened dialog', async () => {
    mount({ context: system, captureTarget: undefined });
    const read = deferred<ArrayBuffer>();
    const file = new File([PNG_BYTES], 'a.png', { type: 'image/png' });
    Object.defineProperty(file, 'arrayBuffer', { value: () => read.promise });
    await fireEvent.change(screen.getByLabelText(/Upload images/), { target: { files: [file] } });
    await discardNow();
    read.resolve(PNG_BYTES.buffer as ArrayBuffer);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('focuses the text box when the dialog opens, and the safe button of the confirmation', async () => {
    mount();
    await waitFor(() => expect(document.activeElement).toBe(body()));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    const keep = await screen.findByRole('button', { name: 'Keep editing' });
    await waitFor(() => expect(document.activeElement).toBe(keep));
  });
});

describe('ReportDialog screenshot (question and lesson)', () => {
  it('captures the target frame and submits the PNG', async () => {
    const { capture, frame, onsubmitted } = mount();
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    expect(await screen.findByRole('img', { name: 'Screenshot preview' })).toBeInTheDocument();
    expect(capture).toHaveBeenCalledWith(frame);
    await write('see the picture');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(onsubmitted).toHaveBeenCalled());
    expect(env.created[0].paths).toHaveLength(1);
    expect(env.storage.files.get(`/app-data/${env.created[0].paths[0]}`)).toEqual(PNG_BYTES);
  });
  it('delete removes the screenshot so it is not submitted', async () => {
    mount({ context: lesson });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Remove screenshot' }));
    await write('text only');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].paths).toEqual([]);
    expect(env.created[0].row.type).toBe('lesson');
  });
  it('a capture error shows an inline alert and submit still works without an image', async () => {
    const capture = vi.fn().mockRejectedValue(new CaptureError(new Error('boom')));
    const { onsubmitted } = mount({ capture });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await write('no picture');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(onsubmitted).toHaveBeenCalled());
    expect(env.created[0].paths).toEqual([]);
  });
  it('shows no capture button when the caller gave no target', () => {
    mount({ captureTarget: undefined });
    expect(screen.queryByRole('button', { name: 'Take screenshot' })).toBeNull();
  });
});

describe('ReportDialog images (system)', () => {
  const upload = (...files: File[]) => fireEvent.change(screen.getByLabelText(/Upload images/), { target: { files } });
  const png = (n: string) => new File([PNG_BYTES], n, { type: 'image/png' });

  it('has an upload control and no capture button', () => {
    mount({ context: system, captureTarget: undefined });
    expect(screen.getByLabelText(/Upload images/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Take screenshot' })).toBeNull();
  });
  it('accepts up to 3 images, rejects the 4th and a non-image with an alert, and submits three', async () => {
    const { onsubmitted } = mount({ context: system, captureTarget: undefined });
    await upload(png('1.png'), png('2.png'), png('3.png'));
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(3));
    await upload(png('4.png'));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await upload(new File(['x'], 'a.txt', { type: 'text/plain' }));
    expect(within(await screen.findByRole('alert')).getByText('Only PNG or JPEG images.')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    await write('the app froze');
    await userEvent.click(submitBtn());
    await waitFor(() => expect(onsubmitted).toHaveBeenCalled());
    expect(env.created[0].row.type).toBe('system');
    expect(env.created[0].paths).toHaveLength(3);
  });
});
