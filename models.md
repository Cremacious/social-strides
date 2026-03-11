# Social Strides — Database Schema Models

**ORM:** Drizzle ORM | **Database:** Neon (PostgreSQL) | **Total Tables:** 21

All IDs use `uuid` (generated with `crypto.randomUUID()`). All timestamps use `timestamp` with `defaultNow()`. Foreign keys are enforced at the database level with `references()`. Enums are defined as PostgreSQL `pgEnum` values.

---

## Enums

Define all enums at the top of their relevant schema files. PostgreSQL enforces these at the DB level.

```ts
// Profile & auth
export const profileVisibilityEnum = pgEnum('profile_visibility', ['public', 'friends_only'])

// Posts
export const postPrivacyEnum      = pgEnum('post_privacy', ['public', 'friends_only', 'only_me'])
export const workoutSourceEnum     = pgEnum('workout_source', ['manual', 'strava'])

// Friendships
export const friendshipStatusEnum  = pgEnum('friendship_status', ['pending', 'accepted', 'declined'])

// Workouts
export const workoutTypeEnum       = pgEnum('workout_type', ['run', 'cycle', 'swim', 'lift', 'walk', 'hike', 'other'])
export const goalTypeEnum          = pgEnum('goal_type', ['total_workouts', 'total_distance', 'workouts_per_week', 'total_calories'])

// Circles
export const circleVisibilityEnum  = pgEnum('circle_visibility', ['public', 'private'])
export const circleMemberRoleEnum  = pgEnum('circle_member_role', ['owner', 'moderator', 'member'])
export const circleMemberStatusEnum= pgEnum('circle_member_status', ['active', 'pending'])

// Events
export const eventStatusEnum       = pgEnum('event_status', ['draft', 'published'])

// Polls
export const pollVisibilityEnum    = pgEnum('poll_visibility', ['live', 'after_close'])

// Routines
export const routineStepTypeEnum   = pgEnum('routine_step_type', ['warmup', 'exercise'])

// Notifications
export const notificationTypeEnum  = pgEnum('notification_type', [
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
```

---

## Table 1 — `users`

**File:** `src/db/schema/users.ts`
**Purpose:** Core user record. Links Clerk auth to the app's DB identity. Stores profile info, location, Strava credentials, and privacy settings.

```ts
export const users = pgTable('users', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  clerkId:             text('clerk_id').notNull().unique(),        // Clerk user ID — used to look up DB user from session
  username:            text('username').notNull().unique(),
  email:               text('email').notNull().unique(),
  bio:                 text('bio'),
  avatarUrl:           text('avatar_url'),                         // Cloudinary URL
  avatarPublicId:      text('avatar_public_id'),                   // Cloudinary publicId — needed to delete old image on update
  city:                text('city'),
  state:               text('state'),
  country:             text('country'),
  profileVisibility:   profileVisibilityEnum('profile_visibility').notNull().default('public'),
  onboardingComplete:  boolean('onboarding_complete').notNull().default(false),

  // Strava OAuth tokens — all nullable; null means Strava is not connected
  stravaAthleteId:     text('strava_athlete_id'),
  stravaAccessToken:   text('strava_access_token'),
  stravaRefreshToken:  text('strava_refresh_token'),
  stravaTokenExpiry:   timestamp('strava_token_expiry'),           // When the access token expires
  stravaLastSynced:    timestamp('strava_last_synced'),            // Last successful sync timestamp

  createdAt:           timestamp('created_at').notNull().defaultNow(),
  updatedAt:           timestamp('updated_at').notNull().defaultNow(),
})
```

**Indexes:**
- `clerkId` — queried on every authenticated request
- `username` — searched during friend discovery
- `city, state, country` — queried for area-based posts on Explore page

**Relations:** One-to-many with posts, workouts, strava_workouts, goals, friendships, circle_members, notifications

---

## Table 2 — `friendships`

**File:** `src/db/schema/friends.ts`
**Purpose:** Tracks friend requests and accepted friendships between users. A single row represents one directional request; friendship is confirmed when status = 'accepted'.

