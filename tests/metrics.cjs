// Run with: node tests/metrics.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { Highcharts: { setOptions() {} }, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync('style/main.js', 'utf8'), context);
const summary = context.extractKPISummary;
const day = 86400000;
const tx = Array.from({ length: 121 }, (_, i) => [Date.UTC(2026, 0, 1) + i * day, 100, 110, 90, 100 + i, i === 120 ? 200 : 100]);
const chips = tx.map((row, i) => [row[0], 0, 10, 0, i - 100]);
const result = summary(tx, chips, []);
assert.equal(result.spotAmountYi, '10.00');
const unitChips = chips.map(row => [...row]);
unitChips[119][2] = -767.43;
unitChips[120][2] = -795.40;
const unitSummary = summary(tx, unitChips, []);
assert.equal(unitSummary.spotAmountYi, '-795.40');
assert.ok(Math.abs(unitSummary.spotAmountChangeYi - (-27.97)) < 1e-9);
assert.equal(result.volumeRatio, 2);
assert.equal(result.volumeChange, 100);
assert.equal(result.foreignTxLotsChange, 1);
assert.equal(result.mtxTotal, null);
assert.equal(summary(tx.slice(0, 20), chips.slice(0, 20), []).volumeRatio, null);
assert.equal(summary(tx.map(row => [...row.slice(0, 5), 0]), chips, []).volumeRatio, null);
const stale = summary(tx, chips.slice(0, -1), []);
assert.equal(stale.closePrice, tx[119][4]);
const gap = summary(tx, chips.filter((_, i) => i !== 119), []);
assert.equal(gap.foreignTxLotsChange, null);
assert.equal(summary([...tx].reverse(), [...chips].reverse(), []).volumeRatio, 2);
assert.throws(() => summary(tx, [], []), /共同交易日/);
const actual = summary(...['FUT_TX', 'data', 'data_MTX'].map(name => JSON.parse(fs.readFileSync(`web_json/${name}.json`, 'utf8'))));
assert.ok(Number.isFinite(actual.volumeRatio));
console.log('Metrics checks passed:', JSON.stringify(actual));

assert.equal(context.positionBuyShare({ buy: 10, sell: 90 }), 10);
assert.equal(context.positionBuyShare({ buy: 50, sell: 50 }), 50);
assert.equal(context.positionBuyShare({ buy: 0, sell: 0 }), null);
assert.equal(context.positionBuyShare({ buy: -1, sell: 2 }), null);
assert.equal(context.positionBuyShare(null), null);
const detail = JSON.parse(fs.readFileSync('web_json/foreign_positions.json', 'utf8'));
assert.equal(detail.dates['2026-10-16'].TX.buy, 9812);
assert.equal(detail.dates['2026-10-16']['TXO CALL'].sell, 15146);
assert.equal(detail.dates['2026-10-16']['TXO PUT'].buy, 15123);
console.log('Position composition checks passed');
// The marker must coincide with the buy/sell segment boundary.
const marker = { style: {} };
const track = { classList: { toggle() {} }, style: { setProperty() {} }, querySelector: () => marker, setAttribute() {} };
const parts = { '.position-track': track, '.position-buy': {}, '.position-sell': {} };
const row = { dataset: { product: 'TX' }, querySelector: selector => parts[selector] };
context.document.querySelectorAll = () => [row];
context.document.getElementById = () => ({});
context.renderForeignPositions({ TX: { buy: 10, sell: 90 } });
assert.equal(marker.style.left, '10%');
console.log('Buy/sell boundary check passed');

context.renderForeignPositions({ TX: { buy: 90, sell: 10 } });
assert.equal(marker.style.left, '90%');
context.renderForeignPositions({ TX: { buy: 50, sell: 50 } });
assert.equal(marker.style.left, '50%');
context.renderForeignPositions({ TX: { buy: 0, sell: 0 } });
assert.equal(marker.hidden, true);

assert.equal(result.spotAmountChangeYi, 0);
assert.equal(gap.spotAmountChangeYi, null);

// Exercise the loader so chart amounts keep the backend's 100 million TWD units.
(async () => {
    const source = [[tx[120][0], 129.60, -795.40, -2.06, -89748]];
    const payloads = { 'FUT_TX.json': [tx[120]], 'data.json': source, 'data_MTX.json': [] };
    const charts = {};
    context.fetch = async name => ({ ok: true, json: async () => payloads[name] });
    context.document.getElementById = () => null;
    context.renderKPICards = () => {};
    context.loadForeignPositions = async () => {};
    context.setupRangeButtons = () => {};
    context.Highcharts.stockChart = (name, options) => {
        charts[name] = options;
        return { xAxis: [{ dataMax: tx[120][0], setExtremes() {} }] };
    };
    let loadError;
    context.console = { error(...args) { loadError = args; } };
    context.loadDashboardData();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(loadError, undefined);
    const series = charts.container_stock.series;
    for (let index = 1; index <= 3; index++) {
        assert.equal(series[index].data[0][1], source[0][index]);
    }
    console.log('Backend/frontend amount unit contract checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
