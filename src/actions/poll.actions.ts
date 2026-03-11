'use server'

import type { Poll, PollOption, PollVote } from '@/types'

// ─── Input / return types ─────────────────────────────────────────────────────

export interface CreatePollInput {
  question:           string
  options:            string[]               // At least 2 required
  resultsVisibility?: 'live' | 'after_close'
  closeDate?:         Date
}

export interface PollWithResults extends Poll {
  options: (PollOption & {
    votes:      PollVote[]
    voteCount:  number
  })[]
  totalVotes:    number
  userVoteId:    string | null   // optionId the current user voted for, or null
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createCirclePoll(
  _circleId: string,
  _data:     CreatePollInput,
): Promise<Poll> {
  throw new Error('Not implemented')
}

/** Returns all polls for a circle with their options. */
export async function getCirclePolls(_circleId: string): Promise<Poll[]> {
  throw new Error('Not implemented')
}

/** Casts a vote for an option. Enforces one vote per user per poll. */
export async function votePoll(
  _pollId:   string,
  _optionId: string,
): Promise<void> {
  throw new Error('Not implemented')
}

/**
 * Returns full poll results including per-option vote counts and
 * the current user's vote. Respects resultsVisibility setting.
 */
export async function getPollResults(_pollId: string): Promise<PollWithResults> {
  throw new Error('Not implemented')
}
