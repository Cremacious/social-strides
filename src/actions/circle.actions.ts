'use server'

import type {
  Circle,
  NewCircle,
  CircleMember,
  CircleWithMembership,
  User,
} from '@/types'

// ─── Input types ─────────────────────────────────────────────────────────────

export interface UpdateCircleInput {
  name?:          string
  description?:   string
  visibility?:    'public' | 'private'
  category?:      string
  coverImageUrl?: string
}

export interface UpdateCircleMemberInput {
  role: 'moderator' | 'member'
}

export interface RecentCircleHighlight {
  type:      'event' | 'poll' | 'member'
  circleId:  string
  circleName: string
  entityId:  string
  summary:   string
  createdAt: string
}

export interface RecommendedCircle extends CircleWithMembership {
  mutualFriendCount: number
  mutualFriends:     Pick<User, 'id' | 'username' | 'avatarUrl'>[]
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createCircle(
  _data: Omit<NewCircle, 'ownerId'>,
): Promise<Circle> {
  throw new Error('Not implemented')
}

export async function getCircleById(
  _circleId: string,
): Promise<CircleWithMembership | null> {
  throw new Error('Not implemented')
}

/** Returns all circles the current user is an active member of. */
export async function getCirclesForUser(): Promise<CircleWithMembership[]> {
  throw new Error('Not implemented')
}

/** Returns all public circles, optionally filtered by category or search term. */
export async function getAllPublicCircles(opts?: {
  category?: string
  query?:    string
}): Promise<CircleWithMembership[]> {
  throw new Error('Not implemented')
}

export async function searchCircles(_query: string): Promise<CircleWithMembership[]> {
  throw new Error('Not implemented')
}

/**
 * Joins a public circle immediately, or sends a pending request for private circles.
 */
export async function joinCircle(_circleId: string): Promise<CircleMember> {
  throw new Error('Not implemented')
}

export async function leaveCircle(_circleId: string): Promise<void> {
  throw new Error('Not implemented')
}

/** Approves a pending circle membership request. Owner/moderator only. */
export async function approveCircleRequest(_memberId: string): Promise<CircleMember> {
  throw new Error('Not implemented')
}

/** Rejects and removes a pending circle membership request. Owner/moderator only. */
export async function rejectCircleRequest(_memberId: string): Promise<void> {
  throw new Error('Not implemented')
}

/** Returns all pending membership requests for a circle. Owner/moderator only. */
export async function getPendingCircleRequests(
  _circleId: string,
): Promise<(CircleMember & { user: Pick<User, 'id' | 'username' | 'avatarUrl'> })[]> {
  throw new Error('Not implemented')
}

export async function updateCircleDetails(
  _circleId: string,
  _data:     UpdateCircleInput,
): Promise<Circle> {
  throw new Error('Not implemented')
}

export async function getCircleMembers(
  _circleId: string,
): Promise<(CircleMember & { user: Pick<User, 'id' | 'username' | 'avatarUrl'> })[]> {
  throw new Error('Not implemented')
}

/** Updates a member's role (promote to moderator or demote to member). Owner only. */
export async function updateCircleMember(
  _memberId: string,
  _data:     UpdateCircleMemberInput,
): Promise<CircleMember> {
  throw new Error('Not implemented')
}

/** Permanently deletes a circle and all its content. Owner only. */
export async function deleteCircle(_circleId: string): Promise<void> {
  throw new Error('Not implemented')
}

/**
 * Returns public circles that the current user's friends are already in,
 * ranked by number of mutual friends.
 */
export async function getRecommendedCircles(): Promise<RecommendedCircle[]> {
  throw new Error('Not implemented')
}

/** Returns the last 10 notable activity items (events, polls, new members) across the user's circles. */
export async function getRecentCircleHighlights(): Promise<RecentCircleHighlight[]> {
  throw new Error('Not implemented')
}
