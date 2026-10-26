# DSH Plugin Hub 提交材料

目标目录：[dsh-plugin.org](https://dsh-plugin.org)（DSH Plugin Hub，人工审核）。提交入口：<https://dsh-plugin.org/zh/submit>，也可在 [dsh-plugin-hub](https://github.com/dshplugin/dsh-plugin-hub/issues/new) 提 issue。

下面第一节是**可直接复制粘贴的提交正文**（`###` 小标题与 Hub 的表单模板一致）；第二节是它的自查结果；第三节是给维护者看的英文摘要。提交前只需确认版本号与链接仍是最新的。

---

## 1. 提交正文（复制这一段）

### 仓库地址

https://github.com/dyguests/dsh-compact-panel-nav

### 一句话价值

把侧边栏顶部「插件 / 自动化任务 / 更多」三行压成一行，并把「新会话」收成品牌行右侧的 28px 图标 —— 一次腾出约 130px 给工作区列表。

### 能力分类

界面与体验

### 安装命令

```
dsh plugin --profile web add dsh-compact-panel-nav
```

### 兼容与运行要求

- DSH 0.2.1-rc.3（桌面端 / macOS，中文界面）验证通过。
- Windows / Linux：只生效「导航行合并」；把「新会话」放进品牌行那一步按设计跳过（那里的品牌行本身是按钮）。
- 纯浏览器端实现：一段样式表 + 一次元素几何测量。不申请权限、不访问网络、不依赖宿主服务或外部接口。

### 许可证

MIT

### 截图 / 演示

- 仓库内：`assets/sidebar-nav.webp`
- 直链：<https://raw.githubusercontent.com/dyguests/dsh-compact-panel-nav/main/assets/sidebar-nav.webp>

### 补充说明

纯客户端 UI 插件：无权限申请、无外部服务、无遥测。

已知限制：

1. 依赖侧边栏导航容器的无障碍名称（中文「全局面板」/ 英文「Global panels」）。上游改文案或使用第三种语言时，插件会自动不生效，而不是把布局弄坏。
2. 导航三格等宽，侧边栏很窄时较长文案（如「自动化任务」）会省略；拉宽侧边栏即完整显示。
3. 收起成 56px 窄栏时不做任何改动：导航保持竖排图标，「新会话」回到原位。

---

## 2. 提交前自查（对照 Hub 的要求）

- [x] 仓库已公开
- [x] 已添加 GitHub topic：`dsh-plugin`（另外还有 `dsh`、`deepseek-harness`、`deepseek`、`plugin`、`sidebar`、`ui`）
- [x] README 包含安装命令（`dsh plugin --profile web add dsh-compact-panel-nav`）
- [x] 插件导出 `apply(ctx)` —— Host 侧 `index.js`，浏览器侧 `client.js` 注册同一个 `apply`
- [x] 仓库根目录包含 `package.json`
- [x] 已发布 npm 包：`dsh-compact-panel-nav`（最新 1.3.2）

## 3. English summary (for maintainers)

A browser-side DeepSeek Harness plugin for the sidebar. It folds the **Plugins / Automations / More** rows into a single 32px row and turns the full-width **New Session** button into a 28×28 icon at the right end of the brand row, returning roughly 130px to the workspace list.

Implementation is CSS-first: the navigation rules key off the nav landmark's accessible name plus a `:has()` guard for the expanded state (the collapsed 56px rail is untouched). The New Session control is the shipped button switched to `position: absolute` with inline geometry, guarded by four structural checks, and released on collapse or disable. No permissions, no network requests, no host service.

Verified on DSH 0.2.1-rc.3 (Desktop, macOS). On Windows/Linux only the row merge applies. MIT.

## 4. Links

- Repository: <https://github.com/dyguests/dsh-compact-panel-nav>
- npm: <https://www.npmjs.com/package/dsh-compact-panel-nav>
- Release: <https://github.com/dyguests/dsh-compact-panel-nav/releases>
- Screenshot: <https://raw.githubusercontent.com/dyguests/dsh-compact-panel-nav/main/assets/sidebar-nav.webp>
