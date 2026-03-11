'use server'

import type { Friendship, User } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends'

export interface PendingFriendRequests {
  sent:     (Friendship & { addressee: Pick<User, 'id' | 'username' | 'avatarUrl'> })[]
  received: (Friendship & { requester: Pick<User, 'id' | 'username' | 'avatarUrl'> })[]
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function sendFriendRequest(_addresseeId: string): Promise<Friendship> {
  throw new Error('Not implemented')
}

export async function acceptFriendRequest(_friendshipId: string): Promise<Friendship> {
  throw new Error('Not implemented')
}

export async function declineFriendRequest(_friendshipId: string): Promise<void> {
  throw new Error('Not implemented')
}

export async function cancelFriendRequest(_friendshipId: string): Promise<void> {
  throw new Error('Not implemented')
}

/** Returns both the sent and received pending friend requests for the current user. */
export async function getPendingFriendRequests(): Promise<PendingFriendRequests> {
  throw new Error('Not implemented')
}

/**
 * Returns all accepted friends for a user.
 * Defaults to the current authenticated user if no userId is provided.
 */
export async function getAllUserFriends(_userId?: string): Promise<User[]> {
  throw new Error('Not implemented')
}

/** Searches users by username or email. Minimum 2 characters. */
export async function searchUsers(_query: string): Promise<User[]> {
  throw new Error('Not implemented')
}

/**
 * Returns the friendship status between the current user and the given user.
 * Powers the Add Friend button state on profile pages.
 */
export async function getFriendshipStatus(_userId: string): Promise<FriendshipStatus> {
  throw new Error('Not implemented')
}