```ts
export const friendships = pgTable('friendships', {
  id:          uuid('id').primaryKey().defaultRandom(),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addresseeId: uuid('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status:      friendshipStatusEnum('status').notNull().default('pending'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  // Prevent duplicate requests between the same two users
  uniquePair: unique().on(t.requesterId, t.addresseeId),
}))
```

**Indexes:**
- `requesterId` — find all requests a user has sent
- `addresseeId` — find all requests a user has received
- Composite `(requesterId, addresseeId)` unique constraint — prevents duplicates

**Notes:**
- To check if two users are friends, query WHERE `(requesterId = A AND addresseeId = B) OR (requesterId = B AND addresseeId = A)` AND `status = 'accepted'`
- getFriendshipStatus() uses this pattern to power the Add Friend button state

---

## Table 3 — `posts`

**File:** `src/db/schema/posts.ts`
**Purpose:** Social posts created by users. Can be standalone (home feed), circle-scoped, or have an attached workout. Supports images, a feeling tag, and privacy controls.

```ts
export const posts = pgTable('posts', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  authorId:             uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:              text('content').notNull(),
  feeling:              text('feeling'),                                    // e.g. "happy", "motivated", "tired"
  privacy:              postPrivacyEnum('privacy').notNull().default('friends_only'),
  imageUrls:            text('image_urls').array(),                         // Array of Cloudinary URLs
  circleId:             uuid('circle_id').references(() => circles.id, { onDelete: 'cascade' }),  // null = personal post
  attachedWorkoutId:    uuid('attached_workout_id'),                        // ID in either workouts or strava_workouts
  attachedWorkoutSource: workoutSourceEnum('attached_workout_source'),      // Which table to look up the workout in
  originalPostId:       uuid('original_post_id').references(() => posts.id, { onDelete: 'set null' }), // For reposts
  createdAt:            timestamp('created_at').notNull().defaultNow(),
  updatedAt:            timestamp('updated_at').notNull().defaultNow(),
})
```

**Indexes:**
- `authorId` — profile page feed
- `circleId` — circle post feed
- `createdAt DESC` — feed sorting
- Composite `(authorId, createdAt DESC)` — profile feed query
- Composite `(circleId, createdAt DESC)` — circle feed query

**Relations:** Many post_tags, many post_likes, many comments. Belongs to user and optionally a circle.

---

## Table 4 — `post_tags`

**File:** `src/db/schema/posts.ts`
**Purpose:** Join table for tagging friends in posts. Powers the "with [friend]" display on post cards.

```ts
export const postTags = pgTable('post_tags', {
  id:        uuid('id').primaryKey().defaultRandom(),
  postId:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (t) => ({
  uniqueTag: unique().on(t.postId, t.userId),
}))
```

---

## Table 5 — `post_likes`

**File:** `src/db/schema/posts.ts`
**Purpose:** Tracks which users have liked which posts. One row per user per post.

```ts
export const postLikes = pgTable('post_likes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  postId:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqueLike: unique().on(t.postId, t.userId),   // One like per user per post
}))
```

**Indexes:**
- `postId` — count likes per post
- Composite `(postId, userId)` unique — prevents duplicate likes

---

## Table 6 — `comments`

**File:** `src/db/schema/posts.ts`
**Purpose:** Comments and replies on posts. Self-referential via `parentId` for 1-level-deep nested replies.

