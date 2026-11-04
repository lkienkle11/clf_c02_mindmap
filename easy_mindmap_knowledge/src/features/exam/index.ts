export const feature = 'exam' as const;
export {
  EXAM_MINUTES,
  EXAM_MINUTES_EXTRA,
  EXAM_MIN_QUESTIONS,
  EXAM_QUESTION_COUNT,
  examLimitMs,
} from './logic/exam-config';
export { CHECKPOINT_GROUP_SIZE, checkpointGroups, gateBefore } from './logic/groups';
export type { CheckpointGroup } from './logic/groups';
export { DOMAIN_OF_TOPIC, DOMAIN_WEIGHTS } from './logic/domains';
export type { DomainId } from './logic/domains';
export { allocate } from './logic/allocate';
export { drawBucket, drawCapstone, drawCheckpoint, historyOf } from './logic/draw-exam';
export type { AnswerHistory } from './logic/draw-exam';
export { checkpointState, isGateOpen, passedCheckpointGroups } from './logic/gates';
export type { CheckpointState } from './logic/gates';
