# dsh-compact-panel-nav

A tiny DeepSeek Harness Web UI plugin that puts the sidebar's **Plugins / Automations / More** entries on one compact row instead of three stacked rows — about **80px** of vertical space goes back to the workspace list.

纯 CSS 的 DeepSeek Harness 客户端插件：把侧边栏的「插件 / 自动化任务 / 更多」三行合并成一行，给下面的工作区列表腾出约 80px 高度。

---

## What it does / 它做了什么

- Wide (expanded) sidebar: the three panel rows become a single row of three equal cells, 32px tall, icon + label centered.
- Collapsed 56px rail: untouched — it keeps the original vertical icon stack.
- Everything else stays as shipped: the brand row, the New Session button, row order, hover/active states, focus rings, keyboard access, and the More menu.

- 展开态：三行合成一行，三等分、32px 高、图标与文字居中。
- 收起态（56px 图标栏）：完全不动，保持原来的竖排图标。
- 其余一律不动：品牌行、新会话按钮、顺序、hover/选中态、焦点样式、键盘可达性、More 菜单。

## How it works / 实现方式

CSS only. No DOM is moved, marked, or restyled beyond the nav container and its three rows.

The rule targets the navigation landmark by its accessible name, which the sidebar derives from its own `panels.label` dictionary — `全局面板` in the shipped Chinese locale, `Global panels` in English. A `:has()` guard requires an icon + title pair inside a row, which only renders in the expanded sidebar; that is what keeps the collapsed rail on its original layout.

纯 CSS，不搬动、不打标记任何其它节点。

选择器只认导航容器的无障碍名称（侧边栏自己的 `panels.label`：中文「全局面板」、英文「Global panels」）；`:has()` 判断行内是否出现「图标 + 标题」，只有展开态才成立，因此收起态保持原样。

## Install / 安装

This is a profile bundle: a package whose `package.json` declares `dsh.bundle.patch`, with a `./client` module for the browser half.

1. Clone this repository somewhere stable (the profile links the directory — moving or deleting it breaks the plugin).

   ```bash
   git clone https://github.com/dyguests/dsh-compact-panel-nav.git
   ```

2. Install the bundle into the current Harness profile. Ask the Harness agent to install this directory as a bundle — the plugin manager call is `install_bundle` with the cloned directory as its target:

   ```
   plugin_manager  action=install_bundle  target=/absolute/path/to/dsh-compact-panel-nav
   ```

   It installs the package, selects the bundle in the profile and activates it; the profile then references the directory by link.

3. Check **Settings → Plugins** for the bundle — title *Compact Sidebar Nav* / 侧边栏导航压缩. The row applies immediately; if the sidebar does not change, reload the page once (`Cmd+R`).

这是一个 profile bundle（`package.json` 里声明 `dsh.bundle.patch`，浏览器侧由 `./client` 模块提供）。clone 到固定位置后用插件管理器以「目录」形式安装即可；profile 是通过 link 引用这个目录的，别删它。装完即时生效，不生效就刷新一次页面。

## Compatibility and known limits / 兼容性与已知限制

- Verified on DeepSeek Harness **0.2.1-rc.3** (Desktop, macOS), Chinese UI.
- Depends on the accessible name of the panel nav (`全局面板` / `Global panels`). A future release that renames that label, or a third UI language, makes the plugin a no-op instead of breaking the layout.
- Cells are equal thirds, so on a very narrow sidebar a long label (e.g. 自动化任务) ellipsizes. Widen the sidebar to see it in full.
- Values use theme tokens (`--dsw-radius-*`, `--dsw-alias-*`), so light and dark themes both follow the host.

- 在 DeepSeek Harness **0.2.1-rc.3**（桌面端 / macOS、中文界面）上验证。
- 依赖导航容器的无障碍名称；将来改文案或换成第三种语言时，插件会「不生效」而不是把布局弄坏。
- 三等分单元格：侧边栏很窄时较长文案（如「自动化任务」）会省略；拉宽即可完整显示。
- 配色走主题变量，深/浅色模式都跟随宿主。

## Uninstall / 卸载

Disable or remove the bundle from the plugin list; the stylesheet is removed with it and the sidebar returns to three stacked rows.

在插件列表里停用或移除即可，样式表随之移除，侧边栏恢复三行。

## Version history / 版本

- **1.2.0** — Reverted an experiment that tried to move the New Session button into the brand row by measuring the DOM and writing inline styles; it squeezed the brand row to zero width. Back to CSS-only, plus a one-time cleanup of that experiment's leftovers.
- **1.0.0** — First release: the three panel rows become one row.

- **1.2.0** — 撤回「把新会话移进品牌行」的实验（它靠量测 DOM + 写内联样式实现，结果把品牌行挤成 0 宽）。回到纯 CSS，并附带一次性清理该实验的残留。
- **1.0.0** — 首个版本：三行合并为一行。

## License

MIT — see [LICENSE](LICENSE).
