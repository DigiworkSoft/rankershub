type QueryFn = (text: string, params?: unknown[]) => Promise<{ rows: any[] }>;

export const DEFAULT_BATCH_SEED = [
  {
    title: "11th Commerce Regular",
    description:
      "A comprehensive course designed to build strong fundamentals in Accountancy, Economics, and Business Studies.",
    duration: "1 Year",
    timing: "Morning & Evening Batches",
    benefits:
      "Conceptual clarity from scratch\nRegular chapter-wise tests\nExclusive study materials\nCareer guidance sessions",
    syllabus: "Book-keeping & Accountancy\nMathematics",
    syllabus_details:
      "Book-keeping & Accountancy::Strong foundation in journal, ledger and final accounts with practical exam approach.\nMathematics::Concept-first teaching for formulas, problem-solving speed, and confidence.",
    next_batch_starts: "1st May, 2026",
    fees: 36000,
    discount_percent: 15,
  },
  {
    title: "12th Commerce Boards",
    description:
      "Intensive preparation for Board Exams with focus on scoring techniques, time management, and mock exams.",
    duration: "1 Year",
    timing: "Flexible Batches",
    benefits:
      "Board-specific test series\nPrevious year paper solving\nOne-on-one doubt sessions\nStress management workshops",
    syllabus: "Book-keeping & Accountancy\nMathematics",
    syllabus_details:
      "Book-keeping & Accountancy::Board-focused preparation with repeated practice of high-weightage patterns.\nMathematics::Exam-oriented strategy with quick methods and revision worksheets.",
    next_batch_starts: "1st May, 2026",
    fees: 42000,
    discount_percent: 20,
  },
  {
    title: "CA Foundation Intensive",
    description:
      "Kickstart your Chartered Accountancy journey with our focused coaching for all four papers of the CA Foundation exam.",
    duration: "4-6 Months",
    timing: "Morning & Evening Batches",
    benefits:
      "Expert CA faculty\nComprehensive ICAI module coverage\nWeekly mock tests\nPersonalized performance tracking",
    syllabus:
      "Principles and Practice of Accounting\nBusiness Law & Reporting\nMaths, Statistics & LR\nBusiness Economics & BCK",
    syllabus_details:
      "Principles and Practice of Accounting::ICAI-pattern conceptual clarity and application drills.\nBusiness Law & Reporting::Section-wise legal understanding with memory techniques.\nMaths, Statistics & LR::Stepwise problem-solving and test stamina development.\nBusiness Economics & BCK::Smart coverage for scoring and rapid revision.",
    next_batch_starts: "Admissions Open",
    fees: 50000,
    discount_percent: 10,
  },
];

export async function ensureCourseBatchColumns(query: QueryFn) {
  await query(`
    ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS duration TEXT,
    ADD COLUMN IF NOT EXISTS timing TEXT,
    ADD COLUMN IF NOT EXISTS benefits TEXT,
    ADD COLUMN IF NOT EXISTS syllabus TEXT,
    ADD COLUMN IF NOT EXISTS syllabus_details TEXT,
    ADD COLUMN IF NOT EXISTS next_batch_starts TEXT,
    ADD COLUMN IF NOT EXISTS fees NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2)
  `);
}

export async function ensureDefaultBatches(query: QueryFn) {
  await ensureCourseBatchColumns(query);

  const titles = DEFAULT_BATCH_SEED.map((b) => b.title);
  const existing = await query("SELECT title FROM courses WHERE title = ANY($1::text[])", [titles]);
  const existingTitles = new Set(existing.rows.map((r: { title: string }) => r.title));

  for (const batch of DEFAULT_BATCH_SEED) {
    if (existingTitles.has(batch.title)) continue;

    await query(
      `INSERT INTO courses (title, description, image_url, duration, timing, benefits, syllabus, syllabus_details, next_batch_starts, fees, discount_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        batch.title,
        batch.description,
        null,
        batch.duration,
        batch.timing,
        batch.benefits,
        batch.syllabus,
        batch.syllabus_details,
        batch.next_batch_starts,
        batch.fees,
        batch.discount_percent,
      ]
    );
  }
}
