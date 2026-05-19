import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@pixelle/db';
import { processAIChat, getBotConfig } from '@pixelle/db';

export async function GET() {
  try {
    const bot = await getBotConfig();
    
    return NextResponse.json({
      bot: bot || {
        name: '小Pixelle',
        welcomeMessage: '你好！有什么可以帮助你的吗？',
      },
    });
  } catch (error) {
    console.error('Chat config error:', error);
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { message, conversationId, visitorId } = body;

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    const result = await processAIChat({
      message,
      userId: session?.user?.id,
      visitorId,
      conversationId,
    });
    
    return NextResponse.json({
      message: result.message,
      conversationId: result.conversationId,
      shouldTransfer: result.shouldTransfer,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}