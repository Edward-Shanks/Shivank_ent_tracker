import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env.local file.');
}

// Fix Supabase hostname if it contains 'postgres:postgres@supabase_db_'
if (connectionString.includes('postgres:postgres@supabase_db_')) {
  const url = new URL(connectionString);
  url.hostname = url.hostname.split('_')[1];
  connectionString = url.href;
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
