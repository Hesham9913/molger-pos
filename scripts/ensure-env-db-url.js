/*
 Ensures a valid DATABASE_URL is present before Prisma commands run.
 On Railway, sometimes only PG* vars are present. This script builds a
 PostgreSQL connection URL from those variables and writes it into .env
 if DATABASE_URL is missing or empty.
*/

const fs = require('fs');
const path = require('path');
require('dotenv').config();

function buildUrlFromPgEnv() {
  const host = process.env.PGHOST || process.env.POSTGRES_HOST;
  const port = process.env.PGPORT || process.env.POSTGRES_PORT || '5432';
  const db = process.env.PGDATABASE || process.env.POSTGRES_DB || process.env.DB_NAME;
  const user = process.env.PGUSER || process.env.POSTGRES_USER || process.env.DB_USER;
  const pass = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || process.env.DB_PASS;

  if (!host || !db || !user || pass === undefined) {
    return null;
  }

  const encUser = encodeURIComponent(user);
  const encPass = pass ? encodeURIComponent(pass) : '';
  const auth = encPass ? `${encUser}:${encPass}` : encUser;
  // Force SSL in cloud envs
  const sslQuery = 'sslmode=require';
  return `postgresql://${auth}@${host}:${port}/${db}?${sslQuery}`;
}

function ensureDatabaseUrl() {
  const current = (process.env.DATABASE_URL || '').trim();
  if (current) {
    console.log('DATABASE_URL already present.');
    return current;
  }

  // Try common alternates first
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
    process.env.DATABASE_URL_FILE && fs.existsSync(process.env.DATABASE_URL_FILE)
      ? fs.readFileSync(process.env.DATABASE_URL_FILE, 'utf8').trim()
      : null,
  ].filter(Boolean);

  let resolved = candidates.find((v) => v && v.trim()) || null;

  if (!resolved) {
    resolved = buildUrlFromPgEnv();
  }

  if (!resolved) {
    console.warn('DATABASE_URL not found and could not be constructed from PG* env vars.');
    return '';
  }

  // Write or update .env
  const envPath = path.resolve(process.cwd(), '.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
    if (/^DATABASE_URL\s*=\s*.*/m.test(content)) {
      content = content.replace(/^DATABASE_URL\s*=\s*.*/m, `DATABASE_URL=${resolved}`);
    } else {
      content += (content.endsWith('\n') ? '' : '\n') + `DATABASE_URL=${resolved}\n`;
    }
  } else {
    content = `DATABASE_URL=${resolved}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('DATABASE_URL has been written to .env');
  return resolved;
}

const url = ensureDatabaseUrl();
if (!url) {
  process.exitCode = 0; // Allow process to continue; app will still warn at runtime
}


