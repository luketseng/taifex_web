// Run with: node tests/summary-disclosure.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture(seen = false) {
    const handlers = {};
    const timers = new Map();
    const detail = { setAttribute(key, value) { this[key] = value; } };
    const summary = {
        collapsed: false,
        querySelectorAll: selector => selector === '.summary-detail' ? [detail] : [],
        classList: { toggle(name, value) { summary.collapsed = value; } },
        addEventListener(name, fn) { handlers[`summary:${name}`] = fn; },
        contains: () => false,
        matches: () => false,
    };
    const button = {
        setAttribute(key, value) { this[key] = value; },
        addEventListener(name, fn) { handlers[`button:${name}`] = fn; },
    };
    const chart = { top: 1000, getBoundingClientRect() { return { top: this.top }; } };
    const elements = { market_summary: summary, summary_toggle: button, container_stock: chart };
    const storage = new Map(seen ? [['taifex-summary-introduction-7s', 'done']] : []);
    const context = {
        Highcharts: { setOptions() {} },
        document: {
            hidden: false,
            getElementById: name => elements[name],
            addEventListener(name, fn) { handlers[`document:${name}`] = fn; },
        },
        window: { scrollY: 0, innerHeight: 800, addEventListener(name, fn) { handlers[`window:${name}`] = fn; } },
        sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
        setTimeout(fn, delay) { assert.equal(delay, 3000); timers.set(1, fn); return 1; },
        clearTimeout(id) { timers.delete(id); },
    };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync('style/main.js', 'utf8'), context);
    const controller = context.setupSummaryDisclosure();
    return { context, summary, button, detail, handlers, chart, timers, controller,
        fire() { for (const fn of [...timers.values()]) { timers.clear(); fn(); } } };
}

let f = fixture();
assert.equal(f.summary.collapsed, false);
assert.equal(f.timers.size, 0); // No countdown before data is ready.
f.controller.start();
assert.equal(f.timers.size, 1);
f.fire();
assert.equal(f.summary.collapsed, true);
assert.equal(f.button['aria-expanded'], 'false');
assert.equal(f.button['aria-label'], '展開明細');
assert.equal(f.button.title, '展開明細');
assert.equal(f.detail.inert, true);
f.handlers['button:click']();
assert.equal(f.summary.collapsed, false);
assert.equal(f.detail.inert, false);
f.controller.start();
assert.equal(f.timers.size, 0); // Manual reopening never restarts the countdown.
f.handlers['button:click']();
assert.equal(f.summary.collapsed, true);

for (const event of ['pointerdown', 'pointerenter', 'focusin']) {
    f = fixture(); f.controller.start(); f.handlers[`summary:${event}`](); f.fire();
    assert.equal(f.summary.collapsed, false);
    assert.equal(f.timers.size, 0);
}
f = fixture(); f.handlers['summary:pointerdown'](); f.controller.start();
assert.equal(f.timers.size, 0); // Interaction while data is loading also cancels.
f = fixture(); f.controller.start();
f.context.window.scrollY = 200; f.chart.top = 300; f.handlers['window:scroll'](); f.fire();
assert.equal(f.summary.collapsed, false);
// A refreshed page starts again even if an old session marker exists.
f = fixture(true); f.controller.start(); assert.equal(f.timers.size, 1);
f.fire(); assert.equal(f.summary.collapsed, true);
f = fixture(); f.controller.start(); f.context.document.hidden = true;
f.handlers['document:visibilitychange'](); f.fire(); assert.equal(f.summary.collapsed, false);
console.log('Summary disclosure checks passed');

f = fixture(); f.controller.start();
f.handlers['summary:click']({ target: { closest: selector => selector === '.kpi-card' ? {} : null } });
assert.equal(f.summary.collapsed, true);
f.handlers['summary:click']({ target: { closest: () => ({}) } });
assert.equal(f.summary.collapsed, true); // Embedded disclosures do not toggle the cards.
f.handlers['summary:click']({ target: { closest: selector => selector === '.kpi-card' ? {} : null } });
assert.equal(f.summary.collapsed, false);

// Hover at refresh cancels the automatic countdown.
f = fixture();
f.summary.matches = selector => selector === ':hover';
f.controller.start();
assert.equal(f.timers.size, 0);
assert.equal(f.summary.collapsed, false);

// Entering the summary during countdown also cancels it.
f = fixture(); f.controller.start();
f.handlers['summary:pointerenter']();
f.fire(); assert.equal(f.summary.collapsed, false);
