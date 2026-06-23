# ChromeSimpleProxy

[![中文](https://img.shields.io/badge/lang-中文-2ea44f)](README.zh-CN.md)
[![English](https://img.shields.io/badge/lang-English-lightgrey)](README.md)

> 语言：[English](README.md) | **中文**

Chrome 浏览器代理管理扩展（Manifest V3）— 一键切换代理，零依赖。

## 功能特点

- **单击切换** — 点击扩展图标，在「指定代理」与「上次非代理模式」之间快速切换
- **右键设置** — 网页右键菜单打开完整代理配置页面
- **视觉反馈** — 图标 Badge 显示 **ON** 表示代理已启用
- **首次引导** — 未配置代理时点击图标不会盲目开启，而是打开设置页引导填写
- **保存反馈** — 保存后显示成功提示再关闭，操作明确不突兀
- **零依赖** — 原生 ES6+ JavaScript + CSS，无第三方库
- **持久化** — 代理配置自动保存，浏览器重启后恢复
- **SOCKS 全代理** — SOCKS4/5 协议下所有流量统一走代理（singleProxy）
- **多语言** — 内置中文与英文，默认跟随浏览器语言；未命中时回退英文
- **模式说明** — 设置页切换模式时动态显示该模式的工作原理，避免误用

## 使用方式

| 操作 | 功能 |
|------|------|
| 单击扩展图标 | 切换「指定代理」↔「上次非代理模式」 |
| 右键网页 → ChromeSimpleProxy 设置 | 打开代理配置页面 |

## 默认配置

| 配置项 | 默认值 |
|--------|--------|
| 代理地址 | `127.0.0.1` |
| 代理端口 | `7897` |
| 代理协议 | HTTP |
| 代理规则 | HTTP / HTTPS / FTP（全选） |

## 代理模式说明

| 模式 | 工作原理 |
|------|----------|
| **强制直连** | 不经过任何代理，浏览器直接访问目标网站。扩展设置的优先级高于系统代理——若 Clash Verge 等已开启系统代理，Chrome 仍会绕过直连。但如果软件使用 TUN 模式（虚拟网卡）在网络层接管流量，则无法绕过。 |
| **指定代理** | 将流量转发到你填写的固定代理服务器。支持 HTTP/HTTPS/SOCKS4/SOCKS5 协议，可按 HTTP/HTTPS/FTP 分别设置。SOCKS4/5 下所有流量统一走代理（singleProxy）。 |
| **WPAD/PAC** | 通过 WPAD 协议自动发现网络上的 PAC（代理自动配置）脚本，按脚本中 `FindProxyForURL` 的返回值逐请求决定走哪个代理。扩展仅将模式透传给 `chrome.proxy` API，发现与分流逻辑由 Chrome 完成，需网络已部署 WPAD/PAC 服务。 |
| **系统设置(默认)** | 跟随操作系统的代理配置（Windows/macOS 系统代理）。适合已通过系统全局设置代理的情况。 |

## 安装

### 开发者模式加载

1. 下载或克隆本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目根目录（包含 `manifest.json` 的目录）

## 项目结构

```
ChromeSimpleProxy/
├── manifest.json      # 扩展配置（Manifest V3）
├── background.js      # Service Worker：图标点击、右键菜单、代理应用
├── popup.html         # 设置页面
├── popup.css          # 样式（CSS 变量 + Flexbox）
├── popup.js           # 设置逻辑（原生 ES6+）
├── _locales/          # 多语言文案（zh_CN / en）
└── icons/             # 扩展图标
```

> 多语言文案位于 `_locales/zh_CN/messages.json` 与 `_locales/en/messages.json`。

## 更新日志

### v1.4（本版）

- **新增：模式说明** — 设置页切换模式时动态显示该模式的工作原理；四种模式均已补充原理说明
- **新增：首次使用引导** — 未配置代理时点击图标不再盲目开启（避免用默认地址导致断网），而是打开设置页引导填写，`configured` 标志位记录配置状态
- **新增：保存成功提示** — 保存后显示成功反馈再延迟关闭，替代原先的直接关闭
- **改名：统一品牌名** — 扩展名、图标 tooltip、右键菜单、README 统一为 ChromeSimpleProxy
- **改名：模式更名** — 「直接连接」→「强制直连」、「自动检测」→「WPAD/PAC」、「系统设置」→「系统设置(默认)」，名称更贴合实际行为
- **优化：界面重构** — 渐变 header、2×2 模式网格、teal 配色体系、输入框 focus 光晕、保存按钮悬浮动效
- **优化：SOCKS 规则联动** — 选择 SOCKS 协议时隐藏无关的代理规则区域，避免误导
- **修复：空规则兜底** — HTTP/HTTPS 模式下若未命中任何 proxyFor*，回退到 singleProxy，避免传空规则给 Chrome

### v1.3

- **新增：多语言支持** — 内置 `zh_CN` 与 `en` 两套语言包，采用 Chrome 原生 `_locales` + `chrome.i18n` 机制，默认跟随浏览器语言，未命中时回退英文（`default_locale: en`）；manifest 走 `__MSG_`，HTML/JS 走 `chrome.i18n.getMessage`
- **修复：图标点击重复调用代理设置** — `onClicked` 改为只写 storage，由 `onChanged` 监听统一触发 `applyProxy`，消除冗余调用
- **修复：端口无范围校验** — 端口输入框改为 `type="number"`，保存时校验 1–65535，无效值不再静默回退默认端口
- **修复：图标状态误报** — 图标 tooltip 按真实模式（直接连接 / WPAD/PAC / 系统设置）显示，不再统一显示「系统设置」
- **修复：图标切换忽略非代理模式** — 从「直接连接 / WPAD/PAC」点图标会回到该模式，而不是硬跳指定代理；新增 `lastNonProxyMode` 记忆
- **修复：SOCKS 代理流量覆盖不全** — SOCKS4/5 改用 `singleProxy`，所有流量统一走代理
- **修复：右键菜单重复创建报错** — `contextMenus.create` 加 `try/catch`，扩展更新时不再抛 duplicate id
- **优化：`onChanged` 监听收窄** — 仅代理相关 key 变化才重应用代理，避免存储其他数据时误触发

### v1.0

 初版：单击切换代理、右键打开设置、四种代理模式、HTTP/HTTPS/SOCKS4/SOCKS5 协议支持

## 技术栈

- **JavaScript** — ES6+（`const/let`、箭头函数、`async/await`）
- **CSS** — CSS 变量、Flexbox
- **Chrome API** — `chrome.proxy`、`chrome.storage`、`chrome.action`、`chrome.contextMenus`
- **Manifest V3** + Service Worker

## 许可证

[MIT](LICENSE)
