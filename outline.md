# Social Strides — Project Outline v2.0

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | Neon (PostgreSQL) |
| ORM | Drizzle ORM |
| Server Actions | Next.js Server Actions |
| Client State | Zustand |
| Server State / Fetching | React Query (TanStack Query v5) |
| Image Storage | Cloudinary |
| Hosting | Vercel |
| Fitness Integration | Strava OAuth 2.0 API |
| Real-time | React Query polling |

---

## 2. Color & Design System

- **Mode:** Dark mode only
- **Primary / Brand Color:** Red / coral accent (consistent with prototype identity)
- **UI Library:** shadcn/ui components, customized to dark theme with red accent
- **Layout:** X/Twitter-style — left sidebar nav, fixed-width center content column, right sidebar (contextual info / centering balance)
- **Mobile:** Bottom tab navigation; sidebars collapse on small screens

---

## 3. Authentication & Onboarding

**Provider:** Clerk (handles sign-up, login, session management, JWT)

### Pages
- `/auth/sign-up` — Clerk-powered registration (email/password + optional social login)
- `/auth/login` — Clerk-powered login
- `/auth/onboarding` — Post-registration profile setup; auto-redirected here on first sign-in

### Onboarding Form Fields
- Username
- Bio
- Profile picture upload (Cloudinary)
- Location (city, state, country)

### Auth Rules
- All `/(user)/` routes require authentication — unauthenticated users redirected to `/auth/login`
- Users who have not completed onboarding are redirected to `/auth/onboarding`
- Clerk middleware enforces route protection globally via `middleware.ts`

---

## 4. Layout (Authenticated)

The authenticated shell wraps all `/(user)/` routes via `(user)/layout.tsx`.

### Left Sidebar
Persistent navigation with icon + label links:
- 🏠 Home
- 🏋️ Workouts
- 👥 Friends
- ⭕ Circles
- 🔭 Explore
- 🔔 Notifications (with unread badge)
- 👤 Profile
- ⚙️ Settings
- **Logo / App Name** pinned at top
- **User avatar + display name** pinned at bottom with sign-out button

### Center Column
Primary content area. Max-width constrained and horizontally centered.

### Right Sidebar
Contextual panels (e.g., suggested friends, active circle highlights). Used to balance the layout and keep center column centered. Left empty on pages where no contextual content applies.

### Mobile
Bottom tab bar: Home, Workouts, Circles, Notifications, Profile. Left sidebar hidden.

---

## 5. Pages & Features

---

### 5.1 Landing Page `/`

Public-facing marketing homepage.

**Sections:**
- **Hero** — App logo, tagline ("Your Fitness, Your Journey"), CTA buttons: Get Started, Sign In, View Demo
- **Why Social Strides?** — 4 value props with icons: Real Training Focus, Meaningful Connections, Accountability & Motivation, Data-Driven Growth
- **How It Works** — 4-step numbered flow: Build Profile → Log Workouts → Share Journey → Join Circles
- **Features** — 3 cards: Sync & Track Your Fitness, Share Your Story, Explore & Connect
- **CTA Banner** — Red gradient, "Ready to Start Your Story?" + Get Started button
- **Footer** — Logo, Product links, Company links, Privacy / Terms / Support

---

### 5.2 Home Feed `/home`

Unified social feed — Facebook-style. Shows all posts relevant to the logged-in user.

**Feed includes:**
- Posts from friends (all privacy levels the viewer is entitled to see)
- Posts from all Circles the user is a member of
- Sorted by recency (newest first)
- React Query polling every 30 seconds for new posts

**Compose Post Box (top of feed):**
- User avatar
- Text input with `@mention` friend tagging support
- Attachments: image upload (Cloudinary), attach a workout, feeling/mood tag
- Privacy selector: Public / Friends Only / Only Me
- Post button

**Post Card:**
- Author avatar, display name, timestamp, privacy badge
- Post text content
- Optional: image(s)
- Optional: attached workout summary card (type, duration, distance)
- Optional: feeling/mood tag
- Optional: tagged friends list
- Interactions bar: 👍 Like, 💬 Comment, 🔁 Share/Repost
- Comment section (expandable):
  - Flat list of comments with avatar + name
  - 1-level-deep replies nested under each comment
  - Reply button per comment

