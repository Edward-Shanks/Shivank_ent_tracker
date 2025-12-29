import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function runMigration() {
  try {
    const migrationSQL = readFileSync(
      join(process.cwd(), 'drizzle', '0001_update_games_and_movies.sql'),
      'utf-8'
    );

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('Migration completed successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();

