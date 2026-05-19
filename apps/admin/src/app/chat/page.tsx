import { prisma } from '@pixelle/db';
import { ConversationStatus } from '@prisma/client';

export default async function ChatPage() {
  const [activeConversations, onlineAgents, pendingConversations] =
    await Promise.all([
      prisma.conversation.findMany({
        where: { status: ConversationStatus.ACTIVE },
        include: {
          user: { select: { name: true, email: true } },
          assignedTo: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        where: { isCustomerService: true, isOnline: true },
        select: { id: true, name: true, image: true },
      }),
      prisma.conversation.count({
        where: { status: ConversationStatus.WAITING },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">客服系统</h1>
        <p className="text-gray-500 mt-1">管理在线客服和会话</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">在线客服</h3>
          {onlineAgents.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无客服在线</p>
          ) : (
            <div className="space-y-3">
              {onlineAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">
                      {agent.name?.[0] || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {agent.name || '客服'}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      在线
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">会话统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">活跃会话</span>
              <span className="text-xl font-bold text-primary">
                {activeConversations.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">等待接入</span>
              <span className="text-xl font-bold text-amber-600">
                {pendingConversations}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">实时会话</h3>
          {activeConversations.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无进行中的会话</p>
          ) : (
            <div className="space-y-3">
              {activeConversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {conv.user?.name || conv.user?.email || '匿名用户'}
                    </p>
                    <p className="text-xs text-gray-500">
                      客服: {conv.assignedTo?.name || '未分配'}
                    </p>
                  </div>
                  <button className="text-xs text-primary hover:underline">
                    查看
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}