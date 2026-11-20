export const POSTPONED_KEY = 'update_prompt_postponed_version';

export interface PromptStore {
  get(): Promise<string | null>;
  set(version: string): Promise<void>;
}
