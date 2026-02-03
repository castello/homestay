import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { conversationId, content, messageType = 'text' } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: '필수 정보가 없습니다.' }, { status: 400 });
    }

    const conversation = await prisma.conversation_rooms.findFirst({
      where: {
        id: conversationId,
        OR: [
          { guest_id: parseInt(session.user.id) },
          { host_id: parseInt(session.user.id) },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: '대화방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const message = await prisma.messages.create({
      data: {
        room_id: conversationId,
        sender_id: parseInt(session.user.id),
        content,
        message_type: messageType,
      },
    });

    await prisma.conversation_rooms.update({
      where: { id: conversationId },
      data: {
        last_message_preview: content,
        last_message_at: new Date(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: '메시지 전송에 실패했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId가 필요합니다.' }, { status: 400 });
    }

    const conversation = await prisma.conversation_rooms.findFirst({
      where: {
        id: parseInt(conversationId),
        OR: [
          { guest_id: parseInt(session.user.id) },
          { host_id: parseInt(session.user.id) },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: '대화방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const messages = await prisma.messages.findMany({
      where: { room_id: parseInt(conversationId) },
      include: {
        users: { select: { id: true, display_name: true, profile_photo_url: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 읽음 처리
    await prisma.messages.updateMany({
      where: {
        room_id: parseInt(conversationId),
        sender_id: { not: parseInt(session.user.id) },
        is_read: false,
      },
      data: { is_read: true, read_at: new Date() },
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ error: '메시지를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
