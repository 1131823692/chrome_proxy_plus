// Proxy代理 - 设置页面逻辑（原生 JS）

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── UI 更新 ──────────────────────────────────────────

function updateModeUI() {
    const mode = $('input[name="mode"]:checked')?.value;

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

        if (!host) { alert('请输入代理服务器地址'); return; }
        if (!port) { alert('请输入代理服务器端口'); return; }
        if (checkedRules.length === 0) { alert('请选择代理规则'); return; }

        await chrome.storage.local.set({
            mode,
            scheme: $('input[name="scheme"]:checked').value,
            host,
            port,
            rules: checkedRules.map((el) => el.value).join(','),
        });
    } else {
        await chrome.storage.local.set({ mode });
    }

    // background.js 监听 storage 变化自动应用
    window.close();
}

// ── 初始化 ────────────────────────────────────────────

async function init() {
    const data = await chrome.storage.local.get([
        'mode', 'scheme', 'host', 'port', 'rules',
    ]);

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
