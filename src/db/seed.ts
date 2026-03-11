import 'dotenv/config'
import { db } from './index'
import { users } from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  const [user] = await db
    .insert(users)
    .values({
      clerkId:  'dev_clerk_seed_user',
      username: 'testuser',
      email:    'test@example.com',
      bio:      'Seed user for development',
      city:     'New York',
      state:    'NY',
      country:  'US',
      onboardingComplete: true,
    })
    .onConflictDoNothing()
    .returning()

  if (user) {
    console.log('✅ Created test user:', user.username, '(id:', user.id + ')')
  } else {
    console.log('ℹ️  Test user already exists — skipped.')
  }

  console.log('✅ Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
