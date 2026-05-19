'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <span className="text-xl font-bold text-gray-900">Pixelle</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                积分充值
              </Link>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                登录
              </button>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI 全自动短视频引擎
            <span className="block text-4xl md:text-5xl mt-4 text-primary">一句话创作精彩视频</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            只需输入一个主题，Pixelle 就能自动完成文案撰写、AI配图、语音解说、背景音乐和视频合成，让视频创作变得前所未有的简单。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 text-lg bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
            >
              立即开始创作
            </button>
            <Link
              href="/demo"
              className="px-8 py-4 text-lg border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 transition-all"
            >
              查看示例
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            强大的 AI 视频生成能力
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="✍️"
              title="智能文案"
              description="根据主题自动撰写专业视频解说词，无需自己编写脚本"
            />
            <FeatureCard
              icon="🎨"
              title="AI 配图"
              description="每句话都配上精美的 AI 插图，让视频更具视觉冲击力"
            />
            <FeatureCard
              icon="🗣️"
              title="语音解说"
              description="支持多种音色选择，自动合成自然流畅的语音解说"
            />
            <FeatureCard
              icon="🎵"
              title="背景音乐"
              description="智能匹配背景音乐，营造完美视频氛围"
            />
            <FeatureCard
              icon="🎬"
              title="一键合成"
              description="自动拼接所有素材，一键生成完整短视频"
            />
            <FeatureCard
              icon="📱"
              title="多尺寸支持"
              description="支持竖屏、横屏、方形等多种视频尺寸"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            灵活的积分套餐
          </h2>
          <p className="text-gray-600 mb-8">
            按需付费，积分永不过期
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <PricingCard
              name="基础套餐"
              credits={100}
              price={10}
              badge={null}
            />
            <PricingCard
              name="标准套餐"
              credits={500}
              price={45}
              badge="推荐"
            />
            <PricingCard
              name="高级套餐"
              credits={1000}
              price={80}
              badge="超值"
            />
          </div>
          <Link
            href="/pricing"
            className="inline-block mt-8 text-primary hover:underline"
          >
            查看更多套餐 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-white">Pixelle</span>
          </div>
          <p className="text-sm">
            © 2024 Pixelle. AI-powered video creation platform.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              登录 Pixelle
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                登录
              </button>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button className="w-full py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <span>🌐</span> 使用 Google 登录
                </button>
                <button className="w-full py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <span>💻</span> 使用 GitHub 登录
                </button>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              还没有账号？{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ name, credits, price, badge }: { name: string; credits: number; price: number; badge: string | null }) {
  return (
    <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full">
            {badge}
          </span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-lg">¥</span>{price}
      </div>
      <p className="text-sm text-gray-500 mb-4">{credits} 积分</p>
      <Link
        href="/auth/register"
        className="block w-full py-2 text-center text-sm border border-primary text-primary rounded-lg hover:bg-primary/5"
      >
        立即购买
      </Link>
    </div>
  );
}