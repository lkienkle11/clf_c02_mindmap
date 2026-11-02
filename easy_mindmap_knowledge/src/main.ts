import { mount } from 'svelte';
import './ui/tokens.css';
import App from './app/App.svelte';
import { createServices } from './app/composition';
import { AppState } from './app/app-state.svelte';
import { createI18n } from './i18n/i18n.svelte';

const target = document.getElementById('app')!;

async function start(): Promise<void> {
  const services = await createServices();
  const appState = new AppState(services);
  const locale = await appState.load();
  mount(App, { target, props: { services, appState, i18n: createI18n(locale ?? 'vi') } });
}

start().catch((err: unknown) => {
  console.error(err);
  const box = document.createElement('main');
  box.className = 'p-6';
  box.setAttribute('role', 'alert');
  box.textContent = `${createI18n('vi').t('app.loadError')}: ${err instanceof Error ? err.message : String(err)}`;
  target.replaceChildren(box);
});
