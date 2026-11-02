import { mount } from 'svelte';
import './ui/tokens.css';
import App from './app/App.svelte';
import { createServices } from './app/composition';
import { AppState } from './app/app-state.svelte';
import { startApp } from './app/startup';
import { createI18n } from './i18n/i18n.svelte';

const target = document.getElementById('app')!;

void startApp({
  target,
  language: navigator.language,
  reload: () => location.reload(),
  async boot() {
    const services = await createServices();
    const appState = new AppState(services);
    const locale = await appState.load();
    target.replaceChildren();
    mount(App, { target, props: { services, appState, i18n: createI18n(locale ?? 'vi') } });
  },
});
