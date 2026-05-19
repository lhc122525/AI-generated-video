import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserOrders } from '@pixelle/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const orders = await getUserOrders(session.user.id);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}