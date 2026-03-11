import { pgTable, pgEnum, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const circleVisibilityEnum   = pgEnum('circle_visibility',    ['public', 'private'])
export const circleMemberRoleEnum   = pgEnum('circle_member_role',   ['owner', 'moderator', 'member'])
export const circleMemberStatusEnum = pgEnum('circle_member_status', ['active', 'pending'])

export const circles = pgTable(
  'circles',
  {
    id:            uuid('id').primaryKey().defaultRandom(),
    name:          text('name').notNull(),
    description:   text('description'),
    visibility:    circleVisibilityEnum('visibility').notNull().default('public'),
    category:      text('category'),
    coverImageUrl: text('cover_image_url'),
    ownerId:       uuid('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    createdAt:     timestamp('created_at').notNull().defaultNow(),
    updatedAt:     timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('circles_owner_id_idx').on(t.ownerId),
    index('circles_visibility_idx').on(t.visibility),
    index('circles_category_idx').on(t.category),
  ],
)

export const circleMembers = pgTable(
  'circle_members',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    circleId:  uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role:      circleMemberRoleEnum('role').notNull().default('member'),
    status:    circleMemberStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('circle_members_unique').on(t.circleId, t.userId),
    index('circle_members_user_id_idx').on(t.userId),
    index('circle_members_circle_id_idx').on(t.circleId),
    index('circle_members_circle_status_idx').on(t.circleId, t.status),
  ],
)