**Right Sidebar (Home):**
- People You May Know (suggested friends)
- Active Circle highlights

---

### 5.3 Workouts `/workouts`

Personal workout dashboard. Central hub for all fitness tracking.

**Header Actions:**
- **Add Workout** button → opens modal/drawer with manual entry form
- **Sync Strava** button → see Section 6 (Strava Integration) for full flow
- **Create Goal** button → opens goal creation modal

**Manual Workout Form Fields:**
- Title
- Workout type (Run, Cycle, Swim, Lift, Walk, Hike, Other)
- Date
- Duration (hours + minutes)
- Distance (optional, km or miles)
- Calories (optional)
- Notes / description (optional)

**Goals Section:**
- Progress bar cards for each active goal
- Goal types: Total Workouts, Total Distance, Workouts Per Week, Total Calories
- Each card: goal label, current value, target value, progress percentage, time remaining

**Workout Graph:**
- Bar or line chart of workout frequency/distance over time
- Toggle: last 30 days / last 90 days
- Merges manual + Strava data into single view
- Powered by Recharts

**Recent Workouts List:**
- Last 5 workouts as cards: source badge (Manual / Strava), type badge, title, date, duration, distance
- "View All" link → `/workouts/all`

**Strava Connection Banner** (conditional):
- If Strava is NOT connected: shows a prominent banner — "Connect Strava to automatically import your activities" with a Connect button
- If Strava IS connected: shows last synced timestamp + "Sync Now" button

---

### 5.4 All Workouts `/workouts/all`

Paginated full list of all workouts (manual + Strava combined).

- Filter bar: workout type, date range, source (Manual / Strava / All)
- Each row: source badge, type badge, title, date, duration, distance
- Sorted newest first by default
- Click any row → `/workouts/[workoutId]`

---

### 5.5 Workout Detail `/workouts/[workoutId]`

Full detail view for a single workout (works for both manual and Strava).

**Displays:**
- Title, date, type badge, Strava badge (if applicable)
- Stats grid: Duration, Distance, Elevation Gain, Calories, Avg Heart Rate, Max Heart Rate
- Notes / description (manual workouts)
- **Route Map** (Strava workouts only) — Leaflet map rendering decoded polyline; start/end markers
- Comments & reactions from friends (like + comment)
- "Share to Feed" button → pre-fills post composer with this workout attached
- "Share to Circle" button → modal to select a circle to post to

---

### 5.6 Friends `/friends`

**Three sections:**

**1. Find Friends**
- Search input (by name or email, min 2 characters, debounced)
- Live results: avatar, name, mutual friends count, Send Request button
- Button states: Send Request / Pending / Friends (disabled)

**2. Pending Requests**
- Incoming: avatar, name, Accept / Decline buttons
- Outgoing: avatar, name, "Pending" label + Cancel option

**3. My Friends**
- Grid of all accepted friends
- Each card: avatar, name, bio snippet, online indicator, mutual friends count, shared circles
- Search/filter by name or bio
- Click card → `/profile/[userId]`

---

### 5.7 Circles `/circles`

Personal circles dashboard.

**Header:**
- **Create Circle** button → `/circles/create`

**My Circles Grid:**
- Cards: circle name, description snippet, member count, visibility badge (Public / Private), category tag
- Empty state: "Create Your First Circle" CTA

**Recent Circle Activity:**
- Last 10 notable items across all your circles: new events, new polls, new members — with relative timestamps and circle name

**Circle Feed:**
- Unified post feed from all circles the user belongs to

---

### 5.8 Create Circle `/circles/create`

Form page:
- Circle Name
- Description
- Visibility: Public / Private
- Sport / Category tag (Running, Cycling, Hiking, Lifting, Swimming, General, etc.)
- Invite members (multi-select search from friends list)
- Submit → creates circle, redirects to `/circles/[circleId]`

