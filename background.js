// Proxy代理 - Background Service Worker
// 单击图标切换代理，右键菜单打开设置

// ── 默认配置 ──────────────────────────────────────────

const DEFAULTS = {
    scheme: 'http',
    host: '127.0.0.1',
    port: 7897,
    rules: ['http', 'https', 'ftp'],
};

// ── 生命周期 ──────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'proxy-settings',
        title: 'Proxy代理设置',
        contexts: ['all'],
    });
    restoreProxy();
});

chrome.runtime.onStartup.addListener(() => {
    restoreProxy();
});

// ── 事件处理 ──────────────────────────────────────────

// 单击图标 → 切换 指定代理 / 系统设置
chrome.action.onClicked.addListener(async () => {
    const { mode = 'system' } = await chrome.storage.local.get(['mode']);

    const newMode = mode === 'fixed_servers' ? 'system' : 'fixed_servers';
    await chrome.storage.local.set({ mode: newMode });
    await applyProxy(newMode);
});

// 右键菜单 → 打开设置页面
chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'proxy-settings') {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
    }
});

// 监听 storage 变化（popup 保存设置时触发）
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        restoreProxy();
    }
});

// ── 代理逻辑 ──────────────────────────────────────────

async function restoreProxy() {
    const { mode = 'system' } = await chrome.storage.local.get(['mode']);
    await applyProxy(mode);
}

async function applyProxy(mode) {
    let config;

    if (mode === 'fixed_servers') {
        const data = await chrome.storage.local.get(['scheme', 'host', 'port', 'rules']);

        const scheme = data.scheme || DEFAULTS.scheme;
        const host = data.host || DEFAULTS.host;
        const port = parseInt(data.port) || DEFAULTS.port;
        const rules = data.rules ? data.rules.split(',') : DEFAULTS.rules;

        const server = { scheme, host, port };
        const proxyRules = { bypassList: [] };

        for (const rule of rules) {
            if (rule === 'http') proxyRules.proxyForHttp = server;
            if (rule === 'https') proxyRules.proxyForHttps = server;
            if (rule === 'ftp') proxyRules.proxyForFtp = server;
        }

        config = { mode: 'fixed_servers', rules: proxyRules };
        await updateIcon(true);
    } else {
        config = { mode };
        await updateIcon(false);
    }

    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
}

// ── 图标状态 ──────────────────────────────────────────

async function updateIcon(proxyActive) {
    if (proxyActive) {
        await chrome.action.setBadgeText({ text: 'ON' });
        await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
        await chrome.action.setTitle({ title: 'Proxy代理 - 指定代理已启用 (点击切换)' });
    } else {
        await chrome.action.setBadgeText({ text: '' });
        await chrome.action.setTitle({ title: 'Proxy代理 - 系统设置 (点击切换)' });
    }
}
