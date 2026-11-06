/** Too few questions can be drawn to run a meaningful exam (or the checkpoint group does not exist). */
export class ExamNotAvailableError extends Error {
  constructor(reason: string) {
    super(`Exam not available: ${reason}`);
    this.name = 'ExamNotAvailableError';
  }
}
