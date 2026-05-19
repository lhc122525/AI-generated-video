import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  CREDIT_VIEW: 'credit:view',
  CREDIT_ADJUST: 'credit:adjust',
  ORDER_VIEW: 'order:view',
  ORDER_APPROVE: 'order:approve',
  CHAT_VIEW: 'chat:view',
  CHAT_TRANSFER: 'chat:transfer',
  CHAT_MONITOR: 'chat:monitor',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  BOT_CONFIG: 'bot:config',
  BOT_ANALYTICS: 'bot:analytics',
} as const;

export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS),
  OPERATOR: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_APPROVE,
    PERMISSIONS.CREDIT_VIEW,
    PERMISSIONS.CHAT_VIEW,
    PERMISSIONS.CHAT_TRANSFER,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  VIP: [],
  USER: [],
};

export function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes(required);
}

export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  return required.some(p => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: string[], required: string[]): boolean {
  return required.every(p => userPermissions.includes(p));
}

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    const keyBuffer = Buffer.from(key, 'hex');
    return timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

export function isPasswordStrong(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码需要包含小写字母' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码需要包含数字' };
  }
  return { valid: true };
}

import { TransactionType, TaskStatus, OrderStatus, ConversationType, ConversationStatus, SenderType, ContentType } from '@prisma/client';

export const CREDIT_COSTS = {
  image: {
    default: 5,
    flux: 10,
    sdxl: 8,
  },
  video: {
    image_based: 10,
    i2v: 20,
    digital_human: 30,
    action_transfer: 25,
  },
} as const;

export function calculateCredits(templateType: string, options?: { duration?: number }): number {
  const base = CREDIT_COSTS.video[templateType as keyof typeof CREDIT_COSTS.video] || 10;
  
  if (options?.duration) {
    const extraCredits = Math.ceil(options.duration / 30) * 2;
    return base + extraCredits;
  }
  
  return base;
}

export async function getUserCredits(userId: string) {
  const credit = await prisma.userCredit.findUnique({
    where: { userId },
    select: {
      balance: true,
      frozenCredits: true,
      totalPurchased: true,
      totalConsumed: true,
    },
  });
  
  return credit;
}

export async function checkCreditsEnough(userId: string, required: number): Promise<boolean> {
  const credit = await prisma.userCredit.findUnique({
    where: { userId },
  });
  
  return (credit?.balance ?? 0) >= required;
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  taskId?: string
) {
  return prisma.$transaction(async (tx) => {
    const credit = await tx.userCredit.findUnique({
      where: { userId },
    });
    
    if (!credit || credit.balance < amount) {
      throw new Error('积分不足');
    }
    
    await tx.userCredit.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
        totalConsumed: { increment: amount },
      },
    });
    
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.CONSUME,
        amount: -amount,
        balanceAfter: credit.balance - amount,
        description,
        taskId,
      },
    });
    
    return transaction;
  });
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  orderId?: string
) {
  return prisma.$transaction(async (tx) => {
    const credit = await tx.userCredit.findUnique({
      where: { userId },
    });
    
    if (!credit) {
      await tx.userCredit.create({
        data: {
          userId,
          balance: amount,
          frozenCredits: 0,
          totalPurchased: amount,
          totalConsumed: 0,
        },
      });
    } else {
      await tx.userCredit.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalPurchased: { increment: amount },
        },
      });
    }
    
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.PURCHASE,
        amount,
        balanceAfter: (credit?.balance ?? 0) + amount,
        description,
        orderId,
      },
    });
    
    return transaction;
  });
}

export async function refundCredits(
  userId: string,
  taskId: string,
  reason: string = '任务失败'
) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.videoTask.findUnique({
      where: { id: taskId },
    });
    
    if (!task) {
      throw new Error('任务不存在');
    }
    
    if (task.frozenCredits <= 0) {
      return null;
    }
    
    await tx.userCredit.update({
      where: { userId },
      data: {
        frozenCredits: { decrement: task.frozenCredits },
      },
    });
    
    const transaction = await tx.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.REFUND,
        amount: task.frozenCredits,
        balanceAfter: (await tx.userCredit.findUnique({ where: { userId } }))?.balance ?? 0,
        description: `${reason}: ${task.title || taskId}`,
        taskId,
      },
    });
    
    return transaction;
  });
}

