-- Report feature: learner reports (question, lesson or system) with their image paths in order, and the
-- clock policy an attempt follows while a report is open. Never edit a migration that has shipped; add a new NNNN_*.sql.
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('question', 'lesson', 'system')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'handled')),
  created_at INTEGER NOT NULL,
  status_updated_at INTEGER NOT NULL,
  body TEXT NOT NULL,
  app_version TEXT NOT NULL,
  locale TEXT NOT NULL,
  source_screen TEXT,
  question_id TEXT,
  lesson_id TEXT,
  attempt_id TEXT,
  position INTEGER,
  option_order TEXT,
  selected TEXT,
  is_correct INTEGER
);

CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports (status, created_at);

CREATE TABLE IF NOT EXISTS report_images (
  report_id TEXT NOT NULL,
  idx INTEGER NOT NULL,
  path TEXT NOT NULL,
  PRIMARY KEY (report_id, idx)
);

ALTER TABLE attempts ADD COLUMN clock_on_report TEXT NOT NULL DEFAULT 'freeze' CHECK (clock_on_report IN ('freeze', 'run'));