---

### 5.9 Circle Detail `/circles/[circleId]`

**Header Banner (red gradient):**
- Cover image (if set), circle name, description, member count, visibility badge, category tag
- **Join Circle** button for non-members (Private → sends pending request; Public → joins immediately)
- **Leave Circle** button for non-owner members
- **Settings** link (owner/moderator only) → `/circles/[circleId]/settings`

**Pending Requests Panel** (owner/moderator only):
- List of users awaiting approval with Accept / Reject buttons

**Feature Tabs:**
- **Posts** — circle-specific post feed + compose box
- **Workouts** — all member workouts shared to this circle
- **Events** — circle events list
- **Polls** — circle polls
- **Routines** — shared workout routines

---

### 5.10 Circle Settings `/circles/[circleId]/settings`

Owner-only page (non-owners are redirected).

**Sections:**
- **Edit Details** — name, description, visibility, category, cover image upload
- **Manage Members** — full member list with role badges; promote to Moderator, demote to Member, or remove
- **Danger Zone** — Delete Circle Permanently (requires typed confirmation)

---

### 5.11 Circle Events `/circles/[circleId]/events`

List of all events for this circle (members only).

**Create Event** button (owner/moderator):
- Name, description, date & time, location, category, max attendees, optional cover image, tags
- Status: Draft or Published immediately

**Event Cards:**
- Name, status badge, category badge, date, location, attendee count
- Click → event detail page

---

### 5.12 Circle Event Detail `/circles/[circleId]/events/[eventId]`

Full event detail:
- Name, status badge, category badge, cover image (if set)
- Description, date/time, location, tags, max attendees
- Back link to events list

---

### 5.13 Circle Workouts `/circles/[circleId]/workouts`

All workouts shared to this circle by any member.

- Sorted newest first
- Each row: member avatar + name, workout type badge, source badge, date, duration, distance
- Click row → `/circles/[circleId]/workouts/[workoutId]`

---

### 5.14 Circle Workout Detail `/circles/[circleId]/workouts/[workoutId]`

Workout detail in circle context:
- Date, type, duration, distance, description
- Comments from circle members
- Back link to circle workouts list

---

### 5.15 Circle Polls `/circles/[circleId]/polls`

**Create Poll** button (owner/moderator):
- Question text
- Answer options (dynamic add/remove, minimum 2)
- Results visibility: Live (show as votes come in) / After Close (hidden until end date)
- Optional close date

**Poll Cards:**
- Question, creator, close date
- Options with vote counts (shown per visibility setting)
- One vote per user; vote button disabled after voting

---

### 5.16 Circle Routines `/circles/[circleId]/routines`

Shared workout routines for the circle.

**Add Routine** button (any member):
- Routine name, description
- Warm-up steps: description, duration
- Exercise steps: name, sets, reps, rest time, equipment, notes
- Steps are ordered and reorderable

**Routine Cards:**
- Name, creator avatar + name, step count, created date
- Click → full routine detail with step-by-step breakdown + comments section

---

### 5.17 Explore `/explore`

**Search & Browse Circles:**
- Search bar (by name or category)
- Category filter chips: Running, Cycling, Hiking, Lifting, Swimming, General, etc.
- Results grid: circle name, description, member count, visibility badge, category, "View Circle" button

**Recommended For You:**
- Circles your friends are already in
- Each card: circle name, which friends are members, total member count, "View Circle" button
- Ranked by number of mutual friends in circle

**Posts From Your Area:**
- Public posts from users sharing the same city / state / country as the logged-in user
- Requires location to be set in profile; shows empty state with prompt to set location if not set

---

### 5.18 Notifications `/notifications`

In-app notification center. Bell icon in sidebar shows unread count badge. React Query polls every 15 seconds for unread count and 30 seconds for full list.

**Notification types:**
- ✅ Friend request accepted
- ❤️ Someone liked your post
- 💬 Someone commented on your post
- ↩️ Someone replied to your comment
- 🔔 Circle join request received (owners/mods)
- ➕ You were added to a Circle
- 📅 New event or poll created in one of your Circles
- 🏆 Workout milestone reached (e.g., 100 total workouts, 500 km logged)

