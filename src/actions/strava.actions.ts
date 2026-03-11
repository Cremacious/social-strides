'use server'

// ─── Return types ─────────────────────────────────────────────────────────────

export interface StravaConnectionStatus {
  connected:   boolean
  lastSynced:  string | null   // ISO timestamp
  athleteName: string | null
}

export interface StravaSyncResult {
  newCount: number
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Returns whether the current user has Strava connected, the last sync
 * timestamp, and their Strava athlete name.
 */
export async function getStravaConnectionStatus(): Promise<StravaConnectionStatus> {
  throw new Error('Not implemented')
}

/** Builds and returns the Strava OAuth authorization URL. */
export async function getStravaAuthUrl(): Promise<string> {
  throw new Error('Not implemented')
}

/**
 * Exchanges a temporary OAuth code for access + refresh tokens.
 * Saves both tokens to the user's DB record.
 */
export async function exchangeCodeForToken(_code: string): Promise<void> {
  throw new Error('Not implemented')
}

/**
 * Uses the stored refresh token to obtain a new access token from Strava.
 * Saves the new tokens and expiry to the DB.
 * Returns the new access token for immediate use.
 */
export async function refreshStravaToken(_userId: string): Promise<string> {
  throw new Error('Not implemented')
}

/**
 * Fetches new activities from Strava since the last sync, deduplicates
 * via the unique (userId, stravaId) constraint, and persists them.
 * Automatically refreshes the access token if expired.
 */
export async function syncStravaWorkouts(): Promise<StravaSyncResult> {
  throw new Error('Not implemented')
}

/**
 * Clears all stored Strava tokens from the user's DB record.
 * Previously imported Strava workouts are retained.
 */
export async function disconnectStrava(): Promise<void> {
  throw new Error('Not implemented')
}
