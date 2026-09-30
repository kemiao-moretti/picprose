# PicProse - 更好的封面图片生成工具

[![GitHub stars](https://img.shields.io/github/stars/jaaronkot/picprose)](https://github.com/jaaronkot/picprose/stargazers)
[![License](https://img.shields.io/github/license/jaaronkot/picprose)](https://github.com/jaaronkot/picprose/blob/main/LICENSE)

## 项目简介

PicProse 是一款强大的封面图片生成工具，专为博客作者、内容创作者、开发者和设计师打造。只需几步操作，即可创建专业精美的封面图片，适用于 Medium、YouTube、BiliBili、个人博客等多种平台。

**在线体验：** [picprose.pixpark.net](https://picprose.pixpark.net/)


![PicProse Preview](./doc/demo-1.jpg )

![PicProse Preview](./doc/demo-2.jpg )

![PicProse Preview](./doc/demo-3.jpg )

## ✨ 主要特点

- 🖼️ **丰富的图片资源** - 通过 Unsplash API 直接访问海量高质量图片
- 🎨 **灵活的编辑功能** - 自定义标题、作者信息、字体、颜色和透明度
- 📱 **多种比例支持** - 包含横屏和竖屏多种规格，适应不同平台需求
- 🔍 **实时预览** - 所有修改即时可见，所见即所得
- 🌈 **开发者图标集成** - 内置开发技术相关图标，适合技术文章封面
- 📥 **多格式导出** - 支持 JPG、PNG、SVG 格式导出
- 🇨🇳 **中文界面** - 使用中文界面
- 🎯 **响应式设计** - 完美适配桌面端和移动端

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/jaaronkot/picprose.git

# 进入项目目录
cd picprose

# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 如需完整预览 Unsplash 图片功能，请使用 Cloudflare Pages 本地运行时：
npm run build
npm run preview:pages
```

### 环境变量配置

#### 本地 Next.js 构建

创建 `.env.local` 文件并添加以下内容：

```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=你的GA追踪ID
NEXT_PUBLIC_UMAMI_WEBSITE_ID=你的Umami网站ID
```

Unsplash 密钥不放入 `.env.local`，因为生产环境由 Cloudflare Pages Function 读取。进行本地 Pages 预览时，复制 `.dev.vars.example` 为 `.dev.vars`，填写：

```bash
UNSPLASH_API_KEY=你的Unsplash访问密钥
```

`.dev.vars` 已加入 `.gitignore`，不会提交到仓库。

## 🔧 使用指南

1. **选择图片** - 从左侧面板浏览或搜索图片，点击选择
2. **调整布局** - 选择适合您需求的宽高比
3. **添加元素** - 添加标题、作者信息和图标
4. **自定义样式** - 调整颜色、透明度、字体大小等
5. **导出成品** - 点击底部导出按钮，选择所需格式

## 🧰 技术栈

- **前端框架**: [Next.js](https://nextjs.org/)
- **类型系统**: [TypeScript](https://www.typescriptlang.org/)
- **UI组件**: [NextUI](https://nextui.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图片源**: [Unsplash API](https://unsplash.com/developers)
- **国际化**: [next-intl](https://next-intl-docs.vercel.app/)
- **字体**: [Google Fonts](https://fonts.google.com/) 和本地字体

## 📦 项目结构

```
picprose/
├── app/            # Next.js 应用目录
│   ├── [locale]/   # 中文路由（仅支持 zh）
│   ├── globals.css # 全局样式
├── public/         # 静态资源和 Cloudflare Pages 重定向规则
├── functions/      # Cloudflare Pages Functions（Unsplash API）
├── scripts/        # 部署配置验收脚本
├── types/          # TypeScript 类型定义
├── config/         # 项目配置
├── .github/        # GitHub Actions 工作流
└── README.md       # 项目说明
```

## ☁️ Cloudflare Pages 部署

项目通过 GitHub Actions 构建并使用 Wrangler Direct Upload 部署到 Cloudflare Pages，不使用 Cloudflare Pages 的 Git 集成。

首次部署时，GitHub Actions 会检查 Pages 项目是否存在：不存在时自动创建，存在时复用。项目名由 `CLOUDFLARE_PAGES_PROJECT_NAME` 决定，生产分支固定为 `main`。

也可以手动预创建项目：

```bash
npx wrangler pages project create picprose --production-branch=main
```

然后在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中配置：

**Repository secrets：**

- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID
- `CLOUDFLARE_API_TOKEN`：具备 Account → Cloudflare Pages → Edit 权限的 API Token
- `UNSPLASH_API_KEY`：Unsplash Access Key；工作流会将它安全写入 Cloudflare Pages Runtime Secret

**Repository variables：**

- `CLOUDFLARE_PAGES_PROJECT_NAME`：Cloudflare Pages 项目名，例如 `picprose`
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`：可选，构建时注入的 Google Analytics ID
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`：可选，构建时注入的 Umami 网站 ID

工作流会在部署前执行 `wrangler pages secret put`，把 `UNSPLASH_API_KEY` 写入 Pages 项目的 Production Runtime Secret，供 `functions/api/unsplash.ts` 使用。因此不需要把该密钥写入 `.env.local`、代码或静态构建产物。

如果需要手动更新 Pages Runtime Secret，也可以运行：

```bash
npx wrangler pages secret put UNSPLASH_API_KEY --project-name=picprose
```

推送到 `main` 分支后，`.github/workflows/cloudflare-pages.yml` 会执行：

1. 安装依赖并运行部署配置检查；
2. 构建 `out/` 静态站点；
3. 检查 `out/zh/index.html` 与 `out/_redirects`；
4. 使用 Wrangler 将 `out/` 和 `functions/` 部署到 Pages。

本地预览静态站点和 Pages Function：

```bash
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 填入 UNSPLASH_API_KEY
npm run build
npm run preview:pages
# 另开一个终端执行本地路由和 API 冒烟测试
PAGES_SMOKE_URL=http://127.0.0.1:8788 npm run smoke:pages
```

## 🤝 贡献指南

我们欢迎所有形式的贡献，无论是新功能、错误修复还是文档改进。请参考以下步骤：

1. Fork 仓库
2. 创建新分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](https://github.com/jaaronkot/picprose/blob/main/LICENSE)。

## 🙏 鸣谢

- [Unsplash](https://unsplash.com/) 提供高质量图片
- [Next.js](https://nextjs.org/) 提供强大的前端框架
- [NextUI](https://nextui.org/) 提供精美的UI组件
- 所有开源项目的贡献者们

## 📬 联系我们

如有任何问题或建议，欢迎通过以下方式联系我们：

- GitHub Issues: [提交问题](https://github.com/jaaronkot/picprose/issues)
- Email: your.email@example.com

---

**PicProse** - 让您的封面图片更专业、更吸引人！💪
