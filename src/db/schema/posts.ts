import { pgTable, pgEnum, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { users } from './users'
import { circles } from './circles'
import { workoutSourceEnum } from './workouts'

export const postPrivacyEnum = pgEnum('post_privacy', ['public', 'friends_only', 'only_me'])
export { workoutSourceEnum }

export const posts = pgTable(
  'posts',
  {
    id:                    uuid('id').primaryKey().defaultRandom(),
    authorId:              uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content:               text('content').notNull(),
    feeling:               text('feeling'),
    privacy:               postPrivacyEnum('privacy').notNull().default('friends_only'),
    imageUrls:             text('image_urls').array(),
    circleId:              uuid('circle_id').references(() => circles.id, { onDelete: 'cascade' }),
    attachedWorkoutId:     uuid('attached_workout_id'),
    attachedWorkoutSource: workoutSourceEnum('attached_workout_source'),
    originalPostId:        uuid('original_post_id').references((): AnyPgColumn => posts.id, { onDelete: 'set null' }),
    createdAt:             timestamp('created_at').notNull().defaultNow(),
    updatedAt:             timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('posts_author_id_idx').on(t.authorId),
    index('posts_circle_id_idx').on(t.circleId),
    index('posts_author_created_idx').on(t.authorId, t.createdAt),
    index('posts_circle_created_idx').on(t.circleId, t.createdAt),
  ],
)

export const postTags = pgTable(
  'post_tags',
  {
    id:     uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('post_tags_unique').on(t.postId, t.userId)],
)

export const postLikes = pgTable(
  'post_likes',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    postId:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('post_likes_unique').on(t.postId, t.userId),
    index('post_likes_post_id_idx').on(t.postId),
  ],
)

export const comments = pgTable(
  'comments',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    postId:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    authorId:  uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content:   text('content').notNull(),
    parentId:  uuid('parent_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('comments_post_id_idx').on(t.postId),
    index('comments_parent_id_idx').on(t.parentId),
    index('comments_post_created_idx').on(t.postId, t.createdAt),
  ],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const postsRelations = relations(posts, ({ one, many }) => ({
  author:   one(users,   { fields: [posts.authorId],      references: [users.id] }),
  circle:   one(circles, { fields: [posts.circleId],      references: [circles.id] }),
  original: one(posts,   { fields: [posts.originalPostId], references: [posts.id], relationName: 'repost' }),
  reposts:  many(posts,  { relationName: 'repost' }),
  tags:     many(postTags),
  likes:    many(postLikes),
  comments: many(comments),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  user: one(users, { fields: [postTags.userId], references: [users.id] }),
}))

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post:    one(posts,    { fields: [comments.postId],   references: [posts.id] }),
  author:  one(users,   { fields: [comments.authorId], references: [users.id] }),
  parent:  one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'parent' }),
  replies: many(comments, { relationName: 'parent' }),
}))
