import { mount } from 'svelte';
import './ui/tokens.css';
import App from './app/App.svelte';

mount(App, { target: document.getElementById('app')! });
