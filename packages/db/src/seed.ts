import { prisma } from '../client';

const defaultPackages = [
  {
    name: '基础套餐',
    credits: 100,
    price: 10,
    description: '适合尝鲜用户',
    badge: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    name: '标准套餐',
    credits: 500,
    price: 45,
    description: '性价比之选',
    badge: '推荐',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: '高级套餐',
    credits: 1000,
    price: 80,
    description: '适合长期用户',
    badge: '超值',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: '旗舰套餐',
    credits: 3000,
    price: 200,
    description: '适合专业创作者',
    badge: null,
    sortOrder: 4,
    isActive: true,
  },
];

const defaultBot = {
  name: '小Pixelle',
  systemPrompt: `你是一个热情友好的AI客服助手，名为"小Pixelle"。
你的职责是：
1. 解答用户关于Pixelle Video产品的问题
2. 帮助用户了解如何使用我们的服务
3. 当用户要求转人工时，引导他们联系人工客服

请保持友好、专业、有耐心的态度回答用户问题。
如果遇到无法回答的问题，请友好地建议用户转人工客服。`,
  welcomeMessage: '你好！很高兴为你服务。我是AI客服小Pixelle，有什么可以帮助你的吗？',
  transferKeywords: ['人工', '客服', '转人工', 'help', 'human', 'agent'],
  isActive: true,
  priority: 0,
};

export async function seed() {
  console.log('🌱 Seeding database...');

  for (const pkg of defaultPackages) {
    await prisma.creditPackage.upsert({
      where: { id: pkg.name },
      update: pkg,
      create: {
        id: pkg.name,
        ...pkg,
      },
    });
  }
  console.log('✅ Credit packages seeded');

  const existingBot = await prisma.aIBot.findFirst();
  if (!existingBot) {
    await prisma.aIBot.create({ data: defaultBot });
    console.log('✅ AI bot seeded');
  }

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });