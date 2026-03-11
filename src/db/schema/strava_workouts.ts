import { pgTable, uuid, text, timestamp, integer, real, boolean, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { circles } from './circles'

export const stravaWorkouts = pgTable(
  'strava_workouts',
  {
    id:       uuid('id').primaryKey().defaultRandom(),
    userId:   uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    stravaId: text('strava_id').notNull(),
    circleId: uuid('circle_id').references(() => circles.id, { onDelete: 'set null' }),

    // Identity
    name:      text('name').notNull(),
    type:      text('type'),
    sportType: text('sport_type'),

    // Timing
    startDate:      timestamp('start_date'),
    startDateLocal: timestamp('start_date_local'),
    movingTime:     integer('moving_time'),
    elapsedTime:    integer('elapsed_time'),

    // Distance & Speed
    distance:     real('distance'),
    averageSpeed: real('average_speed'),
    maxSpeed:     real('max_speed'),

    // Elevation
    totalElevationGain: real('total_elevation_gain'),
    elevHigh:           real('elev_high'),
    elevLow:            real('elev_low'),

    // Location
    locationCity:    text('location_city'),
    locationState:   text('location_state'),
    locationCountry: text('location_country'),
    startLat:        real('start_lat'),
    startLng:        real('start_lng'),
    endLat:          real('end_lat'),
    endLng:          real('end_lng'),

    // Route
    mapId:            text('map_id'),
    summaryPolyline:  text('summary_polyline'),

    // Heart Rate
    hasHeartrate:     boolean('has_heartrate').default(false),
    averageHeartrate: real('average_heartrate'),
    maxHeartrate:     real('max_heartrate'),

    // Strava Social
    kudosCount:       integer('kudos_count').default(0),
    commentCount:     integer('comment_count').default(0),
    prCount:          integer('pr_count').default(0),
    achievementCount: integer('achievement_count').default(0),

    // Flags
    isTrainer:  boolean('is_trainer').default(false),
    isCommute:  boolean('is_commute').default(false),
    isManual:   boolean('is_manual').default(false),
    isPrivate:  boolean('is_private').default(false),
    isFlagged:  boolean('is_flagged').default(false),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    unique('strava_workouts_unique').on(t.userId, t.stravaId),
    index('strava_workouts_user_id_idx').on(t.userId),
    index('strava_workouts_user_date_idx').on(t.userId, t.startDate),
    index('strava_workouts_circle_id_idx').on(t.circleId),
  ],
)

// ─── Relations ───────────────────────────────────────────────────────────────

export const stravaWorkoutsRelations = relations(stravaWorkouts, ({ one }) => ({
  user:   one(users,   { fields: [stravaWorkouts.userId],   references: [users.id] }),
  circle: one(circles, { fields: [stravaWorkouts.circleId], references: [circles.id] }),
}))
