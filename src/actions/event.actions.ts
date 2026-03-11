'use server'

import type { Event, NewEvent } from '@/types'

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createCircleEvent(
  _circleId: string,
  _data:     Omit<NewEvent, 'circleId' | 'creatorId'>,
): Promise<Event> {
  throw new Error('Not implemented')
}

/** Returns all events for a circle, sorted by dateTime ascending. */
export async function getCircleEvents(_circleId: string): Promise<Event[]> {
  throw new Error('Not implemented')
}

export async function getEventById(_eventId: string): Promise<Event | null> {
  throw new Error('Not implemented')
}

export async function updateEvent(
  _eventId: string,
  _data:    Partial<Omit<NewEvent, 'circleId' | 'creatorId'>>,
): Promise<Event> {
  throw new Error('Not implemented')
}

export async function deleteEvent(_eventId: string): Promise<void> {
  throw new Error('Not implemented')
}
