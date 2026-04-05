import 'dotenv/config';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS aspirasi (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      badge TEXT NOT NULL,
      description TEXT NOT NULL,
      maskot_image TEXT NOT NULL,
      link TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chatlogs (
      id TEXT PRIMARY KEY,
      messages JSONB NOT NULL,
      status TEXT NOT NULL,
      total_messages INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Tables created successfully via pg.');
  await client.end();
}

main().catch(err => {
  console.error("Migration Error:", err);
  process.exit(1);
});
