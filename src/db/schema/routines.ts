import { pgTable, pgEnum, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { circles } from './circles'

export const routineStepTypeEnum = pgEnum('routine_step_type', ['warmup', 'exercise'])

export const routines = pgTable(
  'routines',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    circleId:    uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
    creatorId:   uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name:        text('name').notNull(),
    description: text('description'),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('routines_circle_id_idx').on(t.circleId)],
)

export const routineSteps = pgTable(
  'routine_steps',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    routineId:       uuid('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
    stepType:        routineStepTypeEnum('step_type').notNull(),
    order:           integer('order').notNull(),
    name:            text('name').notNull(),
    description:     text('description'),

    // Warmup fields
    durationSeconds: integer('duration_seconds'),

    // Exercise fields
    sets:            integer('sets'),
    reps:            integer('reps'),
    restSeconds:     integer('rest_seconds'),
    equipment:       text('equipment'),
    notes:           text('notes'),
  },
  (t) => [index('routine_steps_routine_order_idx').on(t.routineId, t.order)],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const routinesRelations = relations(routines, ({ one, many }) => ({
  circle:  one(circles, { fields: [routines.circleId],  references: [circles.id] }),
  creator: one(users,   { fields: [routines.creatorId], references: [users.id] }),
  steps:   many(routineSteps),
}))

export const routineStepsRelations = relations(routineSteps, ({ one }) => ({
  routine: one(routines, { fields: [routineSteps.routineId], references: [routines.id] }),
}))
