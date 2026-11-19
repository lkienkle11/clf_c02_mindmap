export const CAPSTONE_EXAM_TOPIC_IDS = ['capstone-exam-1', 'capstone-exam-2'] as const;

export function isCapstoneExamTopic(topicId: string | null): boolean {
  return CAPSTONE_EXAM_TOPIC_IDS.some((id) => id === topicId);
}
