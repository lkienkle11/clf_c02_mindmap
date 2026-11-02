CREATE TABLE IF NOT EXISTS lesson_progress (
  lesson_id TEXT PRIMARY KEY NOT NULL,
  read_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('practice', 'review')),
  topic_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted')),
  started_at INTEGER NOT NULL,
  submitted_at INTEGER,
  submit_reason TEXT CHECK (submit_reason IN ('manual', 'timeout')),
  review_allowed INTEGER NOT NULL DEFAULT 0,
  time_limit_ms INTEGER,
  clock_mode TEXT NOT NULL CHECK (clock_mode IN ('freeze', 'run')),
  remaining_ms INTEGER,
  deadline_at INTEGER,
  heartbeat_at INTEGER,
  score_pct REAL,
  passed INTEGER
);

CREATE TABLE IF NOT EXISTS attempt_questions (
  attempt_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  option_order TEXT NOT NULL,
  selected TEXT NOT NULL DEFAULT '[]',
  is_correct INTEGER,
  PRIMARY KEY (attempt_id, position)
);

CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt ON attempt_questions (attempt_id);

CREATE TABLE IF NOT EXISTS question_stats (
  question_id TEXT PRIMARY KEY NOT NULL,
  topic_id TEXT,
  box INTEGER NOT NULL,
  due_at INTEGER NOT NULL,
  times_seen INTEGER NOT NULL,
  times_correct INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  last_correct INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_question_stats_due ON question_stats (due_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
