import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConversation, addMessage, closeConversation } from '@pixelle/db';
import { SenderType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 });
    }

    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: '获取会话失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { conversationId, content, action } = body;

    if (action === 'close') {
      const rating = body.rating;
      const feedback = body.feedback;
      const conversation = await closeConversation(conversationId, rating, feedback);
      return NextResponse.json({ conversation });
    }

    if (!conversationId || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const senderType = session?.user ? SenderType.AGENT : SenderType.USER;
    const message = await addMessage(conversationId, senderType, content, session?.user?.id);
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}