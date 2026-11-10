# omni-ui

Omni 系列桌面应用（[OmniZip](https://github.com/VoidDel/OmniZip)、Omni Download）共用的设计系统：设计令牌、内置主题、窗口骨架样式、基础组件与图标。两个产品改一处即同步。

设计规范的叙述性文档仍在 OmniZip 仓库：`docs/04-ui-design.md`（界面与交互）、`docs/05-theming.md`（主题系统）。本仓库是这两份文档的**实现**与唯一真相来源。

## 内容

| 路径 | 内容 |
|---|---|
| `src/styles/tokens.css` | 全部 CSS 变量（颜色、圆角、尺寸、字体栈、密度），首帧为晨光主题 |
| `src/styles/base.css` | 重置、正文默认、工具类、滚动条、动效关键帧 |
| `src/styles/shell.css` | 窗口骨架：侧栏 240 · 标题栏 40 · 命令栏 48 · 状态栏 28，窗口按钮、Linux 边缘拖拽、轻量小窗、独立对话框窗口 |
| `src/styles/components.css` | 按钮、输入、开关、分段控件、标签页、表格行、卡片、设置分组、对话框、右键菜单、提示条、任务卡、拖放 |
| `src/styles/index.css` | 以上四个文件按顺序合一，应用只需引入这一个 |
| `src/components/` | React 组件：`Switch` `Segmented` `Select` `Tabs` `ProgressBar` `Modal` `ContextMenu` `Toasts` `PasswordInput` |
| `src/icons/` | Lucide 风格线性图标（24 网格 / 1.6px），`Icon` `FileIcon` `fileIcon` `badgeStyle` `GitHubMark`，可用 `registerIcons` 追加 |
| `src/theme/` | 主题文件校验与令牌派生（`parseTheme` `resolveTheme`，与 OmniZip 的 Rust 主题服务同一算法）、写入文档（`writeTheme`）、内置主题列表 |
| `themes/builtin/*.json` | 12 套内置主题：晨光（默认浅）、午夜（默认深）、石墨、纸张、北极 ×2、卡布奇诺 ×2、日光 ×2、高对比 ×2 |
| `themes/schema/theme-1.json` | 主题文件的 JSON Schema |
| `scripts/gen-builtin-themes.mjs` | 从色板表重新生成内置主题 JSON |

## 安装

包以源码形式分发（TypeScript + CSS），由应用自己的 Vite 编译，不需要构建步骤。

```jsonc
// apps/desktop/package.json
"dependencies": {
  "omni-ui": "github:VoidDel/omni-ui#main"
}
```

```bash
pnpm install          # 首次
pnpm update omni-ui   # 拉取 omni-ui 的最新提交（锁文件会记下具体 commit）
```

本地同时改两个仓库时，把应用里的依赖临时指向本地目录即可实时生效：

```bash
cd apps/desktop && pnpm link ../../../omni-ui   # 结束后 pnpm unlink omni-ui && pnpm install
```

要求：React 19、Vite 配合 `@vitejs/plugin-react`（它为依赖里的 TSX 启用自动 JSX 运行时）、TypeScript 5.9+ 且 `moduleResolution: "Bundler"`、`resolveJsonModule: true`。

## 使用

```ts
// main.tsx：先样式，后应用自己的 CSS
import 'omni-ui/styles.css';
import './styles/app.css';
```

```tsx
import { Modal, Segmented, Switch, Icon, FileIcon, Toasts } from 'omni-ui';

<Modal title="解压" onClose={close} closeLabel={t('common.close')} footer={<button className="btn primary">解压</button>}>
  <div className="frow">
    <label>解压到</label>
    <input className="inp" />
  </div>
</Modal>
```

组件不依赖任何 i18n 或状态库：需要文案的地方（关闭按钮、显示密码）通过 `closeLabel` / `toggleLabel` 传入；`Toasts` 接收 `toasts` 与 `onDismiss`。每个应用在自己的 `components/ui.tsx` 里包一层，把翻译和 store 接上，业务代码照旧从本地模块导入。

### 主题

```ts
import { builtinThemes, resolveTheme, writeTheme } from 'omni-ui';

const theme = builtinThemes.find((t) => t.id === 'midnight')!;
const resolved = resolveTheme(theme, { accent: 'system', systemAccent: '#0067C0', material: true });
writeTheme(resolved, { platform: 'win', density: 'comfortable', iconStyle: 'duotone', material: true, fontSize: 14 });
```

`writeTheme` 把每个令牌写成根元素上的 CSS 变量，并设置样式表依赖的 `data-appearance` / `data-platform` / `data-density` / `data-icons` / `data-material` / `data-hc`。有 Rust 主题服务的应用（OmniZip）在 Rust 侧解析，前端只调用 `writeTheme`；两边算法相同，`src/theme/resolve.test.ts` 用晨光主题的派生值做了对拍。对比度一轮之后这里暂时领先于 Rust 侧：`fg.muted`、次要文字的 4.5:1 修正、`accent.fg` 的取法和 `-text` 令牌。样式表里都写了回退（`var(--success-text, var(--success))`），Rust 侧补上同样的派生之前，外观与原来一致。

### 令牌

主题文件只需给出 12 个语义色，其余按 OmniZip `docs/05-theming.md` §2.1 派生：

| 必填 | 派生 |
|---|---|
| `bg.canvas` `bg.surface` `bg.elevated` `bg.sidebar` | `bg.subtle / hover / pressed` = 面板色向文字色混合 4% / 7% / 11%；材质开启时 `sidebar-material` / `canvas-material` 为半透明 |
| `fg.primary` `fg.secondary` | `fg.muted` = 55% 透明度起、在每种面板上都达到 4.5:1 的最低透明度，`fg.disabled` = 35%；主、次文字不足 4.5:1 时自动向黑或白修正 |
| `border.default` | `border.subtle` = 与面板色对半混合，`border.strong` = 向文字色混合 25%，`border.focus` = 强调色 |
| `accent` | `accent.hover / pressed` = 向文字色混合 12% / 22%，`accent.subtle` = 14% 透明度，`accent.fg` = 白色达 4.5:1 时用白，否则取黑白中对比更高者 |
| `success` `warning` `danger` `info` | 各自的 `.subtle`（14%，警告 16%） |
| — | 文字用色 `accent-text` `success-text` `warning-text` `danger-text` `info-text` `bt-text`：原色向文字色修正到在每种面板、自身的 `.subtle` 底色和选中行上都达到 4.5:1。原色用于圆点、进度条、按钮底色（3:1 即可），作文字时用 `-text` |
| — | `selection.bg` = 强调色 22%，`folder-color`、`shadow-1/2`、`overlay-scrim` 按明暗固定；`bt`（种子 / 磁力徽章）浅 `#7A5AF8` 深 `#A48BFF` |

非颜色令牌：圆角 4 / 8 / 12，控件高 32，行高 32（紧凑 28 / 宽松 40），标题栏 40，侧栏 240，基准字号 14（12–20 可缩放），字体为系统字体栈，等宽用于路径与快捷键。

### 窗口骨架

```html
<div class="window">
  <aside class="sidebar">
    <div class="sb-top"><img class="logo"><span class="brandname">Omni Download<span class="ver">1.0</span></span></div>
    <nav class="sb-nav"><button class="nav-item" aria-current="true">…</button></nav>
    <div class="sb-bottom">…</div>
  </aside>
  <div class="maincol">
    <header class="titlebar"><div class="tb-side"><div class="ttl"><b>全部任务</b></div></div><div class="searchbox">…</div><div class="tb-side end"><div class="winctl">…</div></div></header>
    <div class="cmdbar"><button class="btn">…</button></div>
    <div class="content">…</div>
    <footer class="statusbar"><div class="lft">…</div><div class="mid">…</div><div class="rgt">…</div></footer>
  </div>
</div>
```

表格列由应用自己指定：`.thead, .trow { grid-template-columns: … }`。

## 家族标志

圆角方形（1024 画布 `rx` 208，渐变 `#4C86F5 → #2556C6`）上一笔白色 2.2px 线条：OmniZip 是 Z 形拉链，Omni Download 是「箭头入托盘」。应用图标本身不在本仓库，每个应用自带。

## 开发

```bash
pnpm install
pnpm check        # tsc + vitest
pnpm themes:gen   # 修改 scripts/gen-builtin-themes.mjs 的色板后重新生成 JSON
```

改动流程：在本仓库修改并推送到 `main` → 各应用 `pnpm update omni-ui` 并提交锁文件。有 Rust 主题服务的应用（OmniZip）另需 `pnpm sync:omni-ui` 把 `themes/` 复制到自己的仓库供 `include_str!` 使用。

破坏性改动（删除或改名类名、组件 props 变化）请打 tag（`v0.x.0`），应用可改为固定到 tag。

## 许可

MIT。北极 / 卡布奇诺 / 日光主题分别基于 Nord、Catppuccin、Solarized 调色板（MIT）。
