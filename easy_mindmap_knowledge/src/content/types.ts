export type Tier = 'introduction' | 'core' | 'advanced' | 'capstone';
export type Localized = { en: string; vi: string };

export interface Topic {
  id: string;
  order: number;
  tier: Tier;
  title: Localized;
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  topicId: string;
  order: number;
  required: boolean;
  title: Localized;
  body: Localized;
  videoQuery?: string;
}

export interface Question {
  id: string;
  topicId: string | null;
  text: string;
  options: { key: string; text: string }[];
  correct: string[];
  multi: boolean;
  orderDependent: boolean;
  explanation?: string;
  /** Per-option notes keyed by option key; shown in the results review. */
  optionNotes?: Record<string, string>;
  source: 'imported' | 'authored';
}

export interface Catalog {
  topics: Topic[];
  lessons: Lesson[];
  questions: Question[];
  lessonsOf(topicId: string): Lesson[];
  questionsOf(topicId: string): Question[];
  topic(id: string): Topic;
}
