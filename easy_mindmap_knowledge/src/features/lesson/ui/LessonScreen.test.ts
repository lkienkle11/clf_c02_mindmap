import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { loadCatalog } from '@/content/load-catalog';
import { makeTreeRawCatalog } from '@/testing/fixtures';
import { makeFakeServices } from '@/testing/fake-services';
import { renderWithI18n } from '@/testing/render-with-i18n';
import LessonScreen from './LessonScreen.svelte';

async function mountScreen(passed: string[]) {
  const fake = await makeFakeServices({ catalog: loadCatalog(makeTreeRawCatalog()), passedTopicIds: passed });
  const openExternal = vi.fn(async () => {});
  renderWithI18n(LessonScreen, { services: fake.services, appState: fake.appState, openExternal });
  return fake;
}

describe('LessonScreen', () => {
  it('shows the lesson of an unlocked topic', async () => {
    const { appState } = await mountScreen(['cloud-concepts', 'global-infrastructure']);
    appState.open({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    expect(await screen.findByRole('heading', { level: 1, name: 'EC2 basics' })).toBeInTheDocument();
  });

  it('redirects to the tree instead of opening a lesson of a locked topic', async () => {
    const { appState } = await mountScreen([]);
    appState.open({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    await waitFor(() => expect(appState.route).toEqual({ view: 'tree' }));
    expect(screen.queryByRole('heading', { level: 1, name: 'EC2 basics' })).not.toBeInTheDocument();
  });

  it('redirects to the tree for an unknown lesson or a lesson of another topic', async () => {
    const { appState } = await mountScreen(['cloud-concepts', 'global-infrastructure']);
    appState.open({ view: 'lesson', topicId: 'compute', lessonId: 'cloud-intro' });
    await waitFor(() => expect(appState.route).toEqual({ view: 'tree' }));
  });
});
