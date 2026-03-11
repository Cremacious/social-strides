import { pgTable, pgEnum, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const notificationTypeEnum = pgEnum('notification_type', [
  'friend_request_accepted',
  'post_liked',
  'post_commented',
  'comment_replied',
  'circle_request_received',
  'added_to_circle',
  'circle_event_created',
  'circle_poll_created',
  'workout_milestone',
])

export const notifications = pgTable(
  'notifications',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    recipientId: uuid('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:        notificationTypeEnum('type').notNull(),
    actorId:     uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    entityId:    uuid('entity_id'),
    entityType:  text('entity_type'),
    read:        boolean('read').notNull().default(false),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('notifications_recipient_id_idx').on(t.recipientId),
    index('notifications_recipient_read_idx').on(t.recipientId, t.read),
    index('notifications_recipient_created_idx').on(t.recipientId, t.createdAt),
  ],
)

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields:       [notifications.recipientId],
    references:   [users.id],
    relationName: 'recipient',
  }),
  actor: one(users, {
    fields:       [notifications.actorId],
    references:   [users.id],
    relationName: 'actor',
  }),
}))
