// Proxy代理 - 设置页面逻辑（原生 JS）

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── 国际化 ────────────────────────────────────────────

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const msg = chrome.i18n.getMessage(el.dataset.i18n);
        if (msg) el.textContent = msg;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const msg = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
        if (msg) el.placeholder = msg;
    });
}

// ── UI 更新 ──────────────────────────────────────────

function updateModeUI() {
    const mode = $('input[name="mode"]:checked')?.value;

    // 更新模式说明
    const descKey = {
        direct: 'mode_desc_direct',
        fixed_servers: 'mode_desc_fixed',
        auto_detect: 'mode_desc_auto',
        system: 'mode_desc_system',
    }[mode];
    $('#mode-desc').textContent = descKey ? chrome.i18n.getMessage(descKey) : '';

    // 清除所有模式按钮高亮
    $$('.mode-btn').forEach((btn) => {
        btn.classList.remove('active', 'accent');
    });

    const proxyConfig = $('.proxy-config');

    if (mode === 'fixed_servers') {
        proxyConfig.classList.add('show');
        $(`[data-mode="fixed_servers"]`).classList.add('accent'); // 橙色
    } else {
        proxyConfig.classList.remove('show');
        const btn = $(`[data-mode="${mode}"]`);
        if (btn) btn.classList.add('active'); // 绿色
    }
}

function updateSchemeUI() {
    $$('.scheme-btn').forEach((btn) => btn.classList.remove('active'));
    const scheme = $('input[name="scheme"]:checked')?.value;
    const btn = $(`[data-scheme="${scheme}"]`);
    if (btn) btn.classList.add('active');

    // SOCKS 协议走 singleProxy，规则区域无关，隐藏并说明
    const rulesField = $('input[name="rules"]')?.closest('.field');
    if (rulesField) {
        const isSocks = scheme === 'socks4' || scheme === 'socks5';
        rulesField.style.display = isSocks ? 'none' : '';
    }
}

function updateRuleUI() {
    $$('.rule-btn').forEach((btn) => {
        const input = btn.querySelector('input');
        btn.classList.toggle('active', input.checked);
    });
}

// ── 事件绑定 ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // 模式切换
    $$('input[name="mode"]').forEach((radio) => {
        radio.addEventListener('change', updateModeUI);
    });

    // 协议切换
    $$('input[name="scheme"]').forEach((radio) => {
        radio.addEventListener('change', updateSchemeUI);
    });

    // 规则切换
    $$('input[name="rules"]').forEach((cb) => {
        cb.addEventListener('change', updateRuleUI);
    });

    // 保存按钮
    $('#btn-save').addEventListener('click', handleSave);

    // 应用本地化文案
    applyI18n();

    // 初始化
    init();
});

// ── 保存 ──────────────────────────────────────────────

async function handleSave() {
    const mode = $('input[name="mode"]:checked')?.value;

    if (mode === 'fixed_servers') {
        const host = $('#host').value.trim();
        const port = $('#port').value.trim();
        const checkedRules = [...$$('input[name="rules"]:checked')];

        if (!host) { alert(chrome.i18n.getMessage('alert_host')); return; }
        if (!port) { alert(chrome.i18n.getMessage('alert_port')); return; }
        const portNum = parseInt(port, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            alert(chrome.i18n.getMessage('alert_port_range'));
            return;
        }
        if (checkedRules.length === 0) { alert(chrome.i18n.getMessage('alert_rules')); return; }

        await chrome.storage.local.set({
            mode,
            configured: true,
            scheme: $('input[name="scheme"]:checked').value,
            host,
            port: portNum,
            rules: checkedRules.map((el) => el.value).join(','),
        });
    } else {
        await chrome.storage.local.set({ mode, configured: true });
    }

    // background.js 监听 storage 变化自动应用
    showSaveSuccess();
}

function showSaveSuccess() {
    const hint = $('.hint');
    hint.classList.remove('first-use');
    hint.classList.add('success');
    hint.textContent = chrome.i18n.getMessage('save_success');
    // 短暂展示后关闭
    setTimeout(() => window.close(), 800);
}

// ── 初始化 ────────────────────────────────────────────

async function init() {
    const data = await chrome.storage.local.get([
        'mode', 'scheme', 'host', 'port', 'rules', 'configured',
    ]);

    // 首次使用：未配置过，显示引导提示
    const hint = $('.hint');
    if (!data.configured) {
        hint.textContent = chrome.i18n.getMessage('hint_first_use');
        hint.classList.add('first-use');
    } else {
        hint.textContent = chrome.i18n.getMessage('hint');
    }

    // 恢复模式
    const mode = data.mode || 'system';
    const modeRadio = $(`input[name="mode"][value="${mode}"]`);
    if (modeRadio) modeRadio.checked = true;

    // 恢复协议
    if (data.scheme) {
        const schemeRadio = $(`input[name="scheme"][value="${data.scheme}"]`);
        if (schemeRadio) schemeRadio.checked = true;
    }

    // 恢复地址和端口
    $('#host').value = data.host || '127.0.0.1';
    $('#port').value = data.port || '7897';

    // 恢复规则
    if (data.rules) {
        // 先清除 HTML 默认全选
        $$('input[name="rules"]').forEach((cb) => { cb.checked = false; });
        data.rules.split(',').forEach((rule) => {
            const cb = $(`input[name="rules"][value="${rule}"]`);
            if (cb) cb.checked = true;
        });
    }

    // 更新所有 UI 状态
    updateModeUI();
    updateSchemeUI();
    updateRuleUI();
}
