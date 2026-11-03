ALTER TABLE attempts ADD COLUMN clock_on_hidden TEXT NOT NULL DEFAULT 'freeze' CHECK (clock_on_hidden IN ('freeze', 'run'));
