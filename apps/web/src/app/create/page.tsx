'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreatePage() {
  const [topic, setTopic] = useState('');
  const [videoStyle, setVideoStyle] = useState('portrait');
  const [voice, setVoice] = useState('female_warm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('请输入视频主题');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          videoStyle,
          voice,
        }),
      });

      if (!response.ok) {
        throw new Error('创建任务失败');
      }

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      setProgress(100);
      alert('视频生成完成！');
    } catch (error) {
      console.error('Generate error:', error);
      alert('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎬 开始创作视频
          </h1>
          <p className="text-lg text-gray-600">
            输入你的创意主题，AI 将为你生成完整的短视频
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频主题
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：介绍人工智能在教育领域的应用"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={4}
                disabled={isGenerating}
              />
              <p className="mt-2 text-sm text-gray-500">
                描述越详细，生成效果越好
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  视频尺寸
                </label>
                <select
                  value={videoStyle}
                  onChange={(e) => setVideoStyle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isGenerating}
                >
                  <option value="portrait">竖屏 (9:16)</option>
                  <option value="landscape">横屏 (16:9)</option>
                  <option value="square">方形 (1:1)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解说音色
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isGenerating}
                >
                  <option value="female_warm">温柔女声</option>
                  <option value="male磁性">磁性男声</option>
                  <option value="female_bright">明亮女声</option>
                  <option value="male_deep">低沉男声</option>
                </select>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">生成进度</span>
                  <span className="text-primary font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  正在生成文案、配图、语音和背景音乐...
                </p>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? '生成中...' : '开始生成视频'}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg">
            <div className="text-3xl mb-2">✍️</div>
            <div className="text-sm font-medium text-gray-900">智能文案</div>
            <div className="text-xs text-gray-500 mt-1">AI 自动撰写</div>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-3xl mb-2">🎨</div>
            <div className="text-sm font-medium text-gray-900">AI 配图</div>
            <div className="text-xs text-gray-500 mt-1">精美插图</div>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-3xl mb-2">🗣️</div>
            <div className="text-sm font-medium text-gray-900">语音解说</div>
            <div className="text-xs text-gray-500 mt-1">自然流畅</div>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-3xl mb-2">🎵</div>
            <div className="text-sm font-medium text-gray-900">背景音乐</div>
            <div className="text-xs text-gray-500 mt-1">智能匹配</div>
          </div>
        </div>
      </div>
    </div>
  );
}