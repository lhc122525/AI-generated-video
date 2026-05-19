import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getActivePackages, createOrder } from '@pixelle/db';

export async function GET() {
  try {
    const packages = await getActivePackages();
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Packages error:', error);
    return NextResponse.json({ error: '获取套餐失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json({ error: '请选择套餐' }, { status: 400 });
    }

    const order = await createOrder(session.user.id, packageId);
    
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}