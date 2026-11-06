-- SQLite cannot alter a CHECK, so attempts is rebuilt: adds the 'checkpoint' kind, the checkpoint group
-- index and the planned question count. Never edit a migration that has shipped; add a new NNNN_*.sql.
CREATE TABLE attempts_new (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('practice', 'review', 'checkpoint')),
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
  passed INTEGER,
  clock_on_hidden TEXT NOT NULL DEFAULT 'freeze' CHECK (clock_on_hidden IN ('freeze', 'run')),
  group_index INTEGER,
  planned_count INTEGER,
  CHECK ((kind = 'checkpoint') = (group_index IS NOT NULL))
);

INSERT INTO attempts_new
  (id, kind, topic_id, status, started_at, submitted_at, submit_reason, review_allowed, time_limit_ms,
   clock_mode, remaining_ms, deadline_at, heartbeat_at, score_pct, passed, clock_on_hidden)
SELECT
  id, kind, topic_id, status, started_at, submitted_at, submit_reason, review_allowed, time_limit_ms,
  clock_mode, remaining_ms, deadline_at, heartbeat_at, score_pct, passed, clock_on_hidden
FROM attempts;

DROP TABLE attempts;
ALTER TABLE attempts_new RENAME TO attempts;
