const fs = require('fs');
const { Client } = require('pg');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
let postgresUrl = '';
for (const line of envLocal.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('POSTGRES_URL=')) {
    postgresUrl = trimmed.substring('POSTGRES_URL='.length).replace(/"/g, '');
    break;
  }
}

console.log('Connecting to:', postgresUrl.substring(0, 30) + '...');

// Supabase requires NODE_TLS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: postgresUrl,
  connectionTimeoutMillis: 15000,
});

async function main() {
  await client.connect();
  console.log('Connected!');
  
  await client.query(`ALTER TABLE aspirasi ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Menunggu'`);
  console.log('Column status added.');
  
  await client.query(`ALTER TABLE aspirasi ADD COLUMN IF NOT EXISTS tindak_lanjut TEXT DEFAULT ''`);
  console.log('Column tindak_lanjut added.');
  
  await client.end();
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
