const { PrismaClient } = require('@prisma/client');

// Resolve database URL from several common environment variable names
const datasourceUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.PG_URL ||
  null;

if (!datasourceUrl) {
  // Fail fast with a clear message in logs to aid debugging on Railway
  console.error(
    'FATAL: No database URL found. Please set DATABASE_URL (or POSTGRES_URL) in your Railway service environment.'
  );
}

const prisma = new PrismaClient({
  datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
  log: ['warn', 'error'],
});

module.exports = { prisma, datasourceUrl };


