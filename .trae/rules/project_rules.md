# Pixelle Center 项目规范

## 组件化原则

### 核心要求
- 页面中重复出现的UI元素必须提取为独立组件
- 组件应遵循单一职责原则，每个组件只负责一个功能
- 组件应具备良好的可复用性和可维护性

### 实践指南
- 将页面中的按钮、表单、卡片、列表等通用元素提取到 `components/ui/` 目录
- 业务相关的复杂组件应放在 `components/` 根目录或对应的功能模块下
- 组件应使用 PascalCase 命名（如 `UserCard.tsx`）
- 组件文件应包含相应的 TypeScript 类型定义
- 优先使用函数式组件和 React Hooks

### 组件结构示例
```
components/
├── ui/              # 基础UI组件
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── UserCard.tsx     # 业务组件
└── OrderList.tsx
```

## 性能优化原则

### 前端性能
- 使用 React.memo 避免不必要的重渲染
- 合理使用 useMemo 和 useCallback 优化计算和回调
- 实现列表渲染时使用虚拟列表（如 react-window）处理大数据量
- 图片使用 next/image 组件实现自动优化和懒加载
- 避免在 JSX 中内联定义函数和对象
- 使用动态导入（next/dynamic）实现路由级代码分割
- 控制组件颗粒度，避免过度拆分导致过多的组件层级

### 数据获取优化
- API 请求使用 SWR 或 React Query 进行缓存和状态管理
- 避免不必要的重复请求，合理设置缓存策略
- 使用服务端组件（Server Components）减少客户端 JavaScript 体积

### 样式性能
- 避免使用内联样式，优先使用 Tailwind CSS 工具类
- 避免使用 CSS-in-JS 的运行时开销，优先选择静态样式方案
- 合理使用 Tailwind 的 JIT 模式，只生成使用的样式

## 类型安全原则

### TypeScript 类型声明
- 所有函数参数、返回值必须声明明确的类型
- 禁止使用 `any` 类型，必须使用具体的类型定义
- 使用 `unknown` 替代 `any` 进行类型安全的多态处理
- 接口和类型别名命名使用 PascalCase

### 类型定义规范
```typescript
// 推荐：明确的接口定义
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// 推荐：使用类型守卫或类型断言
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

// 禁止：使用 any
// function processData(data: any) { ... }  ❌

// 推荐：使用 unknown
function processData(data: unknown) { ... }  ✅
```

### API 类型定义
- API 响应数据必须定义对应的 TypeScript 接口
- API 请求参数必须定义类型，用于参数验证和类型检查
- 使用 Zod 或其他验证库进行运行时类型验证
- 将类型定义放在 `types/` 目录或组件文件附近

### 状态管理类型
- Redux/Zustand 等状态管理库必须定义完整的状态类型
- Context 必须定义 Provider 和 Consumer 的类型
- 自定义 Hooks 必须声明返回值的类型

### 组件 Props 类型
- 所有组件的 Props 必须使用 interface 或 type 定义
- 必选属性不要使用可选链，除非业务逻辑明确允许
- 使用索引签名时需谨慎，确保类型安全
- 合理使用泛型约束，提高组件的通用性和类型安全性

## 通用开发规范

### 代码质量
- 遵循 ESLint 和 Prettier 的代码规范
- 保持代码简洁，避免重复代码（DRY 原则）
- 函数应保持简短，单个函数不超过 50 行
- 合理拆分大型模块和组件

### 命名规范
- 变量和函数使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 类名和接口名使用 PascalCase
- 文件名与导出内容保持一致
