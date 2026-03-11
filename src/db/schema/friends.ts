import { pgTable, pgEnum, uuid, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted', 'declined'])

export const friendships = pgTable(
  'friendships',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    addresseeId: uuid('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status:      friendshipStatusEnum('status').notNull().default('pending'),
    createdAt:   timestamp('created_at').notNull().defaultNow(),
    updatedAt:   timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    unique('friendships_unique_pair').on(t.requesterId, t.addresseeId),
    index('friendships_requester_id_idx').on(t.requesterId),
    index('friendships_addressee_id_idx').on(t.addresseeId),
  ],
)

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields:        [friendships.requesterId],
    references:    [users.id],
    relationName:  'requester',
  }),
  addressee: one(users, {
    fields:        [friendships.addresseeId],
    references:    [users.id],
    relationName:  'addressee',
  }),
}))
