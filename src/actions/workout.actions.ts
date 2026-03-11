'use server'

import type {
  Workout,
  NewWorkout,
  Goal,
  NewGoal,
  WorkoutComment,
  WorkoutWithSource,
  GoalWithProgress,
  WorkoutSource,
} from '@/types'

// ─── Input / return types ─────────────────────────────────────────────────────

export interface WorkoutStatPoint {
  date:          string   // ISO date string (YYYY-MM-DD)
  totalWorkouts: number
  totalDistance: number   // km
  totalCalories: number
  totalMinutes:  number
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Inserts a manually logged workout for the current user. */
export async function addWorkout(_data: Omit<NewWorkout, 'userId'>): Promise<Workout> {
  throw new Error('Not implemented')
}

/** Returns all manual workouts for the current user, newest first. */
export async function getWorkouts(): Promise<Workout[]> {
  throw new Error('Not implemented')
}

/** Returns manual + Strava workouts merged and sorted by date descending. */
export async function getAllWorkouts(): Promise<WorkoutWithSource[]> {
  throw new Error('Not implemented')
}

/**
 * Returns a single workout by ID. Checks manual table first, then Strava.
 * `source` determines which table to query.
 */
export async function getWorkoutById(
  _id:     string,
  _source: WorkoutSource,
): Promise<WorkoutWithSource | null> {
  throw new Error('Not implemented')
}

/** Shares an existing workout to a circle by setting its circleId. */
export async function shareWorkoutToCircle(
  _workoutId: string,
  _source:    WorkoutSource,
  _circleId:  string,
): Promise<void> {
  throw new Error('Not implemented')
}

export async function addWorkoutComment(
  _workoutId: string,
  _source:    WorkoutSource,
  _content:   string,
): Promise<WorkoutComment> {
  throw new Error('Not implemented')
}

export async function likeWorkout(
  _workoutId: string,
  _source:    WorkoutSource,
): Promise<void> {
  throw new Error('Not implemented')
}

export async function createGoal(_data: Omit<NewGoal, 'userId'>): Promise<Goal> {
  throw new Error('Not implemented')
}

/**
 * Returns all active goals for the current user with dynamically
 * calculated currentValue and progressPercent.
 */
export async function getGoals(): Promise<GoalWithProgress[]> {
  throw new Error('Not implemented')
}

/**
 * Returns aggregated workout stats (manual + Strava) bucketed by day
 * for use in the workout graph.
 */
export async function getWorkoutStats(
  _range: '30d' | '90d',
): Promise<WorkoutStatPoint[]> {
  throw new Error('Not implemented')
}
