export const feature = 'mindmap' as const;
export {
  completedTopicIds,
  currentLesson,
  practiceUnlocked,
  topicStatuses
} from './logic/topic-status';
export type { TopicStatus } from './logic/topic-status';
export { layoutTree } from './logic/tree-layout';
export type { Branch, Leaf, TreeLayout } from './logic/tree-layout';
export { stopLeafId, waterPath } from './logic/water-path';
export type { WaterPath, WaterSegment } from './logic/water-path';
