import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { loadCatalog } from '@/content/load-catalog';
import { makeRawCatalog } from '@/testing/fixtures';
import type { SqlExecutor } from '@/persistence';
import { createI18n } from '@/i18n/i18n.svelte';
import { buildServices } from './composition';
import { AppState } from './app-state.svelte';
import App from './App.svelte';

// In-memory executor: jsdom cannot host node:sqlite, so every query returns no rows.
const emptyExecutor: SqlExecutor = { execute: async () => {}, select: async () => [] };

describe('App shell', () => {
  it('mounts the tree for the default view and a placeholder for the others', async () => {
    const services = buildServices({ executor: emptyExecutor, catalog: loadCatalog(makeRawCatalog()), now: () => 0 });
    const appState = new AppState(services);
    await appState.load();
    render(App, { services, appState, i18n: createI18n('en') });
    expect(screen.getByRole('heading', { name: 'Mindmap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cloud-concepts/ })).toBeInTheDocument();
    appState.open({ view: 'history' });
    expect(await screen.findByRole('heading', { name: 'History' })).toBeInTheDocument();
  });
});
