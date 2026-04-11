import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres:tiger@localhost:5433/rankershub'
});

async function seed() {
  try {
    await client.connect();
    await client.query(`
      INSERT INTO youtube_videos (title, youtube_url) 
      VALUES 
      ('Introduction to 11th Commerce Accountancy', 'https://www.youtube.com/watch?v=Fm7F5zF8F-o'),
      ('12th Commerce Board Exam Strategy', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ('Career Options After Commerce Students', 'https://www.youtube.com/watch?v=Z5O_2O90JqY')
    `);
    console.log('Sample demo videos added successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
