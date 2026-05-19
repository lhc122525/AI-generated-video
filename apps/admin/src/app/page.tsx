import { prisma } from '@pixelle/db';

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalCredits,
    pendingOrders,
    activeConversations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userCredit.aggregate({ _sum: { balance: true } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'PAID'] } } }),
    prisma.conversation.count({ where: { status: 'ACTIVE' } }),
  ]);

  const stats = [
    {
      label: '总用户数',
      value: totalUsers.toLocaleString(),
      change: '+12.5%',
      positive: true,
      icon: '👥',
    },
    {
      label: '积分余额',
      value: ((totalCredits._sum.balance || 0) / 10000).toFixed(1) + '万',
      change: '+5.1%',
      positive: true,
      icon: '💰',
    },
    {
      label: '待处理订单',
      value: pendingOrders,
      change: pendingOrders > 0 ? '需处理' : '无待处理',
      positive: pendingOrders === 0,
      icon: '📦',
    },
    {
      label: '活跃会话',
      value: activeConversations,
      change: activeConversations > 0 ? '进行中' : '无进行中',
      positive: activeConversations === 0,
      icon: '💬',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来，这里是系统概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-sm font-medium ${
                  stat.positive ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              href="/admin/orders"
              icon="📋"
              label="审批订单"
              description="处理待审批充值"
            />
            <QuickAction
              href="/admin/chat"
              icon="💬"
              label="会话管理"
              description="查看实时会话"
            />
            <QuickAction
              href="/admin/users"
              icon="👥"
              label="用户管理"
              description="管理用户账号"
            />
            <QuickAction
              href="/admin/bot"
              icon="🤖"
              label="机器人配置"
              description="配置AI客服"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">最新订单</h3>
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </a>
  );
}

async function RecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      package: { select: { name: true } },
    },
  });

  if (orders.length === 0) {
    return <p className="text-gray-500 text-sm">暂无订单</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">
              {order.user.name || order.user.email}
            </p>
            <p className="text-xs text-gray-500">
              {order.package.name} · {order.credits}积分
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: '待支付', className: 'bg-gray-100 text-gray-700' },
    PAID: { label: '待审批', className: 'bg-amber-100 text-amber-700' },
    APPROVED: { label: '已完成', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
  };

  const { label, className } = config[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}