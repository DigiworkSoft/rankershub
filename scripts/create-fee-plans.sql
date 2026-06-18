-- ============================================================
-- Create fee_plans table and seed initial fee plan values
-- ============================================================

DROP TABLE IF EXISTS fee_plans;

CREATE TABLE fee_plans (
  id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  duration TEXT NOT NULL,
  fees NUMERIC(10, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_course_duration UNIQUE(course_id, duration)
);
