# Proxy代理 Plus

Chrome 浏览器代理管理扩展（Manifest V3）— 一键切换代理，零依赖。

## 功能特点

- **单击切换** — 点击扩展图标，在「指定代理」与「系统设置」之间快速切换
- **右键设置** — 网页右键菜单打开完整代理配置页面
- **视觉反馈** — 图标 Badge 显示 **ON** 表示代理已启用
- **零依赖** — 原生 ES6+ JavaScript + CSS，无第三方库
- **持久化** — 代理配置自动保存，浏览器重启后恢复

## 使用方式

| 操作 | 功能 |
|------|------|
| 单击扩展图标 | 切换「指定代理」↔「系统设置」 |
| 右键网页 → Proxy代理设置 | 打开代理配置页面 |

## 默认配置

| 配置项 | 默认值 |
|--------|--------|
| 代理地址 | `127.0.0.1` |
| 代理端口 | `7897` |
| 代理协议 | HTTP |
| 代理规则 | HTTP / HTTPS / FTP（全选） |

## 安装

### 开发者模式加载

1. 下载或克隆本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目根目录（包含 `manifest.json` 的目录）

## 项目结构

```
chrome_proxy_plus/
├── manifest.json      # 扩展配置（Manifest V3）
├── background.js      # Service Worker：图标点击、右键菜单、代理应用
├── popup.html         # 设置页面
├── popup.css          # 样式（CSS 变量 + Flexbox）
├── popup.js           # 设置逻辑（原生 ES6+）
└── icons/             # 扩展图标
```

## 技术栈

- **JavaScript** — ES6+（`const/let`、箭头函数、`async/await`）
- **CSS** — CSS 变量、Flexbox
- **Chrome API** — `chrome.proxy`、`chrome.storage`、`chrome.action`、`chrome.contextMenus`
- **Manifest V3** + Service Worker

## 许可证

[MIT](LICENSE)
