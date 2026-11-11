-- What the results show for questions left unanswered: everything ('reveal') or the options only ('answersOnly').
-- Never edit a migration that has shipped; add a new NNNN_*.sql.
ALTER TABLE attempts ADD COLUMN unanswered_display TEXT NOT NULL DEFAULT 'reveal' CHECK (unanswered_display IN ('reveal', 'answersOnly'));
