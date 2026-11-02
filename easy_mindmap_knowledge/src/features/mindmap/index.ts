export const feature = 'mindmap' as const;
export {
  completedTopicIds,
  currentLesson,
  practiceUnlocked,
  topicStatuses
} from './logic/topic-status';
export type { TopicStatus } from './logic/topic-status';
