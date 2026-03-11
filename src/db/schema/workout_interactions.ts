import { pgTable, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { workoutSourceEnum } from './workouts'

// No DB-level FK on workoutId — it points to either workouts or strava_workouts.
// Application code resolves which table to query using workoutSource.

export const workoutComments = pgTable(
  'workout_comments',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    workoutId:     uuid('workout_id').notNull(),
    workoutSource: workoutSourceEnum('workout_source').notNull(),
    authorId:      uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content:       text('content').notNull(),
    createdAt:     timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('workout_comments_workout_idx').on(t.workoutId, t.workoutSource)],
)

export const workoutLikes = pgTable(
  'workout_likes',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    workoutId:     uuid('workout_id').notNull(),
    workoutSource: workoutSourceEnum('workout_source').notNull(),
    userId:        uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt:     timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('workout_likes_unique').on(t.workoutId, t.workoutSource, t.userId),
    index('workout_likes_workout_idx').on(t.workoutId, t.workoutSource),
  ],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const workoutCommentsRelations = relations(workoutComments, ({ one }) => ({
  author: one(users, { fields: [workoutComments.authorId], references: [users.id] }),
}))

export const workoutLikesRelations = relations(workoutLikes, ({ one }) => ({
  user: one(users, { fields: [workoutLikes.userId], references: [users.id] }),
}))
