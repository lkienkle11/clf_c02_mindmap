export const feature = 'history' as const;
export { mostMissed, scoreSeries, weakTopics } from './logic/history-stats';
export type { ScorePoint } from './logic/history-stats';
export { default as HistoryScreen } from './ui/HistoryScreen.svelte';
