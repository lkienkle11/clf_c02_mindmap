import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import { loadCatalog } from '@/content/load-catalog';
import { makeLesson, makeTreeRawCatalog } from '@/testing/fixtures';
import { makeFakeServices } from '@/testing/fake-services';
import { renderWithI18n } from '@/testing/render-with-i18n';
import LessonPanel from './LessonPanel.svelte';

async function mountPanel(lessonId: string, opts: { read?: string[]; body?: string; openExternal?: (u: string) => Promise<void> } = {}) {
  const raw = makeTreeRawCatalog();
  if (opts.body !== undefined) {
    raw.lessons = raw.lessons.map((l) => (l.id === lessonId ? makeLesson({ ...l, body: { en: opts.body!, vi: opts.body! } }) : l));
  }
  const fake = await makeFakeServices({ catalog: loadCatalog(raw), passedTopicIds: ['cloud-concepts', 'global-infrastructure'], readIds: opts.read ?? [] });
  const lesson = fake.services.catalog.lessons.find((l) => l.id === lessonId)!;
  const openExternal = opts.openExternal ?? vi.fn(async () => {});
  const view = renderWithI18n(LessonPanel, { services: fake.services, appState: fake.appState, lesson, openExternal });
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

  it('routes http links in the body through openExternal and prevents navigation', async () => {
    const { openExternal } = await mountPanel('compute-ec2', { body: '[docs](https://example.com/a) and [rel](#x)' });
    const http = screen.getByRole('link', { name: 'docs' });
    const proceeded = await fireEvent.click(http);
    expect(proceeded).toBe(false); // preventDefault was called
    expect(openExternal).toHaveBeenCalledWith('https://example.com/a');
    const other = await fireEvent.click(screen.getByRole('link', { name: 'rel' }));
    expect(other).toBe(false);
    expect(openExternal).toHaveBeenCalledTimes(1);
  });

  it('does nothing visible when openExternal rejects a non-allowlisted URL', async () => {
    const reject = vi.fn(async () => {
      throw new Error('not allowed');
    });
    await mountPanel('compute-ec2', { body: '[x](https://evil.example)', openExternal: reject });
    const proceeded = await fireEvent.click(screen.getByRole('link', { name: 'x' }));
    expect(proceeded).toBe(false);
    expect(reject).toHaveBeenCalledOnce();
  });

  it('previous and next buttons move within the topic; ends are disabled', async () => {
    const { appState } = await mountPanel('compute-ec2');
    expect(screen.getByRole('button', { name: /Previous lesson/ })).toBeDisabled();
    await fireEvent.click(screen.getByRole('button', { name: /Next lesson/ }));
    expect(appState.route).toEqual({ view: 'lesson', topicId: 'compute', lessonId: 'compute-lambda' });
  });

  it('back button returns to the tree', async () => {
    const { appState } = await mountPanel('compute-ec2');
    appState.open({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    await fireEvent.click(screen.getByRole('button', { name: /Back to the mindmap/ }));
    expect(appState.route).toEqual({ view: 'tree' });
  });
});
