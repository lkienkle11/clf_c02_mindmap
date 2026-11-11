-- Report type 4 ('attempt'): a report about a whole practice/exam attempt. SQLite cannot change a CHECK in place,
-- so the table is rebuilt with the wider list and every row is copied across. report_images has no foreign key and is untouched.
-- Never edit a migration that has shipped; add a new NNNN_*.sql.
CREATE TABLE reports_new (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('question', 'lesson', 'system', 'attempt')),
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

INSERT INTO reports_new (id, type, status, created_at, status_updated_at, body, app_version, locale, source_screen,
  question_id, lesson_id, attempt_id, position, option_order, selected, is_correct)
SELECT id, type, status, created_at, status_updated_at, body, app_version, locale, source_screen,
  question_id, lesson_id, attempt_id, position, option_order, selected, is_correct
FROM reports;

DROP TABLE reports;
ALTER TABLE reports_new RENAME TO reports;

CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports (status, created_at);