**UI:**
- Grouped by date: Today, Yesterday, This Week, Earlier
- Mark All as Read button
- Each notification is a clickable link to the relevant content
- Unread notifications are visually highlighted

---

### 5.19 Profile `/profile/[userId]`

Works for both own profile and other users' profiles with conditional edit controls.

**Header:**
- Avatar (own profile: click camera icon to upload new image via Cloudinary)
- Display name, username, bio, location, join date
- Stats row: Posts count, Friends count, Workouts count
- **Privacy enforcement:** If profile is set to Friends Only and viewer is not a friend → show limited view (avatar, name, Add Friend button only)
- Add Friend / Friends status / Pending button (when viewing other profiles)

**Tabs:**
- **Posts** — user's public/friends posts timeline
- **Workouts** — user's logged workouts (respects privacy setting)

---

### 5.20 Settings `/settings`

**Profile:**
- Change profile picture (Cloudinary upload)
- Update display name / username
- Update bio
- Update location (city, state, country)

**Privacy:**
- Profile visibility toggle: Public / Friends Only

**Account:**
- Update email (Clerk-managed)
- Change password (Clerk-managed)

**Integrations:**
- Strava connection card — shows connected status, Strava athlete name, last synced time
- Connect / Disconnect Strava button

**Danger Zone:**
- Delete Account permanently (typed confirmation required)

---

## 6. Strava Integration

### Overview

Strava is integrated as an optional fitness data source. Users connect their Strava account via OAuth 2.0 from the Workouts page. Once connected, workouts are imported automatically on first connect and manually on demand via a "Sync Now" button. All Strava logic is split across API route handlers (for OAuth flows) and server actions (for data operations).

---

### 6.1 UI Entry Points

**Workouts page (`/workouts`):**
- If Strava is NOT connected: persistent banner — "Connect Strava to automatically import your activities" with a Connect button
- If Strava IS connected: "Sync Strava" button in the header actions + "Last synced: X minutes ago" label
- Strava workouts appear alongside manual workouts throughout the app, distinguished by a Strava source badge

**Settings page (`/settings` → Integrations):**
- Strava connection card showing: connected/disconnected status, Strava athlete name (if connected), last sync timestamp
- Connect / Disconnect button

---

### 6.2 API Routes (`src/app/api/strava/`)

Five dedicated route handlers manage the full OAuth and sync lifecycle:

#### `GET /api/strava/auth`
- Entry point when user clicks "Connect Strava"
- Builds the Strava OAuth authorization URL with scopes: `read`, `activity:read_all`
- Redirects user to Strava's external login/approval page

#### `GET /api/strava/callback`
- Strava redirects here after the user approves access, with a temporary `code` in the query string
- Exchanges the code for a real `access_token` and `refresh_token` via Strava's token endpoint
- Saves both tokens plus `token_expires_at` to the user's DB record
- Immediately triggers `syncStravaWorkouts()` to do a full initial import
- On success: redirects user to `/workouts`
- On failure (missing code, exchange error, DB error): redirects to `/auth/login?error=strava_failed`

#### `POST /api/strava/sync`
- Manually triggered by the "Sync Now" button in the UI
- Calls `syncStravaWorkouts(userId)` internally
- Returns `{ success: true, newCount: number }` on completion
- Used by React Query mutation — invalidates `['workouts', userId]` on success

#### `GET /api/strava/check-tokens`
- Lightweight status check: returns `{ connected: boolean, lastSynced: string | null }`
- Called on workouts page load to determine which UI state to render (Connect banner vs Sync button)

