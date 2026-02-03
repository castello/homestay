import { prisma } from '@/lib/prisma';

type NotificationType = 'reservation' | 'review' | 'message' | 'system' | 'payment' | 'promotion';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  content?: string;
  referenceType?: string;
  referenceId?: number;
  channels?: ('in_app' | 'email' | 'push')[];
}

export async function createNotification({
  userId,
  type,
  title,
  content,
  referenceType,
  referenceId,
  channels = ['in_app'],
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        type,
        title,
        content: content || null,
        reference_type: referenceType || null,
        reference_id: referenceId || null,
        channel: channels[0] || 'in_app',
      },
    });

    // 이메일 알림
    if (channels.includes('email')) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      // TODO: 이메일 발송 로직
      console.log(`Email notification to ${user?.email}: ${title}`);
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
}

export async function markAsRead(notificationId: number, userId: number) {
  return prisma.notifications.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function markAllAsRead(userId: number) {
  return prisma.notifications.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function getUnreadCount(userId: number) {
  return prisma.notifications.count({
    where: { user_id: userId, is_read: false },
  });
}
