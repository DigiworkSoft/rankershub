import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: "postgresql://postgres:tiger@localhost:5433/rankershub"
});

const blogs = [
  {
    title: "How to Score High in 11th Commerce: Smart Study Blueprint",
    content: `# Study Blueprint for 11th Commerce
[color:indigo]Consistency beats last-minute pressure.[/color]

## What to focus daily
- **Accountancy:** practice journal + ledger every day
- *Economics:* revise concepts with one real-life example
- **Maths & Stats:** solve at least 15 questions daily

## 7-day improvement formula
1. Revise class notes for 45 mins
2. Practice writing answers for 30 mins
3. Solve previous questions for 45 mins

> Keep one weekly self-test. Your speed and confidence improve fast.

Read more resources at [RankersHub](https://rankershub.in).`,
    author: "RankersHub Faculty",
    tags: ["Study Tips", "11th Commerce"]
  },
  {
    title: "12th Boards 90+ Strategy: Subject-wise Plan",
    content: `# 12th Boards 90+ Strategy
[color:green]Target clarity = better marks.[/color]

## Subject plan
- **Accountancy:** formats + adjustments + final accounts
- **OCM/SP:** write *point-wise* answers with clean headings
- **Economics:** diagrams + keywords + definitions

### Exam week checklist
- Revise summary sheets twice
- Solve one timed paper daily
- Sleep 7+ hours

> Avoid random studying. Follow a fixed revision cycle.

For topper guidance, visit [RankersHub Insights](https://rankershub.in/blogs).`,
    author: "RankersHub Faculty",
    tags: ["Boards", "12th Commerce"]
  },
  {
    title: "Career Options After 12th Commerce (2026 Guide)",
    content: `# Career Options After 12th Commerce
[color:purple]Choose by interest + aptitude + long-term goals.[/color]

## Top options
- **CA**: strong for finance and audit careers
- **BBA + MBA**: management and corporate roles
- **B.Com + Certifications**: flexible + practical route
- **CS/CMA**: legal-compliance and cost domains

## Quick decision framework
1. Identify your strongest subjects
2. Check course duration + difficulty
3. Map to career outcomes and salary range

> Don’t follow trends blindly. Build a plan that fits your strengths.

Useful reading: [Commerce Career Paths](https://rankershub.in).`,
    author: "Career Mentor",
    tags: ["Career", "Guidance"]
  }
];

async function seedBlogs() {
  try {
    await client.connect();

    for (const blog of blogs) {
      await client.query(
        `
        INSERT INTO blogs (title, content, author, image_url, tags)
        SELECT $1, $2, $3, $4, $5
        WHERE NOT EXISTS (
          SELECT 1 FROM blogs WHERE title = $1
        )
      `,
        [blog.title, blog.content, blog.author, null, blog.tags]
      );
    }

    const count = await client.query("SELECT COUNT(*)::int AS count FROM blogs");
    console.log(`Blog seed complete. Total blogs: ${count.rows[0].count}`);
  } catch (error) {
    console.error("Blog seed failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedBlogs();
