# DSH Plugin Hub 提交资料

提交位置：<https://github.com/dshplugin/dsh-plugin-hub/issues/new>（格式参照 [issue #448](https://github.com/dshplugin/dsh-plugin-hub/issues/448) `/ dsh-sketch`）

下面「标题」与「正文」两段可直接复制。提交前确认版本号与链接仍是最新的即可。

---

## 标题（复制这一行）

```
[插件提交] dyguests/dsh-compact-panel-nav — 侧边栏三行导航压成一行，「新会话」收进品牌行
```

## 正文（复制这一段）

### 仓库地址

<https://github.com/dyguests/dsh-compact-panel-nav>

### 一句话价值

把侧边栏顶部「插件 / 自动化任务 / 更多」三行压成一行，并把「新会话」收成品牌行右侧的 28px 图标 —— 一次腾出约 130px 给工作区列表。

### 能力分类

界面与体验

### 安装命令

```
dsh plugin --profile web add dsh-compact-panel-nav
```

### 兼容与运行要求

dsh >= 0.2.1-rc.3（package.json 里 `engines.dsh` 为 `>=0.2.1-rc.3 <0.3.0`），已在 0.2.1-rc.3 实测装载与使用。
macOS 桌面端全部生效；Windows / Linux 只生效「导航行合并」，把「新会话」放进品牌行那一步按设计跳过（那里的品牌行本身是按钮）。
纯前端插件，不依赖外部服务或 API key，不申请权限。

### 许可证

MIT

### 截图 / 演示

- 效果（品牌行右侧 ⊕ 新会话 + 一行导航）：https://github.com/dyguests/dsh-compact-panel-nav/blob/main/assets/sidebar-nav.webp

### 补充说明

- 纯客户端交付：一段样式表，外加对「新会话」按钮做一次几何测量；不注册宿主端点、不开 HTTP 路由、不需要额外权限。
- 导航行的选择器只认侧边栏自己的 `panels.label` 无障碍名称（中文「全局面板」/ 英文「Global panels」），再用 `:has()` 判断是否展开态 —— 收起成 56px 窄栏时完全不动。
- 「新会话」不搬家：按钮仍在原位置，只是改成绝对定位、几何值内联；四条结构校验（展开态 / 是导航前一个兄弟 / 上方是不含 button 的拖拽条 / 按钮内有图标）任一失败就原样保留，收起侧边栏或停用插件会还原内联样式。
- 已知限制：依赖上述无障碍名称（上游改文案或使用第三种语言时插件自动不生效，而不是把布局弄坏）；导航三格等宽，侧边栏很窄时较长文案（如「自动化任务」）会省略。
- 1.1.0 曾用「测量宽度 + 给品牌行加 padding」实现同一效果，结果把品牌行挤成 0 宽；1.2.0 已撤回并加了清理逻辑，相关经过写在 README 的版本记录里。

### 提交前自查

- [x] 仓库已公开
- [x] 已添加 GitHub topic：dsh-plugin
- [x] README 包含安装命令
- [x] 插件导出 apply(ctx) 模块
- [x] 仓库根目录包含 package.json

---

## 提交后

- 审核是人工的，一般在 1–2 天内；有需要补充的会直接在 issue 里问。
- 收录后会自动生成条目并定期刷新，无需再手动同步。
- 若审核同学要看英文说明，可直接引用下面这段。

## English summary (for reviewers)

A browser-side DeepSeek Harness plugin for the sidebar. It folds the **Plugins / Automations / More** rows into a single 32px row and turns the full-width **New Session** button into a 28×28 icon at the right end of the brand row, returning roughly 130px to the workspace list.

CSS-first: the navigation rules key off the nav landmark's accessible name plus a `:has()` guard for the expanded state, so the collapsed 56px rail is untouched. The New Session control is the shipped button switched to `position: absolute` with inline geometry, guarded by four structural checks and released on collapse or disable. No permissions, no network requests, no host service.

`engines.dsh` is `>=0.2.1-rc.3 <0.3.0`; verified on 0.2.1-rc.3 Desktop (macOS). On Windows/Linux only the row merge applies. MIT.

## Links

- Repository: <https://github.com/dyguests/dsh-compact-panel-nav>
- npm: <https://www.npmjs.com/package/dsh-compact-panel-nav>
- Releases: <https://github.com/dyguests/dsh-compact-panel-nav/releases>
- Screenshot: <https://github.com/dyguests/dsh-compact-panel-nav/blob/main/assets/sidebar-nav.webp>