```ts
export const comments = pgTable('comments', {
  id:        uuid('id').primaryKey().defaultRandom(),
  postId:    uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId:  uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:   text('content').notNull(),
  parentId:  uuid('parent_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }), // null = top-level comment; set = reply
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

**Indexes:**
- `postId` — fetch all comments for a post
- `parentId` — fetch all replies to a comment
- Composite `(postId, createdAt ASC)` — ordered comment list

**Notes:**
- Only 1 level of nesting is supported. `parentId` must always reference a comment where `parentId IS NULL` (enforced in application logic).

---

## Table 7 — `workouts`

**File:** `src/db/schema/workouts.ts`
**Purpose:** Manually logged workouts. Distinct from Strava workouts — these are entered by the user directly in the app.

```ts
export const workouts = pgTable('workouts', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:           text('title').notNull(),
  type:            workoutTypeEnum('type').notNull(),
  date:            timestamp('date').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  distanceKm:      real('distance_km'),                     // Optional — not all workouts have distance
  calories:        integer('calories'),
  notes:           text('notes'),
  circleId:        uuid('circle_id').references(() => circles.id, { onDelete: 'set null' }),  // null = not shared to a circle
  createdAt:       timestamp('created_at').notNull().defaultNow(),
})
```

**Indexes:**
- `userId` — fetch user's workouts
- Composite `(userId, date DESC)` — sorted workout list and graph queries
- `circleId` — fetch workouts shared to a circle

---

## Table 8 — `strava_workouts`

**File:** `src/db/schema/strava_workouts.ts`
**Purpose:** Activities imported from Strava. Stored separately from manual workouts to preserve all Strava-specific fields. Merged with manual workouts in application logic for display.

```ts
export const stravaWorkouts = pgTable('strava_workouts', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  userId:              uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stravaId:            text('strava_id').notNull(),             // Strava's own activity ID — used to deduplicate on sync
  circleId:            uuid('circle_id').references(() => circles.id, { onDelete: 'set null' }),

  // Identity
  name:                text('name').notNull(),
  type:                text('type'),                            // Strava activity type string (e.g. "Run")
  sportType:           text('sport_type'),                      // More specific sport type from Strava

  // Timing
  startDate:           timestamp('start_date'),                 // UTC
  startDateLocal:      timestamp('start_date_local'),           // Local time at location of activity
  movingTime:          integer('moving_time'),                  // Seconds
  elapsedTime:         integer('elapsed_time'),                 // Seconds

  // Distance & Speed
  distance:            real('distance'),                        // Meters
  averageSpeed:        real('average_speed'),                   // Meters per second
  maxSpeed:            real('max_speed'),                       // Meters per second

  // Elevation
  totalElevationGain:  real('total_elevation_gain'),            // Meters
  elevHigh:            real('elev_high'),
  elevLow:             real('elev_low'),

  // Location
  locationCity:        text('location_city'),
  locationState:       text('location_state'),
  locationCountry:     text('location_country'),
  startLat:            real('start_lat'),
  startLng:            real('start_lng'),
  endLat:              real('end_lat'),
  endLng:              real('end_lng'),

  // Route
  mapId:               text('map_id'),
  summaryPolyline:     text('summary_polyline'),                // Encoded polyline — decoded for Leaflet map

  // Heart Rate
  hasHeartrate:        boolean('has_heartrate').default(false),
  averageHeartrate:    real('average_heartrate'),
  maxHeartrate:        real('max_heartrate'),

  // Strava Social Counts
  kudosCount:          integer('kudos_count').default(0),
  commentCount:        integer('comment_count').default(0),
  prCount:             integer('pr_count').default(0),
  achievementCount:    integer('achievement_count').default(0),

  // Flags
  isTrainer:           boolean('is_trainer').default(false),
  isCommute:           boolean('is_commute').default(false),
  isManual:            boolean('is_manual').default(false),
  isPrivate:           boolean('is_private').default(false),   // Private Strava activities are not shown in social features
  isFlagged:           boolean('is_flagged').default(false),

  createdAt:           timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqueStravaId: unique().on(t.userId, t.stravaId),           // Prevent duplicate imports of the same Strava activity
}))
```

**Indexes:**
- Composite `(userId, stravaId)` unique — deduplication on sync
- `userId` — fetch user's Strava workouts
- Composite `(userId, startDate DESC)` — sorted list and graph queries
- `circleId` — circle workout feed

---

## Table 9 — `workout_comments`

**File:** `src/db/schema/workouts.ts`
**Purpose:** Comments on individual workouts (both manual and Strava). Uses `workoutSource` to know which table to join against for the workout data.

```ts
export const workoutComments = pgTable('workout_comments', {
  id:            uuid('id').primaryKey().defaultRandom(),
  workoutId:     uuid('workout_id').notNull(),                  // References either workouts.id or strava_workouts.id
  workoutSource: workoutSourceEnum('workout_source').notNull(), // 'manual' or 'strava' — tells the app which table to join
  authorId:      uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:       text('content').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
})
```

**Notes:**
- No DB-level FK on `workoutId` because it points to two different tables. The application enforces referential integrity.

---

## Table 10 — `workout_likes`

**File:** `src/db/schema/workouts.ts`
**Purpose:** Likes on individual workouts. Same dual-source pattern as workout_comments.

```ts
export const workoutLikes = pgTable('workout_likes', {
  id:            uuid('id').primaryKey().defaultRandom(),
  workoutId:     uuid('workout_id').notNull(),
  workoutSource: workoutSourceEnum('workout_source').notNull(),
  userId:        uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqueLike: unique().on(t.workoutId, t.workoutSource, t.userId),  // One like per user per workout
}))
```

---

## Table 11 — `goals`

**File:** `src/db/schema/workouts.ts`
**Purpose:** Fitness goals set by users. Progress is calculated at query time by aggregating workout data within the goal's time window.

```ts
export const goals = pgTable('goals', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:        goalTypeEnum('type').notNull(),
  targetValue: real('target_value').notNull(),                  // e.g. 100 (workouts), 500 (km), 5 (per week)
  startDate:   timestamp('start_date').notNull(),
  endDate:     timestamp('end_date').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})
