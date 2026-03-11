'use server'

import type { Comment, Post } from '@/types'

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function likePost(_postId: string): Promise<void> {
  throw new Error('Not implemented')
}

export async function unlikePost(_postId: string): Promise<void> {
  throw new Error('Not implemented')
}

export async function createComment(
  _postId:  string,
  _content: string,
): Promise<Comment> {
  throw new Error('Not implemented')
}

/** Creates a reply to an existing top-level comment (1-level nesting only). */
export async function replyToComment(
  _commentId: string,
  _content:   string,
): Promise<Comment> {
  throw new Error('Not implemented')
}

export async function deleteComment(_commentId: string): Promise<void> {
  throw new Error('Not implemented')
}

/** Creates a repost of an existing post, linking back via originalPostId. */
export async function sharePost(_postId: string): Promise<Post> {
  throw new Error('Not implemented')
}
