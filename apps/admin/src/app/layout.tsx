import { Suspense } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-64">
        <AdminHeader />
        <div className="p-6">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function AdminSidebar() {
  const navItems = [
    { href: '/admin', icon: '📊', label: '仪表盘' },
    { href: '/admin/users', icon: '👥', label: '用户管理' },
    { href: '/admin/credits', icon: '💰', label: '积分管理' },
    { href: '/admin/orders', icon: '📦', label: '订单管理' },
    { href: '/admin/chat', icon: '💬', label: '客服系统' },
    { href: '/admin/bot', icon: '🤖', label: 'AI 机器人' },
    { href: '/admin/settings', icon: '⚙️', label: '系统设置' },
  ];

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 z-50">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Pixelle Admin</h1>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="text-sm text-gray-500">管理后台</div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <span className="text-gray-500">🔔</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <span className="text-sm text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}