```

**Notes:**
- Progress is NOT stored — it is computed dynamically in `getGoals()` by summing relevant workout data within `startDate` and `endDate`
- This avoids stale progress values if historical workouts are edited or deleted

---

## Table 12 — `circles`

**File:** `src/db/schema/circles.ts`
**Purpose:** Groups / communities (analogous to Facebook Groups). Has a visibility setting, category tag, and a designated owner.

```ts
export const circles = pgTable('circles', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          text('name').notNull(),
  description:   text('description'),
  visibility:    circleVisibilityEnum('visibility').notNull().default('public'),
  category:      text('category'),                              // e.g. "Running", "Cycling", "General"
  coverImageUrl: text('cover_image_url'),                       // Cloudinary URL
  ownerId:       uuid('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }), // Cannot delete a user who owns a circle
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})
```

**Indexes:**
- `ownerId` — find circles owned by a user
- `visibility` — filter public circles for Explore page
- `category` — filter by category on Explore page

---

## Table 13 — `circle_members`

**File:** `src/db/schema/circles.ts`
**Purpose:** Join table between users and circles. Tracks membership role and request status. The owner is also a row here with role = 'owner'.

```ts
export const circleMembers = pgTable('circle_members', {
  id:        uuid('id').primaryKey().defaultRandom(),
  circleId:  uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role:      circleMemberRoleEnum('role').notNull().default('member'),
  status:    circleMemberStatusEnum('status').notNull().default('active'),  // 'pending' for private circle requests
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqueMembership: unique().on(t.circleId, t.userId),         // A user can only have one membership record per circle
}))
```

**Indexes:**
- `userId` — find all circles a user belongs to
- `circleId` — find all members of a circle
- Composite `(circleId, status)` — find pending requests for a circle

---

## Table 14 — `events`

**File:** `src/db/schema/events.ts`
**Purpose:** Events created inside circles. Only visible to circle members.

```ts
export const events = pgTable('events', {
  id:           uuid('id').primaryKey().defaultRandom(),
  circleId:     uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
  creatorId:    uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  description:  text('description'),
  imageUrl:     text('image_url'),                              // Optional cover image (Cloudinary)
  status:       eventStatusEnum('status').notNull().default('draft'),
  category:     text('category'),
  dateTime:     timestamp('date_time').notNull(),
  location:     text('location'),
  maxAttendees: integer('max_attendees'),
  tags:         text('tags').array(),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})
