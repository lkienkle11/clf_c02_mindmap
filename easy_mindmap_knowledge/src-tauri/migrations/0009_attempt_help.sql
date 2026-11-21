-- Exam help state: the help mode of an attempt ('off', 'reveal' or 'powers') and, per question, whether the answer was revealed and which options were eliminated.
-- Never edit a migration that has shipped; add a new NNNN_*.sql.
ALTER TABLE attempts ADD COLUMN help_mode TEXT NOT NULL DEFAULT 'off' CHECK (help_mode IN ('off', 'reveal', 'powers'));
ALTER TABLE attempt_questions ADD COLUMN revealed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE attempt_questions ADD COLUMN eliminated TEXT NOT NULL DEFAULT '[]';
