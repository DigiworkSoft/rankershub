DO $$
BEGIN
  -- Check and add ranking column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='ranking') THEN
    ALTER TABLE courses ADD COLUMN ranking INT DEFAULT 0;
  END IF;

  -- Check and add syllabus_pdf column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='syllabus_pdf') THEN
    ALTER TABLE courses ADD COLUMN syllabus_pdf VARCHAR(255) NULL;
  END IF;
END $$;

-- Backfill existing NULL rankings to 0 (just in case they are set to null)
UPDATE courses SET ranking = 0 WHERE ranking IS NULL;
