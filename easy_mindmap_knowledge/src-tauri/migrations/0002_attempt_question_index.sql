-- Speeds up replaying one question's history (stats rebuild after a submit).
-- Never edit a migration that has shipped; add a new NNNN_*.sql instead.
CREATE INDEX IF NOT EXISTS idx_attempt_questions_question ON attempt_questions (question_id);
