import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const conversations = await prisma.conversation_rooms.findMany({
      where: {
        OR: [{ guest_id: userId }, { host_id: userId }],
      },
      include: {
        users_conversation_rooms_guest_idTousers: {
          select: { id: true, display_name: true, profile_photo_url: true },
        },
        users_conversation_rooms_host_idTousers: {
          select: { id: true, display_name: true, profile_photo_url: true },
        },
        accommodations: {
          select: { id: true, name: true },
        },
        reservations: {
          select: { id: true, reservation_number: true, checkin_date: true, checkout_date: true },
        },
      },
      orderBy: { last_message_at: 'desc' },
    });

    // 안읽은 메시지 수 계산
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.messages.count({
          where: {
            room_id: conv.id,
            sender_id: { not: userId },
            is_read: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ error: '대화 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { hostId, accommodationId, reservationId, message } = await request.json();

    if (!hostId || !accommodationId) {
      return NextResponse.json({ error: '필수 정보가 없습니다.' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // 기존 대화방 확인
    let conversation = await prisma.conversation_rooms.findFirst({
      where: {
        guest_id: userId,
        host_id: hostId,
        accommodation_id: accommodationId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation_rooms.create({
        data: {
          guest_id: userId,
          host_id: hostId,
          accommodation_id: accommodationId,
          reservation_id: reservationId || null,
          last_message_preview: message || '',
          last_message_at: new Date(),
        },
      });
    }

    if (message) {
      await prisma.messages.create({
        data: {
          room_id: conversation.id,
          sender_id: userId,
          content: message,
          message_type: 'text',
        },
      });

      await prisma.conversation_rooms.update({
        where: { id: conversation.id },
        data: { last_message_preview: message, last_message_at: new Date() },
      });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Conversation creation error:', error);
    return NextResponse.json({ error: '대화방 생성에 실패했습니다.' }, { status: 500 });
  }
}
