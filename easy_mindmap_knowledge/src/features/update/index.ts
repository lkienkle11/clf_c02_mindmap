export const feature = 'update' as const;
export { UpdateController } from './logic/update-controller.svelte';
export type { UpdateStatus } from './logic/update-controller.svelte';
export type { DownloadProgress, UpdateInfo, UpdaterPort } from './logic/updater-port';
export { default as UpdateSection } from './ui/UpdateSection.svelte';
export { default as UpdatePrompt } from './ui/UpdatePrompt.svelte';
export { createTauriUpdater } from './tauri-updater';