```

**Indexes:**
- `circleId` — fetch all events for a circle
- Composite `(circleId, dateTime ASC)` — sorted upcoming events

---

## Table 15 — `polls`

**File:** `src/db/schema/polls.ts`
**Purpose:** Polls created inside circles. Each poll has multiple options and a configurable results visibility setting.

```ts
export const polls = pgTable('polls', {
  id:                uuid('id').primaryKey().defaultRandom(),
  circleId:          uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
  creatorId:         uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  question:          text('question').notNull(),
  resultsVisibility: pollVisibilityEnum('results_visibility').notNull().default('live'),
  closeDate:         timestamp('close_date'),                   // null = no close date / poll stays open indefinitely
  createdAt:         timestamp('created_at').notNull().defaultNow(),
})
```

---

## Table 16 — `poll_options`

**File:** `src/db/schema/polls.ts`
**Purpose:** The individual answer choices for a poll. A poll must have at least 2 options.

```ts
export const pollOptions = pgTable('poll_options', {
  id:        uuid('id').primaryKey().defaultRandom(),
  pollId:    uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  text:      text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

---

## Table 17 — `poll_votes`

**File:** `src/db/schema/polls.ts`
**Purpose:** Records which user voted for which option. One vote per user per poll enforced by unique constraint.

```ts
export const pollVotes = pgTable('poll_votes', {
  id:       uuid('id').primaryKey().defaultRandom(),
  pollId:   uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  optionId: uuid('option_id').notNull().references(() => pollOptions.id, { onDelete: 'cascade' }),
  userId:   uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqueVote: unique().on(t.pollId, t.userId),                  // One vote per user per poll
}))
```

---

## Table 18 — `routines`

**File:** `src/db/schema/routines.ts`
**Purpose:** Workout routines shared within a circle. Contains metadata; the actual steps are in routine_steps.

```ts
export const routines = pgTable('routines', {
  id:          uuid('id').primaryKey().defaultRandom(),
  circleId:    uuid('circle_id').notNull().references(() => circles.id, { onDelete: 'cascade' }),
  creatorId:   uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  description: text('description'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})
```

---

## Table 19 — `routine_steps`

**File:** `src/db/schema/routines.ts`
**Purpose:** Individual steps within a routine. Can be warm-up steps (duration-based) or exercise steps (sets/reps-based).

```ts
export const routineSteps = pgTable('routine_steps', {
  id:              uuid('id').primaryKey().defaultRandom(),
  routineId:       uuid('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  stepType:        routineStepTypeEnum('step_type').notNull(),   // 'warmup' or 'exercise'
  order:           integer('order').notNull(),                   // Display order — sort by this ascending
  name:            text('name').notNull(),
  description:     text('description'),

  // Warmup fields
  durationSeconds: integer('duration_seconds'),                  // Used for warmup steps

  // Exercise fields
  sets:            integer('sets'),
  reps:            integer('reps'),
  restSeconds:     integer('rest_seconds'),
  equipment:       text('equipment'),
  notes:           text('notes'),
})
```

**Indexes:**
- Composite `(routineId, order ASC)` — ordered step list

---

## Table 20 — `notifications`

**File:** `src/db/schema/notifications.ts`
**Purpose:** In-app notifications for all user-facing events. Created as a side effect inside other server actions (not by a separate service).

```ts
export const notifications = pgTable('notifications', {
  id:          uuid('id').primaryKey().defaultRandom(),
  recipientId: uuid('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:        notificationTypeEnum('type').notNull(),
  actorId:     uuid('actor_id').references(() => users.id, { onDelete: 'set null' }), // The user who triggered the notification (null for system notifications)
  entityId:    uuid('entity_id'),                               // ID of the relevant entity (post, circle, workout, etc.)
  entityType:  text('entity_type'),                             // e.g. 'post', 'circle', 'workout' — tells UI where to link
  read:        boolean('read').notNull().default(false),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})
```

**Indexes:**
- `recipientId` — fetch all notifications for a user
- Composite `(recipientId, read)` — unread count query
- Composite `(recipientId, createdAt DESC)` — sorted notification list

**Notification type → entity mapping:**

| Type | entityId points to | entityType |
|---|---|---|
| `friend_request_accepted` | friendship.id | `'friendship'` |
| `post_liked` | post.id | `'post'` |
| `post_commented` | post.id | `'post'` |
| `comment_replied` | comment.id | `'comment'` |
| `circle_request_received` | circle.id | `'circle'` |
| `added_to_circle` | circle.id | `'circle'` |
| `circle_event_created` | event.id | `'event'` |
| `circle_poll_created` | poll.id | `'poll'` |
| `workout_milestone` | goal.id | `'goal'` |

---

## Drizzle Relations Map

Define these in each schema file using Drizzle's `relations()` helper for type-safe joins.

```ts
// users
export const usersRelations = relations(users, ({ many }) => ({
  posts:         many(posts),
  workouts:      many(workouts),
  stravaWorkouts: many(stravaWorkouts),
  goals:         many(goals),
  sentRequests:  many(friendships, { relationName: 'requester' }),
  receivedRequests: many(friendships, { relationName: 'addressee' }),
  circleMembers: many(circleMembers),
  notifications: many(notifications, { relationName: 'recipient' }),
}))

// posts
export const postsRelations = relations(posts, ({ one, many }) => ({
  author:   one(users, { fields: [posts.authorId], references: [users.id] }),
  circle:   one(circles, { fields: [posts.circleId], references: [circles.id] }),
  tags:     many(postTags),
  likes:    many(postLikes),
  comments: many(comments),
  original: one(posts, { fields: [posts.originalPostId], references: [posts.id], relationName: 'repost' }),
}))

// comments
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post:    one(posts, { fields: [comments.postId], references: [posts.id] }),
  author:  one(users, { fields: [comments.authorId], references: [users.id] }),
  parent:  one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'parent' }),
  replies: many(comments, { relationName: 'parent' }),
}))

// circles
export const circlesRelations = relations(circles, ({ one, many }) => ({
  owner:    one(users, { fields: [circles.ownerId], references: [users.id] }),
  members:  many(circleMembers),
  posts:    many(posts),
  workouts: many(workouts),
  events:   many(events),
  polls:    many(polls),
  routines: many(routines),
}))

// friendships
export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, { fields: [friendships.requesterId], references: [users.id], relationName: 'requester' }),
  addressee: one(users, { fields: [friendships.addresseeId], references: [users.id], relationName: 'addressee' }),
}))
```

---

## Schema File Structure

```
src/db/schema/
├── users.ts          → users table + usersRelations
├── friends.ts        → friendships table + relations
├── posts.ts          → posts, post_tags, post_likes, comments + all relations
├── workouts.ts       → workouts, workout_comments, workout_likes, goals + relations
├── strava_workouts.ts → strava_workouts + relations
├── circles.ts        → circles, circle_members + relations
├── events.ts         → events + relations
├── polls.ts          → polls, poll_options, poll_votes + relations
├── routines.ts       → routines, routine_steps + relations
├── notifications.ts  → notifications + notificationTypeEnum + relations
└── index.ts          → re-exports everything; this is what drizzle.config.ts points to
```

---

## Inferred TypeScript Types

Export these from `src/types/index.ts` so they are available everywhere without re-importing from schema:

```ts
// Users
export type User        = typeof users.$inferSelect
export type NewUser     = typeof users.$inferInsert

// Posts
export type Post        = typeof posts.$inferSelect
export type NewPost     = typeof posts.$inferInsert
export type Comment     = typeof comments.$inferSelect
export type PostLike    = typeof postLikes.$inferSelect
export type PostTag     = typeof postTags.$inferSelect

// Workouts
export type Workout          = typeof workouts.$inferSelect
export type NewWorkout       = typeof workouts.$inferInsert
export type StravaWorkout    = typeof stravaWorkouts.$inferSelect
export type WorkoutComment   = typeof workoutComments.$inferSelect
export type WorkoutLike      = typeof workoutLikes.$inferSelect
export type Goal             = typeof goals.$inferSelect

// Circles
export type Circle       = typeof circles.$inferSelect
export type NewCircle    = typeof circles.$inferInsert
export type CircleMember = typeof circleMembers.$inferSelect

// Events
export type Event        = typeof events.$inferSelect
export type NewEvent     = typeof events.$inferInsert

// Polls
export type Poll         = typeof polls.$inferSelect
export type PollOption   = typeof pollOptions.$inferSelect
export type PollVote     = typeof pollVotes.$inferSelect

// Routines
export type Routine      = typeof routines.$inferSelect
export type RoutineStep  = typeof routineSteps.$inferSelect

// Notifications
export type Notification = typeof notifications.$inferSelect

// Friendships
export type Friendship   = typeof friendships.$inferSelect

// Composite types used across the app
export type WorkoutSource = 'manual' | 'strava'

export type WorkoutWithSource =
  | (Workout & { source: 'manual' })
  | (StravaWorkout & { source: 'strava' })

export type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'username' | 'avatarUrl'>
  likes: PostLike[]
  comments: (Comment & { author: Pick<User, 'id' | 'username' | 'avatarUrl'>, replies: Comment[] })[]
  tags: (PostTag & { user: Pick<User, 'id' | 'username'> })[]
  _count: { likes: number; comments: number }
}

export type CircleWithMembership = Circle & {
  memberCount: number
  userRole: 'owner' | 'moderator' | 'member' | null
  userStatus: 'active' | 'pending' | null
}

export type GoalWithProgress = Goal & {
  currentValue: number
  progressPercent: number
}
```

---

## Database Indexes Summary

| Table | Index | Purpose |
|---|---|---|
| users | `clerk_id` | Session lookup on every request |
| users | `username` | Friend search |
| users | `(city, state, country)` | Area posts on Explore |
| friendships | `requester_id` | Sent requests |
| friendships | `addressee_id` | Received requests |
| friendships | `(requester_id, addressee_id)` UNIQUE | Prevent duplicates |
| posts | `author_id` | Profile feed |
| posts | `circle_id` | Circle feed |
| posts | `(author_id, created_at DESC)` | Profile feed sorted |
| posts | `(circle_id, created_at DESC)` | Circle feed sorted |
| post_likes | `(post_id, user_id)` UNIQUE | Prevent duplicate likes |
| comments | `post_id` | Fetch comments |
| comments | `(post_id, created_at ASC)` | Ordered comments |
| workouts | `user_id` | Fetch workouts |
| workouts | `(user_id, date DESC)` | Sorted + graph queries |
| workouts | `circle_id` | Circle workout feed |
| strava_workouts | `(user_id, strava_id)` UNIQUE | Deduplication on sync |
| strava_workouts | `(user_id, start_date DESC)` | Sorted + graph queries |
| strava_workouts | `circle_id` | Circle workout feed |
| workout_likes | `(workout_id, workout_source, user_id)` UNIQUE | Prevent duplicate likes |
| goals | `user_id` | Fetch goals |
| circles | `owner_id` | Owner lookup |
| circles | `visibility` | Public circle browse |
| circle_members | `user_id` | Find user's circles |
| circle_members | `circle_id` | Find circle's members |
| circle_members | `(circle_id, status)` | Pending requests |
| circle_members | `(circle_id, user_id)` UNIQUE | Prevent duplicate memberships |
| events | `circle_id` | Circle events |
| events | `(circle_id, date_time ASC)` | Upcoming events sorted |
| polls | `circle_id` | Circle polls |
| poll_votes | `(poll_id, user_id)` UNIQUE | One vote per user |
| routines | `circle_id` | Circle routines |
| routine_steps | `(routine_id, order ASC)` | Ordered steps |
| notifications | `recipient_id` | Fetch notifications |
| notifications | `(recipient_id, read)` | Unread count |
| notifications | `(recipient_id, created_at DESC)` | Sorted list |
