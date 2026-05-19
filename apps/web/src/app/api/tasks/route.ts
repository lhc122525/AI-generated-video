import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createVideoTask, getUserTasks } from '@pixelle/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const tasks = await getUserTasks(session.user.id, { status, limit });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks error:', error);
    return NextResponse.json({ error: '获取任务失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { title, script, templateType, params } = body;

    if (!templateType) {
      return NextResponse.json({ error: '请选择模板类型' }, { status: 400 });
    }

    const task = await createVideoTask(session.user.id, {
      title,
      script,
      templateType,
      params,
    });
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    const message = error instanceof Error ? error.message : '创建任务失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}