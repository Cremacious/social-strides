'use server'

import type { Notification, User } from '@/types'

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateNotificationInput {
  recipientId: string
  type:        Notification['type']
  actorId?:    string
  entityId?:   string
  entityType?: string
}

export interface NotificationWithActor extends Notification {
  actor: Pick<User, 'id' | 'username' | 'avatarUrl'> | null
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Returns all notifications for the current user, newest first. */
export async function getNotifications(): Promise<NotificationWithActor[]> {
  throw new Error('Not implemented')
}

export async function markNotificationRead(_notificationId: string): Promise<void> {
  throw new Error('Not implemented')
}

export async function markAllNotificationsRead(): Promise<void> {
  throw new Error('Not implemented')
}

/** Returns the count of unread notifications. Polled every 15 seconds. */
export async function getUnreadCount(): Promise<number> {
  throw new Error('Not implemented')
}

/**
 * Internal — creates a notification as a side effect inside other server actions.
 * Not called directly from the UI.
 */
export async function createNotification(
  _data: CreateNotificationInput,
): Promise<Notification> {
  throw new Error('Not implemented')
}
