import { prisma } from '@pixelle/db';

export default async function BotPage() {
  const bot = await prisma.aIBot.findFirst({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI 机器人配置</h1>
        <p className="text-gray-500 mt-1">配置智能客服机器人的对话规则</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">基本设置</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                机器人名称
              </label>
              <input
                type="text"
                defaultValue={bot?.name || '小Pixelle'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                欢迎语
              </label>
              <textarea
                defaultValue={bot?.welcomeMessage || '你好！有什么可以帮助你的吗？'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" defaultChecked={bot?.isActive} />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                启用机器人
              </label>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              保存设置
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">转人工关键词</h3>
          <p className="text-sm text-gray-500 mb-4">
            当用户发送包含以下关键词的消息时，将自动转接人工客服
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(bot?.transferKeywords || ['人工', '客服', '转人工']).map(
              (keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {keyword}
                </span>
              )
            )}
          </div>
          <button className="text-sm text-primary hover:underline">
            + 添加关键词
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">知识库</h3>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
            添加知识
          </button>
        </div>
        <KnowledgeBaseList botId={bot?.id} />
      </div>
    </div>
  );
}

async function KnowledgeBaseList({ botId }: { botId?: string }) {
  if (!botId) {
    return <p className="text-gray-500 text-sm">请先保存机器人配置</p>;
  }

  const knowledge = await prisma.knowledgeBase.findMany({
    where: { botId },
    take: 10,
  });

  if (knowledge.length === 0) {
    return <p className="text-gray-500 text-sm">暂无知识库条目</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {knowledge.map((item) => (
        <div key={item.id} className="py-3">
          <p className="text-sm font-medium text-gray-900">
            Q: {item.question}
          </p>
          <p className="text-sm text-gray-500 mt-1">A: {item.answer}</p>
        </div>
      ))}
    </div>
  );
}