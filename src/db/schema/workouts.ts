import { pgTable, pgEnum, uuid, text, timestamp, integer, real, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { circles } from './circles'

export const workoutTypeEnum   = pgEnum('workout_type',   ['run', 'cycle', 'swim', 'lift', 'walk', 'hike', 'other'])
export const goalTypeEnum      = pgEnum('goal_type',      ['total_workouts', 'total_distance', 'workouts_per_week', 'total_calories'])
export const workoutSourceEnum = pgEnum('workout_source', ['manual', 'strava'])

export const workouts = pgTable(
  'workouts',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    userId:          uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title:           text('title').notNull(),
    type:            workoutTypeEnum('type').notNull(),
    date:            timestamp('date').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    distanceKm:      real('distance_km'),
    calories:        integer('calories'),
    notes:           text('notes'),
    circleId:        uuid('circle_id').references(() => circles.id, { onDelete: 'set null' }),
    createdAt:       timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('workouts_user_id_idx').on(t.userId),
    index('workouts_user_date_idx').on(t.userId, t.date),
    index('workouts_circle_id_idx').on(t.circleId),
  ],
)

export const goals = pgTable(
  'goals',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:        goalTypeEnum('type').notNull(),
    targetValue: real('target_value').notNull(),
    startDate:   timestamp('start_date').notNull(),
    endDate:     timestamp('end_date').notNull(),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('goals_user_id_idx').on(t.userId)],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const workoutsRelations = relations(workouts, ({ one }) => ({
  user:   one(users,   { fields: [workouts.userId],   references: [users.id] }),
  circle: one(circles, { fields: [workouts.circleId], references: [circles.id] }),
}))

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}))
