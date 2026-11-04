import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import { loadCatalog } from '@/content/load-catalog';
import { makeLesson, makeTreeRawCatalog } from '@/testing/fixtures';
import { makeFakeServices } from '@/testing/fake-services';
import { renderWithI18n } from '@/testing/render-with-i18n';
import LessonPanel from './LessonPanel.svelte';

async function mountPanel(
  lessonId: string,
  opts: { read?: string[]; body?: string; openExternal?: (u: string) => Promise<void>; canPractice?: (topicId: string) => boolean } = {},
) {
  const raw = makeTreeRawCatalog();
  if (opts.body !== undefined) {
    raw.lessons = raw.lessons.map((l) => (l.id === lessonId ? makeLesson({ ...l, body: { en: opts.body!, vi: opts.body! } }) : l));
  }
  const fake = await makeFakeServices({ catalog: loadCatalog(raw), passedTopicIds: ['cloud-concepts', 'global-infrastructure'], readIds: opts.read ?? [] });
  const lesson = fake.services.catalog.lessons.find((l) => l.id === lessonId)!;
  const openExternal = opts.openExternal ?? vi.fn(async () => {});
  const canPractice = opts.canPractice ?? vi.fn(() => true);
  const view = renderWithI18n(LessonPanel, { services: fake.services, appState: fake.appState, lesson, openExternal, canPractice });
  return { ...fake, ...view, openExternal };
}

