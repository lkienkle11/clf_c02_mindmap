import type { Services } from '@/app/composition';
import type { Question } from '@/content/types';
import { PracticeSession, planQuestions } from '@/features/practice';
import { makeRng } from '@/random/seeded-random';
import { ExamNotAvailableError } from './errors';
import { examLimitMs, EXAM_MIN_QUESTIONS } from './logic/exam-config';
import { drawCapstone, drawCheckpoint, historyOf } from './logic/draw-exam';
import type { AnswerHistory } from './logic/draw-exam';
import { checkpointGroups } from './logic/groups';
import { saveExamOptions } from './options';
import type { ExamOptions } from './options';

type Target = { kind: 'checkpoint'; groupIndex: number } | { kind: 'practice'; topicId: 'capstone' };

async function start(
  services: Services,
  target: Target,
  options: ExamOptions,
  onSubmitted: () => Promise<void>,
  draw: (history: AnswerHistory, rng: () => number) => Question[],
): Promise<PracticeSession> {
  const history = historyOf(await services.repos.attempts.listGradedAnswers());
  const rng = makeRng(services.now() % 0x100000000);
  const questions = draw(history, rng);
  if (questions.length < EXAM_MIN_QUESTIONS) {
    throw new ExamNotAvailableError(`only ${questions.length} questions available, need ${EXAM_MIN_QUESTIONS}`);
  }
  const plan = planQuestions(questions, rng);
  await saveExamOptions(services.repos.settings, options);
  return PracticeSession.startExam(services, {
    kind: target.kind,
    topicId: target.kind === 'practice' ? target.topicId : null,
    groupIndex: target.kind === 'checkpoint' ? target.groupIndex : null,
    plan,
    limitMs: examLimitMs(plan.length, options.extraTime),
  }, onSubmitted);
}

/** Starts the checkpoint exam of one topic group. Whether the group is unlocked is the caller's concern. */
export async function startCheckpoint(
  services: Services,
  groupIndex: number,
  options: ExamOptions,
  onSubmitted: () => Promise<void>,
): Promise<PracticeSession> {
  const catalog = services.catalog;
  const group = checkpointGroups(catalog.topics).find((g) => g.index === groupIndex);
  if (group === undefined) throw new ExamNotAvailableError(`unknown checkpoint group ${groupIndex}`);
  return start(services, { kind: 'checkpoint', groupIndex }, options, onSubmitted,
    (history, rng) => drawCheckpoint(catalog, group, history, rng));
}

/** Starts the full-size Capstone exam (a practice attempt on the 'capstone' topic). */
export async function startCapstoneExam(
  services: Services,
  options: ExamOptions,
  onSubmitted: () => Promise<void>,
): Promise<PracticeSession> {
  const catalog = services.catalog;
  return start(services, { kind: 'practice', topicId: 'capstone' }, options, onSubmitted,
    (history, rng) => drawCapstone(catalog, history, rng));
}