export async function createVideoTask(
  userId: string,
  data: {
    title?: string;
    script?: string;
    templateType: string;
    params?: Record<string, unknown>;
  }
) {
  const requiredCredits = calculateCredits(data.templateType);
  
  return prisma.$transaction(async (tx) => {
    const credit = await tx.userCredit.findUnique({
      where: { userId },
    });
    
    if (!credit || credit.balance < requiredCredits) {
      throw new Error(`积分不足，需要 ${requiredCredits} 积分，当前余额 ${credit?.balance ?? 0}`);
    }
    
    await tx.userCredit.update({
      where: { userId },
      data: {
        balance: { decrement: requiredCredits },
        frozenCredits: { increment: requiredCredits },
      },
    });
    
    const task = await tx.videoTask.create({
      data: {
        userId,
        title: data.title,
        script: data.script,
        templateType: data.templateType,
        params: data.params as any,
        creditsCost: requiredCredits,
        frozenCredits: requiredCredits,
        status: TaskStatus.PENDING,
      },
    });
    
    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'CONSUME',
        amount: -requiredCredits,
        balanceAfter: credit.balance - requiredCredits,
        description: `创建任务: ${data.title || data.templateType}`,
        taskId: task.id,
      },
    });
    
    return task;
  });
}

export async function completeVideoTask(
  taskId: string,
  outputUrl: string,
  thumbnailUrl?: string
) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.videoTask.findUnique({
      where: { id: taskId },
    });
    
    if (!task) {
      throw new Error('任务不存在');
    }
    
    await tx.userCredit.update({
      where: { userId: task.userId },
      data: {
        frozenCredits: { decrement: task.frozenCredits },
        totalConsumed: { increment: task.creditsCost },
      },
    });
    
    await tx.videoTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        outputUrl,
        thumbnailUrl,
        completedAt: new Date(),
      },
    });
    
    return task;
  });
}

export async function failVideoTask(taskId: string, errorMessage: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.videoTask.findUnique({
      where: { id: taskId },
    });
    
    if (!task) {
      throw new Error('任务不存在');
    }
    
    if (task.frozenCredits > 0) {
      await tx.userCredit.update({
        where: { userId: task.userId },
        data: {
          balance: { increment: task.frozenCredits },
          frozenCredits: { decrement: task.frozenCredits },
        },
      });
    }
    
    await tx.videoTask.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.FAILED,
        errorMessage,
      },
    });
    
    return task;
  });
}

export async function getUserTasks(userId: string, options?: { status?: TaskStatus; limit?: number }) {
  return prisma.videoTask.findMany({
    where: {
      userId,
      ...(options?.status && { status: options.status }),
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit,
    select: {
      id: true,
      taskNo: true,
      title: true,
      templateType: true,
      status: true,
      creditsCost: true,
      outputUrl: true,
      thumbnailUrl: true,
      createdAt: true,
      completedAt: true,
    },
  });
}

export async function getActivePackages() {
  return prisma.creditPackage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      credits: true,
      price: true,
      description: true,
      badge: true,
    },
  });
}

export async function createOrder(userId: string, packageId: string) {
  const pkg = await prisma.creditPackage.findUnique({
    where: { id: packageId, isActive: true },
  });
  
  if (!pkg) {
    throw new Error('套餐不存在或已下架');
  }
  
  return prisma.order.create({
    data: {
      userId,
      packageId: pkg.id,
      credits: pkg.credits,
      amount: pkg.price,
      status: OrderStatus.PENDING,
    },
    select: {
      id: true,
      orderNo: true,
      credits: true,
      amount: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNo: true,
      credits: true,
      amount: true,
      status: true,
      paidAt: true,
      createdAt: true,
    },
  });
}

export async function approveOrder(orderId: string, adminId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { package: true },
  });
  
  if (!order) {
    throw new Error('订单不存在');
  }
  
  if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAID) {
    throw new Error('订单状态不允许审批');
  }
  
  return prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
        paidAt: new Date(),
      },
    });
    
    const credit = await tx.userCredit.findUnique({
      where: { userId: order.userId },
    });
    
    if (!credit) {
      await tx.userCredit.create({
        data: {
          userId: order.userId,
          balance: order.credits,
          frozenCredits: 0,
          totalPurchased: order.credits,
          totalConsumed: 0,
        },
      });
    } else {
      await tx.userCredit.update({
        where: { userId: order.userId },
        data: {
          balance: { increment: order.credits },
          totalPurchased: { increment: order.credits },
        },
      });
    }
    
    await tx.creditTransaction.create({
      data: {
        userId: order.userId,
        type: 'PURCHASE',
        amount: order.credits,
        balanceAfter: (credit?.balance ?? 0) + order.credits,
        description: `充值: ${order.package.name}`,
        orderId: order.id,
      },
    });
    
    return order;
  });
}

