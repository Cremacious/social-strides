// ─── Table + enum exports ─────────────────────────────────────────────────────
export * from './users'
export * from './friends'
export * from './posts'
export * from './workouts'
export * from './strava_workouts'
export * from './workout_interactions'
export * from './circles'
export * from './events'
export * from './polls'
export * from './routines'
export * from './notifications'

// ─── Circular relations ───────────────────────────────────────────────────────
// usersRelations and circlesRelations reference tables across many files.
// Defining them here (after all tables are loaded) avoids circular-import issues.

import { relations } from 'drizzle-orm'
import { users }         from './users'
import { posts }         from './posts'
import { workouts, goals } from './workouts'
import { stravaWorkouts }  from './strava_workouts'
import { friendships }     from './friends'
import { circleMembers, circles } from './circles'
import { notifications }   from './notifications'
import { events }          from './events'
import { polls }           from './polls'
import { routines }        from './routines'

export const usersRelations = relations(users, ({ many }) => ({
  posts:            many(posts),
  workouts:         many(workouts),
  stravaWorkouts:   many(stravaWorkouts),
  goals:            many(goals),
  sentRequests:     many(friendships, { relationName: 'requester' }),
  receivedRequests: many(friendships, { relationName: 'addressee' }),
  circleMembers:    many(circleMembers),
  notifications:    many(notifications, { relationName: 'recipient' }),
}))

export const circlesRelations = relations(circles, ({ one, many }) => ({
  owner:    one(users,   { fields: [circles.ownerId], references: [users.id] }),
  members:  many(circleMembers),
  posts:    many(posts),
  workouts: many(workouts),
  events:   many(events),
  polls:    many(polls),
  routines: many(routines),
}))

export const circleMembersRelations = relations(circleMembers, ({ one }) => ({
  circle: one(circles, { fields: [circleMembers.circleId], references: [circles.id] }),
  user:   one(users,   { fields: [circleMembers.userId],   references: [users.id] }),
}))
