'use server'

import type { Routine, RoutineStep } from '@/types'

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateRoutineStepInput {
  stepType:         'warmup' | 'exercise'
  order:            number
  name:             string
  description?:     string
  // Warmup
  durationSeconds?: number
  // Exercise
  sets?:            number
  reps?:            number
  restSeconds?:     number
  equipment?:       string
  notes?:           string
}

export interface CreateRoutineInput {
  name:        string
  description?: string
  steps:       CreateRoutineStepInput[]
}

export interface RoutineWithSteps extends Routine {
  steps: RoutineStep[]
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function addRoutineToCircle(
  _circleId: string,
  _data:     CreateRoutineInput,
): Promise<Routine> {
  throw new Error('Not implemented')
}

export async function getCircleRoutines(
  _circleId: string,
): Promise<RoutineWithSteps[]> {
  throw new Error('Not implemented')
}

export async function getRoutineById(
  _routineId: string,
): Promise<RoutineWithSteps | null> {
  throw new Error('Not implemented')
}

export async function deleteRoutine(_routineId: string): Promise<void> {
  throw new Error('Not implemented')
}