export async function rejectOrder(orderId: string, adminId: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  
  if (!order) {
    throw new Error('订单不存在');
  }
  
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.REJECTED,
      approvedById: adminId,
      approvedAt: new Date(),
      rejectReason: reason,
    },
  });
}

const TRANSFER_KEYWORDS = ['人工', '客服', '转人工', 'help', 'human', 'agent'];

export function shouldTransferToHuman(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return TRANSFER_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

export async function createConversation(userId?: string, visitorId?: string, source?: string) {
  return prisma.conversation.create({
    data: {
      type: ConversationType.BOT,
      status: ConversationStatus.WAITING,
      userId,
      visitorId,
      source,
    },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getConversation(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, image: true },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          senderType: true,
          content: true,
          contentType: true,
          isFromBot: true,
          isRead: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function addMessage(
  conversationId: string,
  senderType: SenderType,
  content: string,
  senderId?: string,
  options?: { contentType?: ContentType; isFromBot?: boolean }
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderType,
      senderId,
      content,
      contentType: options?.contentType ?? ContentType.TEXT,
      isFromBot: options?.isFromBot ?? false,
      isFromHuman: senderType === 'AGENT',
    },
  });
  
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messageCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });
  
  return message;
}

export async function transferToHuman(conversationId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        type: ConversationType.TRANSFER,
        status: ConversationStatus.WAITING,
      },
    });
    
    await tx.message.create({
      data: {
        conversationId,
        senderType: SenderType.SYSTEM,
        content: '您已接入人工客服，请稍候...',
      },
    });
    
    return tx.conversation.findUnique({
      where: { id: conversationId },
    });
  });
}

export async function assignToAgent(conversationId: string, agentId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        assignedToId: agentId,
        type: ConversationType.HUMAN,
        status: ConversationStatus.ACTIVE,
      },
    });
    
    await tx.message.create({
      data: {
        conversationId,
        senderType: SenderType.SYSTEM,
        content: '客服已接入',
      },
    });
    
    return tx.conversation.findUnique({
      where: { id: conversationId },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });
  });
}

export async function closeConversation(conversationId: string, rating?: number, feedback?: string) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: ConversationStatus.CLOSED,
      endedAt: new Date(),
      rating,
      feedback,
    },
  });
}

export async function getOnlineAgents() {
  return prisma.user.findMany({
    where: {
      isCustomerService: true,
      isOnline: true,
    },
    select: {
      id: true,
      name: true,
      image: true,
      lastOnlineAt: true,
    },
  });
}

export async function setAgentOnline(userId: string, online: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isOnline: online,
      lastOnlineAt: online ? new Date() : undefined,
    },
  });
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIChatRequest {
  message: string;
  userId?: string;
  visitorId?: string;
  conversationId?: string;
  conversationHistory?: ChatMessage[];
}

interface AIChatResponse {
  message: string;
  conversationId: string;
  shouldTransfer: boolean;
  intent?: string;
}

const DEFAULT_SYSTEM_PROMPT = `你是一个热情友好的AI客服助手，名为"小Pixelle"。
你的职责是：
1. 解答用户关于Pixelle Video产品的问题
2. 帮助用户了解如何使用我们的服务
3. 当用户要求转人工时，引导他们联系人工客服

请保持友好、专业、有耐心的态度回答用户问题。
如果遇到无法回答的问题，请友好地建议用户转人工客服。`;

