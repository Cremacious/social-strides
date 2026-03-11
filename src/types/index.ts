import type {
  users,
  posts, postTags, postLikes, comments,
  workouts, goals,
  stravaWorkouts,
  workoutComments, workoutLikes,
  circles, circleMembers,
  events,
  polls, pollOptions, pollVotes,
  routines, routineSteps,
  notifications,
  friendships,
} from '@/db/schema'

// ─── Users ───────────────────────────────────────────────────────────────────
export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// ─── Posts ───────────────────────────────────────────────────────────────────
export type Post    = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type PostTag  = typeof postTags.$inferSelect
export type PostLike = typeof postLikes.$inferSelect
export type Comment  = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

// ─── Workouts ────────────────────────────────────────────────────────────────
export type Workout    = typeof workouts.$inferSelect
export type NewWorkout = typeof workouts.$inferInsert
export type Goal       = typeof goals.$inferSelect
export type NewGoal    = typeof goals.$inferInsert

// ─── Strava Workouts ─────────────────────────────────────────────────────────
export type StravaWorkout = typeof stravaWorkouts.$inferSelect

// ─── Workout Interactions ────────────────────────────────────────────────────
export type WorkoutComment = typeof workoutComments.$inferSelect
export type WorkoutLike    = typeof workoutLikes.$inferSelect

// ─── Circles ─────────────────────────────────────────────────────────────────
export type Circle       = typeof circles.$inferSelect
export type NewCircle    = typeof circles.$inferInsert
export type CircleMember = typeof circleMembers.$inferSelect

// ─── Events ──────────────────────────────────────────────────────────────────
export type Event    = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

// ─── Polls ───────────────────────────────────────────────────────────────────
export type Poll       = typeof polls.$inferSelect
export type PollOption = typeof pollOptions.$inferSelect
export type PollVote   = typeof pollVotes.$inferSelect

// ─── Routines ────────────────────────────────────────────────────────────────
export type Routine     = typeof routines.$inferSelect
export type RoutineStep = typeof routineSteps.$inferSelect

// ─── Notifications ───────────────────────────────────────────────────────────
export type Notification = typeof notifications.$inferSelect

// ─── Friendships ─────────────────────────────────────────────────────────────
export type Friendship = typeof friendships.$inferSelect

// ─── Shared enums ────────────────────────────────────────────────────────────
export type WorkoutSource = 'manual' | 'strava'

// ─── Composite types ─────────────────────────────────────────────────────────

export type WorkoutWithSource =
  | (Workout      & { source: 'manual' })
  | (StravaWorkout & { source: 'strava' })

export type PostWithDetails = Post & {
  author:   Pick<User, 'id' | 'username' | 'avatarUrl'>
  likes:    PostLike[]
  comments: (Comment & {
    author:  Pick<User, 'id' | 'username' | 'avatarUrl'>
    replies: Comment[]
  })[]
  tags:     (PostTag & { user: Pick<User, 'id' | 'username'> })[]
  _count:   { likes: number; comments: number }
}

export type CircleWithMembership = Circle & {
  memberCount: number
  userRole:    'owner' | 'moderator' | 'member' | null
  userStatus:  'active' | 'pending' | null
}

export type GoalWithProgress = Goal & {
  currentValue:    number
  progressPercent: number
}

export type UserSummary = Pick<User, 'id' | 'username' | 'avatarUrl'>
