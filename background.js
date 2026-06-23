// Proxy代理 - Background Service Worker
// 单击图标切换代理，右键菜单打开设置

// ── 默认配置 ──────────────────────────────────────────

const DEFAULTS = {
    scheme: 'http',
    host: '127.0.0.1',
    port: 7897,
    rules: ['http', 'https', 'ftp'],
    mode: 'system',
};

// 与代理相关的 storage key，用于 onChanged 收窄监听
const PROXY_KEYS = ['mode', 'scheme', 'host', 'port', 'rules'];

// ── 生命周期 ──────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
    // 防止扩展更新时重复 id 报错
   try {
       chrome.contextMenus.create({
           id: 'proxy-settings',
            title: chrome.i18n.getMessage('ctx_menu'),
           contexts: ['all'],
       });
    } catch (e) {
        // 已存在则忽略
    }
    restoreProxy();
});

chrome.runtime.onStartup.addListener(() => {
    restoreProxy();
});

// ── 事件处理 ──────────────────────────────────────────

// 单击图标 → 在「指定代理」与「上次非代理模式」之间切换
chrome.action.onClicked.addListener(async () => {
    const { mode = DEFAULTS.mode, lastNonProxyMode = 'system' } =
        await chrome.storage.local.get(['mode', 'lastNonProxyMode']);

    const newMode = mode === 'fixed_servers' ? lastNonProxyMode : 'fixed_servers';

    // 记住当前非代理模式，供下次切换回退使用
    const patch = { mode: newMode };
    if (mode !== 'fixed_servers') {
        patch.lastNonProxyMode = mode;
    }

    // 只写 storage，由 onChanged 监听统一触发 applyProxy，避免重复调用
    await chrome.storage.local.set(patch);
});

// 右键菜单 → 打开设置页面
chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'proxy-settings') {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    }
});

// 监听 storage 变化（popup 保存 / 图标点击时触发），仅代理相关 key 才重应用
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (PROXY_KEYS.some((k) => k in changes)) {
        restoreProxy();
    }
});

// ── 代理逻辑 ──────────────────────────────────────────

async function restoreProxy() {
    const { mode = DEFAULTS.mode } = await chrome.storage.local.get(['mode']);
    await applyProxy(mode);
}

async function applyProxy(mode) {
    let config;

    if (mode === 'fixed_servers') {
        const data = await chrome.storage.local.get(['scheme', 'host', 'port', 'rules']);

        const scheme = data.scheme || DEFAULTS.scheme;
        const host = data.host || DEFAULTS.host;
        const port = parseInt(data.port, 10) || DEFAULTS.port;
        const rules = data.rules ? data.rules.split(',') : DEFAULTS.rules;

        const server = { scheme, host, port };

        if (scheme === 'socks4' || scheme === 'socks5') {
            // SOCKS 代理走 singleProxy，所有流量统一走代理
            config = {
                mode: 'fixed_servers',
                rules: { singleProxy: server, bypassList: [] },
            };
        } else {
            // HTTP/HTTPS 代理按所选协议分别走
            const proxyRules = { bypassList: [] };
            for (const rule of rules) {
                if (rule === 'http') proxyRules.proxyForHttp = server;
                if (rule === 'https') proxyRules.proxyForHttps = server;
                if (rule === 'ftp') proxyRules.proxyForFtp = server;
            }
            config = { mode: 'fixed_servers', rules: proxyRules };
        }

        await updateIcon(mode);
    } else {
        config = { mode };
        await updateIcon(mode);
    }

    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
}

// ── 图标状态 ──────────────────────────────────────────

const MODE_LABELS = {
    fixed_servers: 'mode_label_fixed_on',
    system: 'mode_system',
    direct: 'mode_direct',
    auto_detect: 'mode_auto',
};

async function updateIcon(mode) {
    const key = MODE_LABELS[mode];
    const label = key ? chrome.i18n.getMessage(key) : mode;
    const proxyActive = mode === 'fixed_servers';

    await chrome.action.setBadgeText({ text: proxyActive ? 'ON' : '' });
    if (proxyActive) {
        await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    }
    await chrome.action.setTitle({ title: chrome.i18n.getMessage('icon_title', [label]) });
}
