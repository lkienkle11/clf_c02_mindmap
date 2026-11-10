import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

afterEach(() => cleanup());

// jsdom has no layout and logs "Not implemented: Window's scrollTo()" on every call. The mind map calls it when it
// restores the vertical position on remount; a no-op keeps the test output clean without changing the component.
// This setup file also runs for node-environment tests, where there is no window.
if (typeof window !== 'undefined') window.scrollTo = () => {};
