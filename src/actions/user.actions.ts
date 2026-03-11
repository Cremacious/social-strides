'use server'

import type { User } from '@/types'

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateUserInput {
  clerkId:  string
  username: string
  email:    string
}

export interface UpdateUserLocationInput {
  city:    string | null
  state:   string | null
  country: string | null
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Creates a new DB user record after Clerk sign-up. */
export async function createUser(_data: CreateUserInput): Promise<User> {
  throw new Error('Not implemented')
}

/** Returns the current Clerk session user and their matching DB record. */
export async function getUserSession(): Promise<{ clerkId: string; user: User }> {
  throw new Error('Not implemented')
}

/** Returns the full profile of the currently authenticated user. */
export async function getUserProfile(): Promise<User> {
  throw new Error('Not implemented')
}

/** Returns the public profile of any user. Respects `profileVisibility`. */
export async function getUserProfileById(_userId: string): Promise<User | null> {
  throw new Error('Not implemented')
}

/** Uploads a new avatar to Cloudinary, saves the URL, and deletes the old image. */
export async function updateUserProfileImage(_formData: FormData): Promise<User> {
  throw new Error('Not implemented')
}

export async function updateUsername(_username: string): Promise<User> {
  throw new Error('Not implemented')
}

export async function updateBio(_bio: string): Promise<User> {
  throw new Error('Not implemented')
}

export async function updateUserLocation(_data: UpdateUserLocationInput): Promise<User> {
  throw new Error('Not implemented')
}

export async function updateProfileVisibility(
  _visibility: 'public' | 'friends_only',
): Promise<User> {
  throw new Error('Not implemented')
}

/** Marks onboardingComplete = true after the user finishes the onboarding form. */
export async function completeOnboarding(): Promise<User> {
  throw new Error('Not implemented')
}

/** Returns the current user's avatarUrl for use in the sidebar / nav. */
export async function getCurrentUserAvatar(): Promise<string | null> {
  throw new Error('Not implemented')
}

/** Permanently deletes the user's account and all associated data. */
export async function deleteAccount(): Promise<void> {
  throw new Error('Not implemented')
}
