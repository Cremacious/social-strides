import { pgTable, pgEnum, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { circles } from './circles'

export const eventStatusEnum = pgEnum('event_status', ['draft', 'published'])

export const events = pgTable(
  'events',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    circleId:     uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
    creatorId:    uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name:         text('name').notNull(),
    description:  text('description'),
    imageUrl:     text('image_url'),
    status:       eventStatusEnum('status').notNull().default('draft'),
    category:     text('category'),
    dateTime:     timestamp('date_time').notNull(),
    location:     text('location'),
    maxAttendees: integer('max_attendees'),
    tags:         text('tags').array(),
    createdAt:    timestamp('created_at').notNull().defaultNow(),
    updatedAt:    timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('events_circle_id_idx').on(t.circleId),
    index('events_circle_date_idx').on(t.circleId, t.dateTime),
  ],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ one }) => ({
  circle:  one(circles, { fields: [events.circleId],  references: [circles.id] }),
  creator: one(users,   { fields: [events.creatorId], references: [users.id] }),
}))
