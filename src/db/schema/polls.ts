import { pgTable, pgEnum, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { circles } from './circles'

export const pollVisibilityEnum = pgEnum('poll_visibility', ['live', 'after_close'])

export const polls = pgTable(
  'polls',
  {
    id:                uuid('id').primaryKey().defaultRandom(),
    circleId:          uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
    creatorId:         uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    question:          text('question').notNull(),
    resultsVisibility: pollVisibilityEnum('results_visibility').notNull().default('live'),
    closeDate:         timestamp('close_date'),
    createdAt:         timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('polls_circle_id_idx').on(t.circleId)],
)

export const pollOptions = pgTable('poll_options', {
  id:        uuid('id').primaryKey().defaultRandom(),
  pollId:    uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  text:      text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const pollVotes = pgTable(
  'poll_votes',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    pollId:    uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
    optionId:  uuid('option_id').notNull().references(() => pollOptions.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique('poll_votes_unique').on(t.pollId, t.userId)],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const pollsRelations = relations(polls, ({ one, many }) => ({
  circle:  one(circles, { fields: [polls.circleId],  references: [circles.id] }),
  creator: one(users,   { fields: [polls.creatorId], references: [users.id] }),
  options: many(pollOptions),
  votes:   many(pollVotes),
}))

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll:  one(polls, { fields: [pollOptions.pollId], references: [polls.id] }),
  votes: many(pollVotes),
}))

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll:   one(polls,       { fields: [pollVotes.pollId],   references: [polls.id] }),
  option: one(pollOptions, { fields: [pollVotes.optionId], references: [pollOptions.id] }),
  user:   one(users,       { fields: [pollVotes.userId],   references: [users.id] }),
}))
