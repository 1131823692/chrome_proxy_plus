# Proxy Plus

[![English](https://img.shields.io/badge/lang-English-2ea44f)](README.md)
[![中文](https://img.shields.io/badge/lang-中文-lightgrey)](README.zh-CN.md)

> Language: **English** | [中文](README.zh-CN.md)

A Chrome browser proxy manager extension (Manifest V3) — one-click toggle, zero dependencies.

## Features

- **Click to toggle** — click the extension icon to switch between Fixed Servers and the last non-proxy mode
- **Right-click settings** — open the full proxy configuration page from the page context menu
- **Visual feedback** — the icon badge shows **ON** when a fixed proxy is active
- **Zero dependencies** — vanilla ES6+ JavaScript + CSS, no third-party libraries
- **Persistent** — proxy config is saved automatically and restored after browser restart
- **SOCKS passthrough** — SOCKS4/5 routes all traffic through a single proxy
- **Localized** — ships with Chinese and English; follows the browser language and falls back to English when unmatched

## Usage

| Action | Function |
|--------|----------|
| Click the extension icon | toggle Fixed Servers ↔ last non-proxy mode |
| Right-click page → Proxy Settings | open the proxy configuration page |

## Defaults

| Option | Default |
|--------|---------|
| Host | `127.0.0.1` |
| Port | `7897` |
| Scheme | HTTP |
| Rules | HTTP / HTTPS / FTP (all selected) |

## Install

### Load in developer mode

1. Download or clone this repository
2. Open Chrome and visit `chrome://extensions/`
3. Enable Developer mode (top right)
4. Click "Load unpacked"
5. Select the project root (the folder containing `manifest.json`)

## Project structure

```
chrome_proxy_plus/
├── manifest.json      # Extension config (Manifest V3)
├── background.js      # Service Worker: icon click, context menu, proxy apply
├── popup.html         # Settings page
├── popup.css          # Styles (CSS variables + Flexbox)
├── popup.js           # Settings logic (vanilla ES6+)
├── _locales/          # Localization messages (zh_CN / en)
└── icons/             # Extension icons
```

> Localization strings live in `_locales/zh_CN/messages.json` and `_locales/en/messages.json`.

## Changelog

### v1.3 (current)

- **New: localization** — added `zh_CN` and `en` language packs via Chrome's native `_locales` + `chrome.i18n`; follows the browser language and falls back to English (`default_locale: en`). Manifest uses `__MSG_`; HTML/JS use `chrome.i18n.getMessage`
- **Fix: duplicate proxy apply on icon click** — `onClicked` now only writes storage; `applyProxy` runs once via the `onChanged` listener
- **Fix: no port range validation** — port input is now `type="number"` and validated against 1–65535; invalid values no longer silently fall back to the default
- **Fix: misleading icon state** — the icon tooltip now reflects the real mode (Direct / Auto Detect / System) instead of always showing "System"
- **Fix: icon toggle ignored non-proxy modes** — toggling from Direct/Auto Detect now returns to that mode instead of jumping to Fixed Servers; added `lastNonProxyMode` memory
- **Fix: incomplete SOCKS coverage** — SOCKS4/5 now use `singleProxy` so all traffic goes through the proxy
- **Fix: duplicate context menu error** — `contextMenus.create` is wrapped in `try/catch` to avoid duplicate-id errors on update
- **Improvement: narrower `onChanged` listener** — only proxy-related keys re-apply the proxy

### v1.0

 Initial release: click to toggle, right-click settings, four proxy modes, HTTP/HTTPS/SOCKS4/SOCKS5 schemes

## Tech stack

- **JavaScript** — ES6+ (`const/let`, arrow functions, `async/await`)
- **CSS** — CSS variables, Flexbox
- **Chrome API** — `chrome.proxy`, `chrome.storage`, `chrome.action`, `chrome.contextMenus`
- **Manifest V3** + Service Worker

## License

[MIT](LICENSE)
