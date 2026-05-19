import { prisma } from '@pixelle/db';
import { OrderStatus } from '@prisma/client';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      package: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-500 mt-1">管理用户充值订单</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                套餐
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                积分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-500">
                  {order.orderNo.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.user.name || order.user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.package.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.credits}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ¥{order.amount}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4">
                  {order.status === OrderStatus.PAID && (
                    <div className="flex gap-2">
                      <form action={`/api/admin/orders/${order.id}/approve`} method="POST">
                        <button className="text-xs text-green-600 hover:underline">
                          审批通过
                        </button>
                      </form>
                      <button className="text-xs text-red-600 hover:underline">
                        拒绝
                      </button>
                    </div>
                  )}
                  {order.status === OrderStatus.PENDING && (
                    <span className="text-xs text-gray-400">等待支付</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: { label: '待支付', className: 'bg-gray-100 text-gray-700' },
    PAID: { label: '待审批', className: 'bg-amber-100 text-amber-700' },
    APPROVED: { label: '已完成', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
    CANCELLED: { label: '已取消', className: 'bg-gray-100 text-gray-500' },
  };

  const { label, className } = config[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}