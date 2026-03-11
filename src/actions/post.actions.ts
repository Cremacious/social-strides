'use server'

import type { Post, PostWithDetails } from '@/types'

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreatePostInput {
  content:               string
  feeling?:              string
  privacy:               'public' | 'friends_only' | 'only_me'
  imageUrls?:            string[]
  circleId?:             string
  taggedUserIds?:        string[]
  attachedWorkoutId?:    string
  attachedWorkoutSource?: 'manual' | 'strava'
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Creates a new post with optional images, feeling tag, privacy, circle, tagged friends, and attached workout. */
export async function createPost(_data: CreatePostInput): Promise<Post> {
  throw new Error('Not implemented')
}

/**
 * Returns a paginated feed of posts from the current user's friends
 * and all circles they belong to, sorted by recency.
 */
export async function getHomeFeedPosts(_page = 1): Promise<PostWithDetails[]> {
  throw new Error('Not implemented')
}

/** Returns posts for a specific circle. Only accessible to circle members. */
export async function getCirclePosts(
  _circleId: string,
  _page = 1,
): Promise<PostWithDetails[]> {
  throw new Error('Not implemented')
}

/**
 * Returns posts by a specific user for their profile page.
 * Respects the viewer's relationship and the post's privacy setting.
 */
export async function getPostsByUserId(
  _userId: string,
  _page = 1,
): Promise<PostWithDetails[]> {
  throw new Error('Not implemented')
}

/**
 * Returns public posts from users in the same city/state/country as the
 * current user. Used on the Explore page.
 */
export async function getAreaPosts(_page = 1): Promise<PostWithDetails[]> {
  throw new Error('Not implemented')
}

export async function deletePost(_postId: string): Promise<void> {
  throw new Error('Not implemented')
}
