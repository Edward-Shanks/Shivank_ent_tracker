/**
 * Database seeding script
 * Run this to populate the database with initial data
 * Usage: pnpm tsx src/lib/db/seed.ts
 */

import { db } from './index';
import { users, anime, movies, kdrama, games, genshinAccounts, genshinCharacters, credentials, websites } from './schema';
import { nanoid } from 'nanoid';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create default user
    const userId = nanoid();
    await db.insert(users).values({
      id: userId,
      username: 'EntertainmentFan',
      email: 'user@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    });

    console.log('✓ User created');

    // Seed anime (optional - can be left empty)
    // await db.insert(anime).values([...]);

    // Seed movies (optional)
    // await db.insert(movies).values([...]);

    // Seed kdrama (optional)
    // await db.insert(kdrama).values([...]);

    // Seed games (optional)
    // await db.insert(games).values([...]);

    // Seed genshin account (optional)
    const accountId = nanoid();
    await db.insert(genshinAccounts).values({
      id: accountId,
      userId,
      uid: '123456789',
      adventureRank: 58,
      worldLevel: 8,
      primogems: 0,
      intertwined: 0,
      acquaint: 0,
    });

    console.log('✓ Genshin account created');

    // Seed credentials (optional)
    // await db.insert(credentials).values([...]);

    // Seed websites (optional)
    // await db.insert(websites).values([...]);

    console.log('✓ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seed };

