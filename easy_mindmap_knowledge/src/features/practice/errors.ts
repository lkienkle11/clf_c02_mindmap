export class NoQuestionsError extends Error {
  constructor(topicId: string) {
    super(`No questions available for topic "${topicId}"`);
    this.name = 'NoQuestionsError';
  }
}

/** A restored attempt cannot be trusted; the UI discards it and offers a fresh start. */
export class CorruptAttemptError extends Error {
  constructor(reason: string) {
    super(`Corrupt attempt: ${reason}`);
    this.name = 'CorruptAttemptError';
  }
}

export class KnowledgeNotAllowedError extends Error {
  constructor() {
    super('Knowledge review is not allowed in this attempt');
    this.name = 'KnowledgeNotAllowedError';
  }
}