#### `POST /api/strava/disconnect`
- Clears all stored Strava tokens from the user's DB record (`stravaAccessToken`, `stravaRefreshToken`, `stravaTokenExpiry`, `stravaAthleteId` all set to null)
- Does NOT delete previously imported Strava workouts (they remain in the user's history)
- Returns `{ success: true }` — UI updates connection status accordingly

---

### 6.3 Sync Logic (`syncStravaWorkouts`)

The core sync function lives in `src/app/api/strava/sync/route.ts` and follows this process:

```
1. Look up user's stored Strava tokens from DB
2. Check if access token is expired
   → If expired: POST to Strava /oauth/token with refresh_token
                 Save new access_token + refresh_token + expiry to DB
                 Continue with new token
3. Fetch activities from Strava GET /athlete/activities
4. Find most recent stored StravaWorkout date for this user
5. Filter fetched activities to only those newer than last stored date
   (avoids re-importing duplicates efficiently)
6. For each new activity:
   → Map all fields to StravaWorkout schema
   → Insert into strava_workouts table
7. If Strava returns 401 at any point:
   → Clear all stored tokens for the user
   → Return error prompting user to reconnect
8. Return { newCount } to caller
```

**Improvement over prototype:** The prototype fetched all Strava activities on every sync and filtered locally. The new version passes `after` (Unix timestamp of most recent stored workout) as a query param to Strava's API, so only new activities are fetched — much faster for users with large histories.

---

### 6.4 Token Refresh Flow

Strava access tokens expire after 6 hours. Refresh is handled automatically and transparently:

```
syncStravaWorkouts() called
        ↓
Is stravaTokenExpiry in the past?
        ↓ YES
POST https://www.strava.com/oauth/token
  { client_id, client_secret, refresh_token, grant_type: "refresh_token" }
        ↓
New access_token + refresh_token + expires_at returned
        ↓
Update user record in DB with new values
        ↓
Continue sync with new access_token
```

Tokens are never exposed in query parameters. All token handling happens server-side only.

---

### 6.5 Data Stored Per Strava Workout

All fields are stored in the `strava_workouts` table:

| Category | Fields |
|---|---|
| Identity | `stravaId`, `name`, `type`, `sportType` |
| Timing | `startDate`, `startDateLocal`, `movingTime`, `elapsedTime` |
| Distance & Speed | `distance`, `averageSpeed`, `maxSpeed` |
| Elevation | `totalElevationGain`, `elevHigh`, `elevLow` |
| Location | `locationCity`, `locationState`, `locationCountry`, `startLat`, `startLng`, `endLat`, `endLng` |
| Route | `mapId`, `summaryPolyline` (decoded to render on Leaflet map) |
| Heart Rate | `hasHeartrate`, `averageHeartrate`, `maxHeartrate` |
| Strava Social | `kudosCount`, `commentCount`, `prCount`, `achievementCount` |
| Flags | `isTrainer`, `isCommute`, `isManual`, `isPrivate`, `isFlagged` |

**Fix from prototype:** `startLng` and `endLng` were mapped but not saved in the original. Both are now correctly persisted.

---

### 6.6 Full Connection Flow (End to End)

```
User clicks "Connect Strava" on /workouts
        ↓
GET /api/strava/auth
        ↓
Redirect → Strava OAuth login & approval page
        ↓
User approves access on Strava
        ↓
Strava redirects → GET /api/strava/callback?code=...
        ↓
Exchange code → access_token + refresh_token
        ↓
Tokens + expiry saved to user DB record
        ↓
syncStravaWorkouts() runs (initial full import)
        ↓
Activities fetched from Strava API
        ↓
New workouts saved to strava_workouts table
        ↓
User redirected to /workouts
        ↓
Workouts page shows merged manual + Strava data
```

---

### 6.7 Known Limitations & V2 Improvements

| Item | Status |
|---|---|
| No webhook support — sync only happens on manual trigger or reconnect | V2: add Strava webhook subscription for real-time activity push |
| No Garmin / Apple Health support | V2 roadmap |
| Strava private activities are imported but not shown publicly | Handled via `isPrivate` flag — filtered from social features |

---

## 7. Database Schema (Drizzle ORM — Neon PostgreSQL)

### Tables

**users**
`id, clerkId, username, email, bio, avatarUrl, avatarPublicId, city, state, country, profileVisibility (public/friends_only), onboardingComplete, stravaAccessToken, stravaRefreshToken, stravaTokenExpiry, stravaAthleteId, stravaLastSynced, createdAt, updatedAt`

**friendships**
`id, requesterId, addresseeId, status (pending/accepted/declined), createdAt, updatedAt`

**posts**
`id, authorId, content, feeling, privacy (public/friends_only/only_me), circleId (nullable), imageUrls[], attachedWorkoutId (nullable), attachedWorkoutSource (manual/strava, nullable), createdAt, updatedAt`

**post_tags**
`id, postId, userId`

**post_likes**
`id, postId, userId, createdAt`

**comments**
`id, postId, authorId, content, parentId (nullable — for replies), createdAt, updatedAt`

**workouts** (manual)
`id, userId, title, type, date, durationMinutes, distanceKm, calories, notes, circleId (nullable), createdAt`

**strava_workouts**
`id, userId, stravaId, name, type, sportType, startDate, startDateLocal, movingTime, elapsedTime, distance, averageSpeed, maxSpeed, totalElevationGain, elevHigh, elevLow, locationCity, locationState, locationCountry, startLat, startLng, endLat, endLng, mapId, summaryPolyline, hasHeartrate, averageHeartrate, maxHeartrate, kudosCount, commentCount, prCount, achievementCount, isTrainer, isCommute, isManual, isPrivate, isFlagged, circleId (nullable), createdAt`

**workout_comments**
`id, workoutId, workoutSource (manual/strava), authorId, content, createdAt`

**workout_likes**
`id, workoutId, workoutSource (manual/strava), userId, createdAt`

**goals**
`id, userId, type (total_workouts/total_distance/workouts_per_week/total_calories), targetValue, startDate, endDate, createdAt`

**circles**
`id, name, description, visibility (public/private), category, coverImageUrl, ownerId, createdAt, updatedAt`

**circle_members**
`id, circleId, userId, role (owner/moderator/member), status (active/pending), createdAt`

**events**
`id, circleId, creatorId, name, description, imageUrl, status (draft/published), category, dateTime, location, maxAttendees, tags[], createdAt, updatedAt`

**polls**
`id, circleId, creatorId, question, resultsVisibility (live/after_close), closeDate, createdAt`

**poll_options**
`id, pollId, text, createdAt`

**poll_votes**
`id, pollId, optionId, userId, createdAt`

**routines**
`id, circleId, creatorId, name, description, createdAt`

**routine_steps**
`id, routineId, stepType (warmup/exercise), order, name, description, durationSeconds, sets, reps, restSeconds, equipment, notes`

**notifications**
`id, recipientId, type, actorId, entityId, entityType, read, createdAt`

---

## 8. Server Actions

### `user.actions.ts`
- `createUser` — create DB record after Clerk sign-up
- `getUserSession` — get current Clerk session + DB user
- `getUserProfile` — full profile of logged-in user
- `getUserProfileById` — public profile of any user (respects privacy setting)
- `updateUserProfileImage` — Cloudinary upload + save URL + delete old image
- `updateUsername`
- `updateBio`
- `updateUserLocation`
- `updateProfileVisibility`
- `completeOnboarding`
- `getCurrentUserAvatar`
- `deleteAccount`

### `post.actions.ts`
- `createPost` — text, images, feeling, privacy, circle, tagged friends, attached workout
- `getHomeFeedPosts` — friends + circle posts merged, sorted by recency
- `getCirclePosts` — posts for a specific circle (members only)
- `getPostsByUserId` — for profile page (respects privacy)
- `getAreaPosts` — location-based public posts for Explore page
- `deletePost`

### `post_interaction.actions.ts`
- `likePost` / `unlikePost`
- `createComment`
- `replyToComment`
- `deleteComment`
- `sharePost` — creates a repost linking to original

### `friend.actions.ts`
- `sendFriendRequest`
- `acceptFriendRequest`
- `declineFriendRequest`
- `cancelFriendRequest`
- `getPendingFriendRequests`
- `getAllUserFriends`
- `searchUsers`
- `getFriendshipStatus`

### `workout.actions.ts`
- `addWorkout`
- `getWorkouts` — manual only
- `getAllWorkouts` — manual + Strava merged and sorted
- `getWorkoutById` — checks manual first, falls back to Strava
- `shareWorkoutToCircle`
- `addWorkoutComment`
- `likeWorkout`
- `createGoal`
- `getGoals` — includes calculated progress per goal
- `getWorkoutStats` — aggregated data for graph (by day/week)

### `strava.actions.ts`
- `getStravaConnectionStatus` — returns `{ connected, lastSynced, athleteName }`
- `getStravaAuthUrl` — builds OAuth redirect URL
- `exchangeCodeForToken` — swaps auth code for access + refresh tokens
- `refreshStravaToken` — uses refresh token to get new access token
- `syncStravaWorkouts` — core sync: fetch new activities, deduplicate, persist
- `disconnectStrava` — clears all stored tokens from user record

### `circle.actions.ts`
- `createCircle`
- `getCircleById`
- `getCirclesForUser`
- `getAllPublicCircles`
- `searchCircles`
- `joinCircle`
- `leaveCircle`
- `approveCircleRequest`
- `rejectCircleRequest`
- `getPendingCircleRequests`
- `updateCircleDetails`
- `getCircleMembers`
- `updateCircleMember`
- `deleteCircle`
- `getRecommendedCircles`
- `getRecentCircleHighlights`

### `event.actions.ts`
- `createCircleEvent`
- `getCircleEvents`
- `getEventById`
- `updateEvent`
- `deleteEvent`

### `poll.actions.ts`
- `createCirclePoll`
- `getCirclePolls`
- `votePoll`
- `getPollResults`

### `routine.actions.ts`
- `addRoutineToCircle`
- `getCircleRoutines`
- `getRoutineById`
- `deleteRoutine`

### `notification.actions.ts`
- `getNotifications`
- `markNotificationRead`
- `markAllNotificationsRead`
- `getUnreadCount`
- `createNotification` (internal — called by other actions as side effect)

---

## 9. Zustand Stores

### `useUserStore`
- State: current user profile, avatar URL, location, onboarding status, Strava connection status
- Actions: `setUser`, `updateAvatar`, `updateLocation`, `setStravaConnected`, `clearUser`

### `useNotificationStore`
- State: unread notification count
- Actions: `setUnreadCount`, `decrementUnread`, `clearUnread`

### `usePostStore`
- State: compose post draft (text, images, feeling, privacy, tagged friends, attached workout)
- Actions: `setDraft`, `updateDraftField`, `clearDraft`

---

## 10. React Query Keys & Polling

| Query | Key | Poll Interval |
|---|---|---|
| Home feed | `['feed', userId]` | 30s |
| Notifications list | `['notifications', userId]` | 30s |
| Unread count | `['notifications', 'unread', userId]` | 15s |
| Circle posts | `['circle-posts', circleId]` | 30s |
| Strava connection status | `['strava-status', userId]` | none |
| Friends list | `['friends', userId]` | none |
| Workouts | `['workouts', userId]` | none |
| Goals | `['goals', userId]` | none |
| Circle members | `['circle-members', circleId]` | none |

**Strava sync mutation:** On `POST /api/strava/sync` success → `queryClient.invalidateQueries(['workouts', userId])` to refresh workout list and graph automatically.

---

## 11. File & Folder Structure

```
src/
├── app/
│   ├── page.tsx                              # Landing page
│   ├── auth/
│   │   ├── sign-up/page.tsx
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   ├── api/
│   │   └── strava/
│   │       ├── auth/route.ts                 # Redirect to Strava OAuth
│   │       ├── callback/route.ts             # Handle OAuth callback + initial sync
│   │       ├── sync/route.ts                 # Manual sync endpoint
│   │       ├── check-tokens/route.ts         # Connection status check
│   │       └── disconnect/route.ts           # Clear tokens
│   └── (user)/
│       ├── layout.tsx                        # Authenticated shell
│       ├── home/page.tsx
│       ├── workouts/
│       │   ├── page.tsx
│       │   ├── all/page.tsx
│       │   └── [workoutId]/page.tsx
│       ├── friends/page.tsx
│       ├── circles/
│       │   ├── page.tsx
│       │   ├── create/page.tsx
│       │   └── [circleId]/
│       │       ├── page.tsx
│       │       ├── settings/page.tsx
│       │       ├── events/
│       │       │   ├── page.tsx
│       │       │   └── [eventId]/page.tsx
│       │       ├── polls/page.tsx
│       │       ├── workouts/
│       │       │   ├── page.tsx
│       │       │   └── [workoutId]/page.tsx
│       │       └── routines/page.tsx
│       ├── explore/page.tsx
│       ├── notifications/page.tsx
│       ├── profile/[userId]/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── layout/
│   │   ├── LeftSidebar.tsx
│   │   ├── RightSidebar.tsx
│   │   └── MobileBottomNav.tsx
│   ├── feed/
│   │   ├── PostCard.tsx
│   │   ├── PostComposer.tsx
│   │   ├── CommentSection.tsx
│   │   └── FeedList.tsx
│   ├── workout/
│   │   ├── WorkoutCard.tsx
│   │   ├── WorkoutForm.tsx
│   │   ├── WorkoutGraph.tsx
│   │   ├── GoalCard.tsx
│   │   ├── MapPlot.tsx
│   │   └── StravaConnectBanner.tsx
│   ├── strava/
│   │   ├── SyncStravaButton.tsx              # Handles sync mutation + loading state
│   │   └── StravaStatusCard.tsx              # Used in Settings integrations section
│   ├── circles/
│   │   ├── CircleCard.tsx
│   │   ├── CircleHeader.tsx
│   │   ├── CircleTabs.tsx
│   │   ├── MemberCard.tsx
│   │   └── PendingRequests.tsx
│   ├── friends/
│   │   ├── FriendCard.tsx
│   │   ├── FriendSearch.tsx
│   │   └── PendingFriendRequests.tsx
│   ├── notifications/
│   │   └── NotificationItem.tsx
│   └── ui/                                   # shadcn/ui components
├── actions/
│   ├── user.actions.ts
│   ├── post.actions.ts
│   ├── post_interaction.actions.ts
│   ├── friend.actions.ts
│   ├── workout.actions.ts
│   ├── strava.actions.ts
│   ├── circle.actions.ts
│   ├── event.actions.ts
│   ├── poll.actions.ts
│   ├── routine.actions.ts
│   └── notification.actions.ts
├── db/
│   ├── index.ts                              # Drizzle + Neon client
│   └── schema/
│       ├── users.ts
│       ├── posts.ts
│       ├── workouts.ts
│       ├── strava_workouts.ts
│       ├── circles.ts
│       ├── friends.ts
│       ├── notifications.ts
│       └── index.ts                          # Re-exports all schemas
├── stores/
│   ├── useUserStore.ts
│   ├── useNotificationStore.ts
│   └── usePostStore.ts
├── hooks/
│   ├── useFeed.ts
│   ├── useWorkouts.ts
│   ├── useStrava.ts                          # useStravaStatus, useSyncStrava mutation
│   ├── useNotifications.ts
│   └── useCircle.ts
├── lib/
│   ├── cloudinary.ts
│   ├── strava.ts                             # Low-level Strava API helpers
│   └── utils.ts
└── types/
    ├── strava.types.ts                       # Strava API response types
    └── index.ts                              # All other shared TypeScript types
```

---

## 12. V2 Roadmap (Post-Launch)

- **Challenges** inside Circles (distance/workout competitions with leaderboards)
- **Strava Webhooks** — real-time activity push instead of manual sync
- **RSVP** on Circle Events (Going / Maybe / Not Going)
- **Direct Messaging** between friends
- **Push Notifications** (PWA service worker)
- **Garmin / Apple Health** integration
- **Achievements & Badges** system (milestone rewards)
- **Circle Analytics** for owners (activity stats, member growth charts)
- **Challenges** with leaderboards across circle members