describe('LessonPanel', () => {
  it('renders the title and the markdown body', async () => {
    await mountPanel('compute-ec2');
    expect(screen.getByRole('heading', { level: 1, name: 'EC2 basics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'EC2' })).toBeInTheDocument();
    expect(screen.getByText('servers').tagName).toBe('STRONG');
  });

  it('shows raw HTML in the body as escaped text, never as elements', async () => {
    const { container } = await mountPanel('compute-ec2', { body: 'hello <script>alert(1)</script>' });
    expect(container.querySelector('[data-lesson-body] script')).toBeNull();
    expect(container.querySelector('[data-lesson-body]')).toHaveTextContent('<script>alert(1)</script>');
  });

  it('complete button marks the lesson read then refreshes progress', async () => {
    const { appState, markReadCalls } = await mountPanel('compute-ec2');
    expect(appState.readIds.has('compute-ec2')).toBe(false);
    await fireEvent.click(screen.getByRole('button', { name: 'Complete lesson' }));
    await waitFor(() => expect(appState.readIds.has('compute-ec2')).toBe(true));
    expect(markReadCalls).toEqual([{ lessonId: 'compute-ec2', at: 1000 }]);
    expect(screen.queryByRole('button', { name: 'Complete lesson' })).not.toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('an already-read lesson shows the done state, stays readable and offers no complete button', async () => {
    await mountPanel('compute-ec2', { read: ['compute-ec2'] });
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete lesson' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'EC2' })).toBeInTheDocument();
  });

  it('video button opens exactly the YouTube search URL', async () => {
    const { openExternal } = await mountPanel('compute-video');
    await fireEvent.click(screen.getByRole('button', { name: 'Open video search' }));
    expect(openExternal).toHaveBeenCalledWith('https://www.youtube.com/results?search_query=aws%20ec2%20tutorial');
  });

  it('has no video button when the lesson has no videoQuery', async () => {
    await mountPanel('compute-ec2');
    expect(screen.queryByRole('button', { name: 'Open video search' })).not.toBeInTheDocument();
  });

  it('routes allowed links in the body through openExternal, even from a nested element, and prevents navigation', async () => {
    const { openExternal } = await mountPanel('compute-ec2', { body: '[**docs**](https://docs.aws.amazon.com/ec2/)' });
    const link = screen.getByRole('link', { name: 'docs' });
    const proceeded = await fireEvent.click(screen.getByText('docs')); // the <strong> inside the <a>
    expect(proceeded).toBe(false);
    expect(openExternal).toHaveBeenCalledWith('https://docs.aws.amazon.com/ec2/');
    expect(link).toHaveAttribute('href', 'https://docs.aws.amazon.com/ec2/');
  });

  it('prevents middle-click and modifier-click navigation without opening anything', async () => {
    const { openExternal } = await mountPanel('compute-ec2', { body: '[docs](https://docs.aws.amazon.com/ec2/)' });
    const link = screen.getByRole('link', { name: 'docs' });
    expect(await fireEvent(link, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }))).toBe(false);
    expect(await fireEvent.click(link, { ctrlKey: true })).toBe(false);
    expect(await fireEvent.click(link, { metaKey: true })).toBe(false);
    expect(openExternal).not.toHaveBeenCalled();
  });

  it('renders links that are not allowed as plain text without an href', async () => {
    const { container } = await mountPanel('compute-ec2', {
      body: '[evil](https://evil.example/x) [rel](#x) [js](javascript:alert(1)) [yt](https://www.youtube.com/results?search_query=a)',
    });
    const body = container.querySelector('[data-lesson-body]')!;
    expect(body).toHaveTextContent('evil rel js yt');
    expect(screen.queryByRole('link', { name: 'evil' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'rel' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'js' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'yt' })).toBeInTheDocument();
    expect(body.querySelectorAll('a')).toHaveLength(1);
  });

  it('shows an alert when openExternal rejects for a body link', async () => {
    const reject = vi.fn(async () => {
      throw new Error('boom');
    });
    await mountPanel('compute-ec2', { body: '[docs](https://docs.aws.amazon.com/)', openExternal: reject });
    await fireEvent.click(screen.getByRole('link', { name: 'docs' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not open the link');
  });

  it('shows an alert when openExternal rejects for the video button', async () => {
    const reject = vi.fn(async () => {
      throw new Error('boom');
    });
    await mountPanel('compute-video', { openExternal: reject });
    await fireEvent.click(screen.getByRole('button', { name: 'Open video search' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not open the link');
  });

  it('when markRead rejects it shows an alert and keeps the button usable', async () => {
    const { services, markReadCalls } = await mountPanel('compute-ec2');
    const original = services.repos.lessonProgress.markRead;
    let fail = true;
    services.repos.lessonProgress.markRead = async (id: string, at: number) => {
      if (fail) throw new Error('db down');
      return original(id, at);
    };
    const button = screen.getByRole('button', { name: 'Complete lesson' });
    await fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your progress');
    await waitFor(() => expect(button).toBeEnabled());
    fail = false;
    await fireEvent.click(button);
    await waitFor(() => expect(markReadCalls).toHaveLength(1));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('when refresh rejects it shows an alert and re-enables the button', async () => {
    const { appState } = await mountPanel('compute-ec2');
    appState.refresh = async () => {
      throw new Error('refresh failed');
    };
    const button = screen.getByRole('button', { name: 'Complete lesson' });
    await fireEvent.click(button);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('double click calls markRead only once while pending', async () => {
    const { services } = await mountPanel('compute-ec2');
    let calls = 0;
    let release: () => void = () => {};
    services.repos.lessonProgress.markRead = () => {
      calls++;
      return new Promise<void>((resolve) => {
        release = resolve;
      });
    };
    const button = screen.getByRole('button', { name: 'Complete lesson' });
    await fireEvent.click(button);
    expect(button).toBeDisabled();
    await fireEvent.click(button);
    expect(calls).toBe(1);
    release();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('previous and next buttons move within the topic; ends are disabled', async () => {
    const { appState } = await mountPanel('compute-ec2');
    expect(screen.getByRole('button', { name: /Previous lesson/ })).toBeDisabled();
    await fireEvent.click(screen.getByRole('button', { name: /Next lesson/ }));
    expect(appState.route).toEqual({ view: 'lesson', topicId: 'compute', lessonId: 'compute-lambda' });
  });

  it('a non-last lesson shows Next and no Practice button', async () => {
    await mountPanel('compute-ec2');
    expect(screen.getByRole('button', { name: /Next lesson/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Practice' })).not.toBeInTheDocument();
  });

  it('on the last lesson when the topic may be practised, Practice opens the topic practice route', async () => {
    const canPractice = vi.fn(() => true);
    const { appState } = await mountPanel('compute-video', { read: ['compute-ec2', 'compute-lambda'], canPractice });
    expect(screen.queryByRole('button', { name: /Next lesson/ })).not.toBeInTheDocument();
    const practice = screen.getByRole('button', { name: 'Practice' });
    expect(practice).toBeEnabled();
    expect(screen.queryByText('Read all required lessons first')).not.toBeInTheDocument();
    expect(canPractice).toHaveBeenCalledWith('compute');
    await fireEvent.click(practice);
    expect(appState.route).toEqual({ view: 'practice', topicId: 'compute' });
  });

  it('on the last lesson when practice is locked, Practice is disabled, shows the reason as visible text and does not navigate', async () => {
    const { appState } = await mountPanel('compute-video', { read: ['compute-ec2'], canPractice: () => false });
    const practice = screen.getByRole('button', { name: 'Practice' });
    expect(practice).toBeDisabled();
    const reason = screen.getByText('Read all required lessons first');
    expect(reason.tagName).toBe('P');
    await fireEvent.click(practice);
    expect(appState.route.view).not.toBe('practice');
  });

  it('a non-last lesson keeps Next and shows no practice reason, even when practice is locked', async () => {
    await mountPanel('compute-ec2', { canPractice: () => false });
    expect(screen.getByRole('button', { name: /Next lesson/ })).toBeEnabled();
    expect(screen.queryByText('Read all required lessons first')).not.toBeInTheDocument();
  });

  it('back button returns to the tree', async () => {
    const { appState } = await mountPanel('compute-ec2');
    appState.open({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    await fireEvent.click(screen.getByRole('button', { name: /Back to the mindmap/ }));
    expect(appState.route).toEqual({ view: 'tree' });
  });
});
