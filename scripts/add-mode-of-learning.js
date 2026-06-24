const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function getDatabaseUrl() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local file not found");
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("DATABASE_URL=")) {
      return line.split("DATABASE_URL=")[1].trim();
    }
  }
  throw new Error("DATABASE_URL not found in .env.local");
}

async function run() {
  const dbUrl = getDatabaseUrl();
  const client = new Client({
    connectionString: dbUrl
  });
  await client.connect();
  try {
    // Add column to courses
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='mode_of_learning') THEN
          ALTER TABLE courses ADD COLUMN mode_of_learning TEXT DEFAULT 'offline (Hybrid )';
        END IF;
      END $$;
    `);
    
    // Update existing course rows
    await client.query(`
      UPDATE courses 
      SET mode_of_learning = 'offline (Hybrid )' 
      WHERE mode_of_learning IS NULL;
    `);

    // Alter unique constraint on fee_plans
    await client.query(`
      ALTER TABLE fee_plans DROP CONSTRAINT IF EXISTS unique_course_duration;
    `);

    // Add column to fee_plans
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fee_plans' AND column_name='mode_of_learning') THEN
          ALTER TABLE fee_plans ADD COLUMN mode_of_learning TEXT DEFAULT 'offline (Hybrid )';
        END IF;
      END $$;
    `);

    await client.query(`
      UPDATE fee_plans 
      SET mode_of_learning = 'offline (Hybrid )' 
      WHERE mode_of_learning IS NULL;
    `);

    await client.query(`
      ALTER TABLE fee_plans DROP CONSTRAINT IF EXISTS unique_course_duration_mode;
    `);
    
    await client.query(`
      ALTER TABLE fee_plans 
      ADD CONSTRAINT unique_course_duration_mode UNIQUE (course_id, duration, mode_of_learning);
    `);

  } catch {
    // Fail silently
  } finally {
    await client.end();
  }
}

run();
