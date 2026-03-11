import { pgTable, pgEnum, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'

export const profileVisibilityEnum = pgEnum('profile_visibility', ['public', 'friends_only'])

export const users = pgTable(
  'users',
  {
    id:                 uuid('id').primaryKey().defaultRandom(),
    clerkId:            text('clerk_id').notNull().unique(),
    username:           text('username').notNull().unique(),
    email:              text('email').notNull().unique(),
    bio:                text('bio'),
    avatarUrl:          text('avatar_url'),
    avatarPublicId:     text('avatar_public_id'),
    city:               text('city'),
    state:              text('state'),
    country:            text('country'),
    profileVisibility:  profileVisibilityEnum('profile_visibility').notNull().default('public'),
    onboardingComplete: boolean('onboarding_complete').notNull().default(false),

    stravaAthleteId:    text('strava_athlete_id'),
    stravaAccessToken:  text('strava_access_token'),
    stravaRefreshToken: text('strava_refresh_token'),
    stravaTokenExpiry:  timestamp('strava_token_expiry'),
    stravaLastSynced:   timestamp('strava_last_synced'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('users_clerk_id_idx').on(t.clerkId),
    index('users_username_idx').on(t.username),
    index('users_location_idx').on(t.city, t.state, t.country),
  ],
)
