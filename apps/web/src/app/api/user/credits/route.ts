import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCredits } from '@pixelle/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const credit = await getUserCredits(session.user.id);
    
    return NextResponse.json({
      balance: credit?.balance ?? 0,
      frozenCredits: credit?.frozenCredits ?? 0,
      totalPurchased: credit?.totalPurchased ?? 0,
      totalConsumed: credit?.totalConsumed ?? 0,
    });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ error: '获取积分失败' }, { status: 500 });
  }
}