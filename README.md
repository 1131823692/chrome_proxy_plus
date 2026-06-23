# ChromeSimpleProxy

[![English](https://img.shields.io/badge/lang-English-2ea44f)](README.md)
[![中文](https://img.shields.io/badge/lang-中文-lightgrey)](README.zh-CN.md)

> Language: **English** | [中文](README.zh-CN.md)

A Chrome browser proxy manager extension (Manifest V3) — one-click toggle, zero dependencies.

## Features

- **Click to toggle** — click the extension icon to switch between Fixed Servers and the last non-proxy mode
- **Right-click settings** — open the full proxy configuration page from the page context menu
- **Visual feedback** — the icon badge shows **ON** when a fixed proxy is active
- **First-run guidance** — clicking the icon before any proxy is configured opens the settings page instead of blindly enabling a proxy
- **Save feedback** — shows a success message before closing, instead of closing abruptly
- **Zero dependencies** — vanilla ES6+ JavaScript + CSS, no third-party libraries
- **Persistent** — proxy config is saved automatically and restored after browser restart
- **SOCKS passthrough** — SOCKS4/5 routes all traffic through a single proxy
- **Localized** — ships with Chinese and English; follows the browser language and falls back to English when unmatched
- **Mode descriptions** — switching modes in the settings page shows how each mode works, preventing misuse

## Usage

| Action | Function |
|--------|----------|
| Click the extension icon | toggle Fixed Servers ↔ last non-proxy mode |
| Right-click page → ChromeSimpleProxy Settings | open the proxy configuration page |

## Defaults

| Option | Default |
|--------|---------|
| Host | `127.0.0.1` |
| Port | `7897` |
| Scheme | HTTP |
| Rules | HTTP / HTTPS / FTP (all selected) |

## Proxy Modes Explained

| Mode | How it works |
|------|--------------|
| **Force Direct** | Bypasses all proxies and connects directly. The extension's setting takes priority over the system proxy—if a tool like Clash Verge sets a system proxy, Chrome still connects directly. However, TUN mode (virtual NIC) operates at the network layer and cannot be bypassed. |
| **Fixed Servers** | Forwards traffic to the fixed proxy server you specify. Supports HTTP/HTTPS/SOCKS4/SOCKS5 and per-protocol rules. Under SOCKS4/5 all traffic goes through a single proxy. |
| **WPAD/PAC** | Discovers a PAC (Proxy Auto-Config) script on the network via WPAD, then decides per request which proxy to use based on the script's `FindProxyForURL` return value. The extension only passes the mode to the `chrome.proxy` API; discovery and routing are handled by Chrome and require WPAD/PAC to be deployed on the network. |
| **System (Default)** | Follows the operating system's proxy configuration (Windows/macOS system proxy). Ideal when a global proxy is already configured at the OS level. |

## Install

### Load in developer mode

1. Download or clone this repository
2. Open Chrome and visit `chrome://extensions/`
3. Enable Developer mode (top right)
4. Click "Load unpacked"
5. Select the project root (the folder containing `manifest.json`)

## Project structure

```
ChromeSimpleProxy/
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

### v1.4 (current)

- **New: mode descriptions** — the settings page now shows how each mode works when selected; all four modes documented
- **New: first-run guidance** — clicking the icon before any proxy is configured no longer blindly enables one (which could break networking with a default address); it opens the settings page instead. A `configured` flag tracks setup state
- **New: save feedback** — a success message is shown before the page closes, replacing the previous abrupt close
- **Rename: unified brand** — extension name, icon tooltip, context menu, and READMEs unified to ChromeSimpleProxy
- **Rename: mode labels** — "Direct" → "Force Direct", "Auto Detect" → "WPAD/PAC", "System" → "System (Default)", making labels match actual behavior
- **Improvement: UI redesign** — gradient header, 2×2 mode grid, teal color system, input focus glow, save button hover animation
- **Improvement: SOCKS rule coupling** — selecting a SOCKS scheme now hides the irrelevant proxy-rules section to avoid confusion
- **Fix: empty-rules fallback** — under HTTP/HTTPS, if no proxyFor* rule is matched, falls back to singleProxy instead of passing empty rules to Chrome

### v1.3

- **New: localization** — added `zh_CN` and `en` language packs via Chrome's native `_locales` + `chrome.i18n`; follows the browser language and falls back to English (`default_locale: en`). Manifest uses `__MSG_`; HTML/JS use `chrome.i18n.getMessage`
- **Fix: duplicate proxy apply on icon click** — `onClicked` now only writes storage; `applyProxy` runs once via the `onChanged` listener
- **Fix: no port range validation** — port input is now `type="number"` and validated against 1–65535; invalid values no longer silently fall back to the default
- **Fix: misleading icon state** — the icon tooltip now reflects the real mode (Direct / WPAD/PAC / System) instead of always showing "System"
- **Fix: icon toggle ignored non-proxy modes** — toggling from Direct/WPAD-PAC now returns to that mode instead of jumping to Fixed Servers; added `lastNonProxyMode` memory
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