export async function processAIChat(request: AIChatRequest): Promise<AIChatResponse> {
  const bot = await prisma.aIBot.findFirst({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });
  
  const systemPrompt = bot?.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const transferKeywords = bot?.transferKeywords || ['人工', '客服', '转人工'];
  
  const shouldTransfer = transferKeywords.some(keyword => 
    request.message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const history = request.conversationHistory || [];
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: request.message },
  ];
  
  let responseMessage = '';
  
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    try {
      const response = await fetch(`${process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 500,
        }),
      });
      
      if (response.ok) {
        const data = await response.json() as { choices?: { message?: { content?: string } }[] };
        responseMessage = data.choices?.[0]?.message?.content || '抱歉，我现在无法回答您的问题。';
      } else {
        responseMessage = '抱歉，服务暂时不可用。请稍后再试或联系人工客服。';
      }
    } catch {
      responseMessage = '抱歉，网络连接出现问题。请稍后再试。';
    }
  } else {
    responseMessage = await generateSimpleResponse(request.message, transferKeywords);
  }
  
  let conversationId = request.conversationId;
  
  if (!conversationId) {
    const conversation = await prisma.conversation.create({
      data: {
        type: 'BOT',
        status: 'WAITING',
        userId: request.userId,
        visitorId: request.visitorId,
        source: 'web',
      },
    });
    conversationId = conversation.id;
  }
  
  await prisma.message.create({
    data: {
      conversationId,
      senderType: SenderType.BOT,
      content: responseMessage,
      contentType: ContentType.TEXT,
      isFromBot: true,
    },
  });
  
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { messageCount: { increment: 1 } },
  });
  
  if (bot) {
    await prisma.aIBot.update({
      where: { id: bot.id },
      data: { totalMessages: { increment: 1 } },
    });
  }
  
  return {
    message: responseMessage,
    conversationId,
    shouldTransfer,
    intent: shouldTransfer ? 'transfer_to_human' : undefined,
  };
}

async function generateSimpleResponse(
  message: string,
  transferKeywords: string[]
): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  const greetings = ['你好', '你好呀', 'hi', 'hello', '嗨', '哈喽'];
  if (greetings.some(g => lowerMessage.includes(g))) {
    return '你好！很高兴为你服务。我是AI客服小Pixelle，有什么可以帮助你的吗？';
  }
  
  const thanks = ['谢谢', '感谢', '多谢', 'thanks'];
  if (thanks.some(t => lowerMessage.includes(t))) {
    return '不客气！很高兴能帮到你。如果还有其他问题，随时问我哦～';
  }
  
  const helpKeywords = ['怎么用', '如何使用', '教程', 'help', 'how'];
  if (helpKeywords.some(k => lowerMessage.includes(k))) {
    return 'Pixelle Video 可以帮助你自动生成短视频！只需输入一个主题，系统会自动：\n1. 撰写视频文案\n2. 生成AI配图\n3. 合成语音解说\n4. 添加背景音乐\n5. 一键合成视频\n\n你只需要一个主题，就能轻松创作！';
  }
  
  if (lowerMessage.includes('价格') || lowerMessage.includes('收费') || lowerMessage.includes('cost')) {
    return '我们的服务按积分收费，不同视频类型消耗不同积分：\n- 配图模式：10积分\n- 图生视频：20积分\n- 数字人口播：30积分\n\n你可以点击积分充值了解具体套餐。';
  }
  
  if (lowerMessage.includes('积分') || lowerMessage.includes('充值')) {
    return '积分可以通过购买套餐充值获得。我们提供多种套餐选择：\n- 基础套餐：100积分\n- 标准套餐：500积分\n- 高级套餐：1000积分\n\n具体价格请查看充值页面。如需帮助，可以输入"人工"联系客服。';
  }
  
  return '感谢你的提问！对于更专业的问题，建议你输入"人工"或"转人工"联系我们的客服团队，他们会为你提供更详细的帮助。';
}

export async function getBotConfig() {
  return prisma.aIBot.findFirst({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
    select: {
      id: true,
      name: true,
      avatar: true,
      welcomeMessage: true,
    },
  });
}

export async function updateBotConfig(
  botId: string,
  data: {
    systemPrompt?: string;
    welcomeMessage?: string;
    transferKeywords?: string[];
  }
) {
  return prisma.aIBot.update({
    where: { id: botId },
    data,
  });
}

export async function createUser(email: string, password?: string, name?: string) {
  const passwordHash = password ? await hashPassword(password) : null;
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      credit: {
        create: {
          balance: 0,
          frozenCredits: 0,
          totalPurchased: 0,
          totalConsumed: 0,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
  
  return user;
}

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
    },
  });
  
  if (!user || !user.passwordHash) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      isCustomerService: true,
    },
  });
}

export async function updateUser(id: string, data: { name?: string; image?: string }) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });
}