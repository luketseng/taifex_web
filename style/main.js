// TAIFEX Web - Main Visualization & Analytics Controller
// Domain-driven chip analytics and Highcharts dashboard

const groupingUnits = [
    ['day', [1]],
    ['week', [1]],
    ['month', [1, 2, 3, 4, 6]]
];

// Highcharts global theme polish
Highcharts.setOptions({
    lang: {
        rangeSelectorZoom: '',
        months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekdays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
        thousandsSep: ','
    }
});

let stockChartInstance = null;
let mtxChartInstance = null;

const chart1_options = {
    chart: {
        backgroundColor: 'transparent',
        spacing: [15, 10, 15, 10],
        style: {
            fontFamily: '"Source Han Sans TC", "Noto Sans CJK TC", "Noto Sans TC", BiauKai, "DFKai-SB", serif'
        }
    },
    plotOptions: {
        candlestick: {
            color: '#27ae60',       // Falling price (green)
            upColor: '#eb5757',     // Rising price (red)
            lineColor: '#27ae60',
            upLineColor: '#eb5757',
            maker: {
                states: {
                    hover: { enabled: false }
                }
            }
        },
        series: {
            stacking: 'normal'
        }
    },
    rangeSelector: {
        enabled: false,
        selected: 2,
        inputEnabled: false,
        buttons: [{
            type: 'month',
            count: 1,
            text: '1M'
        }, {
            type: 'month',
            count: 3,
            text: '3M'
        }, {
            type: 'month',
            count: 6,
            text: '6M'
        }, {
            type: 'year',
            count: 1,
            text: '1Y'
        }, {
            type: 'all',
            text: 'ALL'
        }],
        buttonTheme: {
            fill: 'rgba(255, 255, 255, 0.05)',
            stroke: 'rgba(255, 255, 255, 0.1)',
            'stroke-width': 1,
            r: 4,
            style: {
                color: '#848e9c',
                fontWeight: '600',
                fontSize: '11px'
            },
            states: {
                hover: {
                    fill: 'rgba(255, 255, 255, 0.15)',
                    style: { color: '#ffffff' }
                },
                select: {
                    fill: '#2962ff',
                    stroke: '#2962ff',
                    style: { color: '#ffffff' }
                }
            }
        }
    },
    navigator: {
        outlineColor: 'rgba(255, 255, 255, 0.1)',
        maskFill: 'rgba(41, 98, 255, 0.2)',
        series: {
            color: '#2962ff',
            lineColor: '#2962ff'
        }
    },
    title: {
        text: ''
    },
    yAxis: [{
        labels: {
            format: '{value:.,0f}',
            align: 'right',
            x: -4,
            style: { color: '#848e9c', fontSize: '11px' }
        },
        title: {
            text: '台指期價格 (點)',
            style: { color: '#848e9c' }
        },
        height: '38%',
        lineWidth: 1,
        lineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        resize: { enabled: true }
    }, {
        labels: {
            align: 'right',
            x: -4,
            style: { color: '#848e9c', fontSize: '11px' }
        },
        title: {
            text: '金額 (億元)',
            style: { color: '#848e9c' }
        },
        top: '42%',
        height: '30%',
        offset: 0,
        lineWidth: 1,
        lineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        resize: { enabled: true },
        stackLabels: {
            enabled: true,
            formatter: function() {
                const stack_index = this.x;
                let sum = 0;
                if (this.isNegative) {
                    const neg = (this.axis.stacking.stacks['column,,,'] && this.axis.stacking.stacks['column,,,'][stack_index])
                        ? this.axis.stacking.stacks['column,,,'][stack_index].total : 0;
                    sum = this.total + neg;
                    if (sum < 0) return Number(sum.toFixed(1));
                } else {
                    const not_neg = (this.axis.stacking.stacks['-column,,,'] && this.axis.stacking.stacks['-column,,,'][stack_index])
                        ? this.axis.stacking.stacks['-column,,,'][stack_index].total : 0;
                    sum = this.total + not_neg;
                    if (sum > 0) return Number(sum.toFixed(1));
                }
            },
            style: {
                fontWeight: 'bold',
                fontSize: '10px',
                color: '#e0e3eb'
            }
        }
    }, {
        labels: {
            align: 'right',
            x: -4,
            style: { color: '#848e9c', fontSize: '11px' }
        },
        title: {
            text: '外資淨部位 (口)',
            style: { color: '#848e9c' }
        },
        top: '76%',
        height: '24%',
        offset: 0,
        lineWidth: 1,
        lineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineColor: 'rgba(255, 255, 255, 0.05)'
    }],
    tooltip: {
        split: true,
        backgroundColor: '#1e222d',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        style: { color: '#ffffff' }
    },
    series: [{
        type: 'candlestick',
        name: '台指期',
        data: [],
        yAxis: 0,
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'column',
        name: '台指期 (億)',
        color: '#2962ff',
        data: [],
        yAxis: 1,
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'column',
        name: '現貨 (億)',
        color: '#f7b731',
        data: [],
        yAxis: 1,
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'column',
        name: '台指選 (億)',
        color: '#a55eea',
        data: [],
        yAxis: 1,
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'column',
        name: '外資淨口數',
        color: '#eb5757',
        negativeColor: '#27ae60',
        data: [],
        yAxis: 2,
        dataGrouping: { units: groupingUnits }
    }]
};

const chart2_options = {
    chart: {
        backgroundColor: 'transparent',
        spacing: [15, 10, 15, 10],
        style: {
            fontFamily: '"Source Han Sans TC", "Noto Sans CJK TC", "Noto Sans TC", BiauKai, "DFKai-SB", serif'
        }
    },
    plotOptions: {
        series: {
            stacking: 'normal'
        }
    },
    rangeSelector: {
        enabled: false,
        selected: 2,
        inputEnabled: false,
        buttons: [{
            type: 'month',
            count: 1,
            text: '1M'
        }, {
            type: 'month',
            count: 3,
            text: '3M'
        }, {
            type: 'month',
            count: 6,
            text: '6M'
        }, {
            type: 'year',
            count: 1,
            text: '1Y'
        }, {
            type: 'all',
            text: 'ALL'
        }],
        buttonTheme: {
            fill: 'rgba(255, 255, 255, 0.05)',
            stroke: 'rgba(255, 255, 255, 0.1)',
            'stroke-width': 1,
            r: 4,
            style: {
                color: '#848e9c',
                fontWeight: '600',
                fontSize: '11px'
            },
            states: {
                hover: {
                    fill: 'rgba(255, 255, 255, 0.15)',
                    style: { color: '#ffffff' }
                },
                select: {
                    fill: '#2962ff',
                    stroke: '#2962ff',
                    style: { color: '#ffffff' }
                }
            }
        }
    },
    navigator: {
        outlineColor: 'rgba(255, 255, 255, 0.1)',
        maskFill: 'rgba(41, 98, 255, 0.2)',
        series: {
            color: '#2962ff',
            lineColor: '#2962ff'
        }
    },
    title: {
        text: ''
    },
    yAxis: {
        labels: {
            align: 'right',
            x: -4,
            style: { color: '#848e9c', fontSize: '11px' }
        },
        title: {
            text: '小台淨部位 (口)',
            style: { color: '#848e9c' }
        },
        height: '100%',
        lineWidth: 1,
        lineColor: 'rgba(255, 255, 255, 0.1)',
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        resize: { enabled: true },
        stackLabels: {
            enabled: true,
            formatter: function() {
                const stack_index = this.x;
                let sum = 0;
                if (this.isNegative) {
                    const neg = (this.axis.stacking.stacks['column,,,'] && this.axis.stacking.stacks['column,,,'][stack_index])
                        ? this.axis.stacking.stacks['column,,,'][stack_index].total : 0;
                    sum = this.total + neg;
                    if (sum < 0) return Math.round(sum).toLocaleString();
                } else {
                    const not_neg = (this.axis.stacking.stacks['-column,,,'] && this.axis.stacking.stacks['-column,,,'][stack_index])
                        ? this.axis.stacking.stacks['-column,,,'][stack_index].total : 0;
                    sum = this.total + not_neg;
                    if (sum > 0) return Math.round(sum).toLocaleString();
                }
            },
            style: {
                fontWeight: 'bold',
                fontSize: '10px',
                color: '#e0e3eb'
            }
        }
    },
    tooltip: {
        split: true,
        backgroundColor: '#1e222d',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        style: { color: '#ffffff' }
    },
    series: [{
        type: 'column',
        name: '自營商',
        color: '#3867d6',
        data: [],
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'column',
        name: '投信',
        color: '#20bf6b',
        data: [],
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'column',
        name: '外資',
        color: '#eb5757',
        data: [],
        dataGrouping: { units: groupingUnits }
    }, {
        type: 'line',
        name: '5日平均',
        color: '#fed330',
        lineWidth: 2,
        data: []
    }]
};

// Domain model extractor for KPI cards
function extractKPISummary(futTxData, chipData, mtxData) {
    if (!futTxData || futTxData.length < 2) return null;

    // Sort and deduplicate dates before taking daily observations.
    const normalize = rows => [...new Map(rows.map(row => [Number(row[0]), row])).values()]
        .sort((a, b) => a[0] - b[0]);
    futTxData = normalize(futTxData);
    chipData = normalize(chipData || []);
    mtxData = normalize(mtxData || []);
    const chipDates = new Set(chipData.map(row => Number(row[0])));
    const latestTx = [...futTxData].reverse().find(row => chipDates.has(Number(row[0])));
    if (!latestTx) throw new Error('價格與外資資料沒有共同交易日');
    const timestamp = Number(latestTx[0]);
    const txIndex = futTxData.indexOf(latestTx);
    const prevTx = futTxData[txIndex - 1];
    const chipIndex = chipData.findIndex(row => Number(row[0]) === timestamp);
    const latestChip = chipData[chipIndex];
    // Match the previous TX trading date; never compare mismatched dates.
    const prevChip = prevTx && chipData.find(row => Number(row[0]) === Number(prevTx[0]));
    const dateStr = new Date(timestamp).toISOString().slice(0, 10).replaceAll('-', '/');
    const closePrice = Number(latestTx[4]);
    const priceChange = prevTx ? closePrice - Number(prevTx[4]) : null;
    const priceChangePct = prevTx && Number(prevTx[4]) !== 0 ? priceChange / Number(prevTx[4]) * 100 : null;
    const volume = Number(latestTx[5]);
    const volumeChange = prevTx ? volume - Number(prevTx[5]) : null;
    const volumeChangePct = prevTx && Number(prevTx[5]) > 0 ? volumeChange / Number(prevTx[5]) * 100 : null;
    const foreignTxLots = Number(latestChip[4]);
    const foreignTxLotsChange = prevChip ? foreignTxLots - Number(prevChip[4]) : null;
    // Backend amounts are already expressed in 100 million TWD.
    const spotAmountYi = Number(latestChip[2]).toFixed(2);
    const spotAmountChangeYi = prevChip ? Number(latestChip[2]) - Number(prevChip[2]) : null;
    const volumes = futTxData.slice(Math.max(0, txIndex - 20), txIndex).map(row => Number(row[5]));
    const averageVolume = volumes.reduce((sum, value) => sum + value, 0) / 20;
    const volumeRatio = volumes.length === 20 && volumes.every(value => Number.isFinite(value) && value >= 0)
        && averageVolume > 0 && Number.isFinite(volume) ? volume / averageVolume : null;
    const latestMtx = mtxData.find(row => Number(row[0]) === timestamp);
    const mtxDealer = latestMtx ? Math.round(Number(latestMtx[1])) : null;
    const mtxIt = latestMtx ? Math.round(Number(latestMtx[2])) : null;
    const mtxForeign = latestMtx ? Math.round(Number(latestMtx[3])) : null;
    const mtxTotal = latestMtx ? mtxDealer + mtxIt + mtxForeign : null;

    return {
        dateStr,
        volumeRatio, volumeChange, volumeChangePct,
        closePrice,
        priceChange,
        priceChangePct,
        volume,
        foreignTxLots,
        foreignTxLotsChange,
        spotAmountYi,
        spotAmountChangeYi,
        mtxDealer,
        mtxIt,
        mtxForeign,
        mtxTotal
    };
}

// Render KPI Summary Cards
function renderKPICards(kpi) {
    if (!kpi) return;

    // Latest Date Header Badge
    const dateBadge = document.getElementById('latest_date_badge');
    if (dateBadge) {
        dateBadge.textContent = `盤後資料：${kpi.dateStr}`;
    }

    // Card 1: TX Price
    const txPriceEl = document.getElementById('kpi_tx_price');
    const txChangeEl = document.getElementById('kpi_tx_change');
    if (txPriceEl && txChangeEl && kpi.priceChange !== null && kpi.priceChangePct !== null) {
        txPriceEl.textContent = kpi.closePrice.toLocaleString();
        const sign = kpi.priceChange > 0 ? '+' : '';
        const colorClass = kpi.priceChange > 0 ? 'val-up' : (kpi.priceChange < 0 ? 'val-down' : 'val-neutral');
        const arrow = kpi.priceChange > 0 ? '▲' : (kpi.priceChange < 0 ? '▼' : '─');
        txChangeEl.className = `kpi-sub ${colorClass}`;
        txChangeEl.innerHTML = `<span>${arrow} ${sign}${kpi.priceChange.toLocaleString()} (${sign}${kpi.priceChangePct.toFixed(2)}%)</span>`;
    }

    // Card 2: Foreign TX Lots
    const foreignLotsEl = document.getElementById('kpi_foreign_lots');
    const foreignLotsChangeEl = document.getElementById('kpi_foreign_lots_change');
    if (foreignLotsEl && foreignLotsChangeEl) {
        foreignLotsEl.textContent = `${Math.round(kpi.foreignTxLots).toLocaleString()} 口`;
        const lotsColor = kpi.foreignTxLots > 0 ? 'val-up' : (kpi.foreignTxLots < 0 ? 'val-down' : 'val-neutral');
        foreignLotsEl.className = `kpi-value ${lotsColor}`;
        const changeSign = kpi.foreignTxLotsChange > 0 ? '+' : '';
        const changeColor = kpi.foreignTxLotsChange > 0 ? 'val-up' : (kpi.foreignTxLotsChange < 0 ? 'val-down' : 'val-neutral');
        foreignLotsChangeEl.className = `kpi-sub ${changeColor}`;
        foreignLotsChangeEl.textContent = `較前日 ${changeSign}${Math.round(kpi.foreignTxLotsChange).toLocaleString()} 口`;
    }

    if (kpi.foreignTxLotsChange === null) foreignLotsChangeEl.textContent = '較前日 —';
    document.getElementById('kpi_volume_ratio').textContent = kpi.volumeRatio === null ? '—' : `${kpi.volumeRatio.toFixed(2)}×`;
    const volumeSign = kpi.volumeChange > 0 ? '+' : '';
    document.getElementById('kpi_vol_change').textContent = kpi.volumeChange === null ? '較前日 —'
        : `較前日 ${volumeSign}${kpi.volumeChange.toLocaleString()} 口${kpi.volumeChangePct === null ? '' : ` (${volumeSign}${kpi.volumeChangePct.toFixed(2)}%)`}`;

    // Secondary foreign spot summary
    const spotEl = document.getElementById('kpi_spot_amount');
    const spotSubEl = document.getElementById('kpi_spot_sub');
    if (spotEl && spotSubEl) {
        const spotColor = kpi.spotAmountYi > 0 ? 'val-up' : (kpi.spotAmountYi < 0 ? 'val-down' : 'val-neutral');
        const spotSign = kpi.spotAmountYi > 0 ? '+' : '';
        spotEl.className = spotColor;
        spotEl.textContent = `${spotSign}${kpi.spotAmountYi} 億`;
        const change = kpi.spotAmountChangeYi;
        spotSubEl.textContent = change === null ? '較前日 —' : `較前日 ${change > 0 ? '+' : ''}${change.toFixed(2)} 億`;
        spotSubEl.className = change > 0 ? 'val-up' : (change < 0 ? 'val-down' : 'val-neutral');
    }

    // Card 4: MTX Major Entities Net
    const mtxEl = document.getElementById('kpi_mtx_total');
    const mtxDetailEl = document.getElementById('kpi_mtx_detail');
    if (mtxEl && mtxDetailEl && kpi.mtxTotal !== null) {
        const mtxColor = kpi.mtxTotal > 0 ? 'val-up' : (kpi.mtxTotal < 0 ? 'val-down' : 'val-neutral');
        const mtxSign = kpi.mtxTotal > 0 ? '+' : '';
        mtxEl.className = mtxColor;
        mtxEl.textContent = `${mtxSign}${kpi.mtxTotal.toLocaleString()} 口`;
        mtxDetailEl.textContent = `外資 ${kpi.mtxForeign > 0 ? '+' : ''}${kpi.mtxForeign} / 投信 ${kpi.mtxIt > 0 ? '+' : ''}${kpi.mtxIt}`;
    }

    // Card 5: TX Volume
    const volEl = document.getElementById('kpi_tx_vol');
    if (volEl) {
        volEl.textContent = `${Math.round(kpi.volume).toLocaleString()} 口`;
    }
}

// Load composition independently so unavailable detail never blocks the dashboard.
async function loadForeignPositions(dateStr) {
    try {
        const response = await fetch('web_json/foreign_positions.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('Position detail unavailable');
        const data = await response.json();
        renderForeignPositions(data.dates?.[dateStr.replaceAll('/', '-')]);
    } catch (error) {
        renderForeignPositions(null);
        console.warn('Position detail:', error);
    }
}

function positionBuyShare(position) {
    if (!position || !Number.isFinite(position.buy) || !Number.isFinite(position.sell)
        || position.buy < 0 || position.sell < 0 || position.buy + position.sell === 0) return null;
    return 100 * position.buy / (position.buy + position.sell);
}

function renderForeignPositions(positions) {
    let available = 0;
    document.querySelectorAll('.position-row').forEach(row => {
        const product = row.dataset.product;
        const position = positions?.[product];
        const share = positionBuyShare(position);
        const track = row.querySelector('.position-track');
        const marker = track.querySelector('span');
        const valid = position && Number.isFinite(position.buy) && Number.isFinite(position.sell)
            && position.buy >= 0 && position.sell >= 0;
        row.querySelector('.position-buy').textContent = valid ? `${position.buy.toLocaleString()}${share === null ? '' : ` · ${share.toFixed(1)}%`}` : '—';
        row.querySelector('.position-sell').textContent = valid ? `${position.sell.toLocaleString()}${share === null ? '' : ` · ${(100 - share).toFixed(1)}%`}` : '—';
        marker.hidden = share === null;
        track.classList.toggle('position-unavailable', share === null);
        if (share !== null) {
            marker.style.left = `${share}%`;
            track.style.setProperty('--buy-share', `${share}%`);
            available++;
        }
        track.setAttribute('aria-label', share === null ? `${product} 無可比較部位`
            : `${product} 買方 ${position.buy.toLocaleString()} 口，占 ${share.toFixed(1)}%；賣方 ${position.sell.toLocaleString()} 口，占 ${(100 - share).toFixed(1)}%`);
    });
    document.getElementById('position_status').textContent = available === 3 ? '' : '部分同日部位資料未提供或無可比較部位';
}

// Each page load gets one countdown; user interaction cancels it for that load.
let summaryDisclosure = null;
function setupSummaryDisclosure() {
    const summary = document.getElementById('market_summary');
    const button = document.getElementById('summary_toggle');
    const details = [...summary.querySelectorAll('.summary-detail')];
    let timer = null;
    let cancelled = false;
    let started = false;
    let expanded = true;
    const cancel = () => {
        cancelled = true;
        if (timer !== null) clearTimeout(timer);
        timer = null;
    };
    const setExpanded = value => {
        expanded = value;
        summary.classList.toggle('is-collapsed', !value);
        details.forEach(detail => {
            detail.inert = !value;
            detail.setAttribute('aria-hidden', String(!value));
        });
        button.setAttribute('aria-expanded', String(value));
        const label = value ? '收合明細' : '展開明細';
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
    };
    button.addEventListener('click', () => { cancel(); setExpanded(!expanded); });
    // Keep embedded disclosures and text selection independent of card toggling.
    summary.addEventListener('click', event => {
        if (!event.target.closest('.kpi-card') || event.target.closest('details, button, a, input, select, textarea')) return;
        if (window.getSelection?.().toString()) return;
        cancel();
        setExpanded(!expanded);
    });
    summary.querySelectorAll('.kpi-card').forEach(card => {
        card.tabIndex = 0;
        card.addEventListener('keydown', event => {
            if (event.target !== card || !['Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            cancel();
            setExpanded(!expanded);
        });
    });
    summary.addEventListener('pointerdown', cancel, { passive: true });
    summary.addEventListener('pointerenter', cancel, { passive: true });
    summary.addEventListener('focusin', cancel);
    const cancelAtChart = () => {
        const chart = document.getElementById('container_stock');
        if (window.scrollY > 0 && chart.getBoundingClientRect().top < window.innerHeight) cancel();
    };
    window.addEventListener('scroll', cancelAtChart, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
    return {
        start() {
            if (started || cancelled) return;
            started = true;
            cancelAtChart();
            if (cancelled || document.hidden || summary.contains(document.activeElement) || summary.matches(':hover')) return;
            timer = setTimeout(() => {
                timer = null;
                cancelAtChart();
                if (!cancelled && !summary.contains(document.activeElement) && !summary.matches(':hover')) setExpanded(false);
            }, 3000);
        }
    };
}

// Main Data Fetcher
document.addEventListener('DOMContentLoaded', function() {
    summaryDisclosure = setupSummaryDisclosure();
    loadDashboardData();
});

function loadDashboardData() {
    const errorBanner = document.getElementById('error_banner');
    if (errorBanner) errorBanner.style.display = 'none';

    let futTxData = null;
    let chipData = null;
    let mtxData = null;

    Promise.all([
        fetch('FUT_TX.json').then(res => {
            if (!res.ok) throw new Error('FUT_TX.json 載入失敗');
            return res.json();
        }),
        fetch('data.json').then(res => {
            if (!res.ok) throw new Error('data.json 載入失敗');
            return res.json();
        }),
        fetch('data_MTX.json').then(res => {
            if (!res.ok) throw new Error('data_MTX.json 載入失敗');
            return res.json();
        })
    ])
    .then(([rawFutTx, rawData, rawMtx]) => {
        futTxData = rawFutTx;
        chipData = rawData;
        mtxData = rawMtx;

        // Reset series so a reload does not duplicate observations.
        [...chart1_options.series, ...chart2_options.series].forEach(series => { series.data = []; });

        // Populate Chart 1
        for (let i = 0; i < futTxData.length; i++) {
            chart1_options.series[0].data.push([
                futTxData[i][0],
                futTxData[i][1],
                futTxData[i][2],
                futTxData[i][3],
                futTxData[i][4]
            ]);
        }
        for (let i = 0; i < chipData.length; i++) {
            // Preserve backend amounts in 100 million TWD without rescaling.
            chart1_options.series[1].data.push([chipData[i][0], parseFloat(chipData[i][1])]);
            chart1_options.series[2].data.push([chipData[i][0], parseFloat(chipData[i][2])]);
            chart1_options.series[3].data.push([chipData[i][0], parseFloat(chipData[i][3])]);
            chart1_options.series[4].data.push([chipData[i][0], parseFloat(chipData[i][4])]);
        }

        // Populate Chart 2
        for (let i = 0; i < mtxData.length; i++) {
            chart2_options.series[0].data.push([mtxData[i][0], parseFloat(mtxData[i][1])]);
            chart2_options.series[1].data.push([mtxData[i][0], parseFloat(mtxData[i][2])]);
            chart2_options.series[2].data.push([mtxData[i][0], parseFloat(mtxData[i][3])]);
            chart2_options.series[3].data.push([mtxData[i][0], parseFloat(mtxData[i][4])]);
        }

        // Render KPI Header
        const kpi = extractKPISummary(futTxData, chipData, mtxData);
        renderKPICards(kpi);
        const positionReady = kpi ? loadForeignPositions(kpi.dateStr) : Promise.resolve();

        // Hide Skeletons
        const stockSkeleton = document.getElementById('stock_skeleton');
        const mtxSkeleton = document.getElementById('mtx_skeleton');
        if (stockSkeleton) stockSkeleton.style.display = 'none';
        if (mtxSkeleton) mtxSkeleton.style.display = 'none';

        // Render Highcharts
        stockChartInstance = Highcharts.stockChart('container_stock', chart1_options);
        mtxChartInstance = Highcharts.stockChart('container_MTX', chart2_options);

        [stockChartInstance, mtxChartInstance].forEach(chart => {
            const end = chart.xAxis[0].dataMax;
            const start = new Date(end);
            start.setUTCMonth(start.getUTCMonth() - 6);
            chart.xAxis[0].setExtremes(start.getTime(), end);
        });

        // Setup custom range buttons
        setupRangeButtons('stock_range_btns', stockChartInstance);
        setupRangeButtons('mtx_range_btns', mtxChartInstance);
        positionReady.then(() => summaryDisclosure?.start());
    })
    .catch(err => {
        console.error('Data load error:', err);
        const errorBanner = document.getElementById('error_banner');
        const errorMsg = document.getElementById('error_msg');
        if (errorBanner) {
            errorBanner.style.display = 'block';
            if (errorMsg) errorMsg.textContent = `資料加載異常：${err.message}`;
        }
        const stockSkeleton = document.getElementById('stock_skeleton');
        const mtxSkeleton = document.getElementById('mtx_skeleton');
        if (stockSkeleton) stockSkeleton.style.display = 'none';
        if (mtxSkeleton) mtxSkeleton.style.display = 'none';
    });
}

// Timeframe quick button handler
function setupRangeButtons(containerId, chartInstance) {
    const container = document.getElementById(containerId);
    if (!container || !chartInstance) return;

    container.addEventListener('click', function(e) {
        if (!e.target.classList.contains('range-btn')) return;

        const months = parseInt(e.target.getAttribute('data-months'), 10);
        const xAxis = chartInstance.xAxis[0];
        const max = xAxis.dataMax;

        // Toggle active button
        container.querySelectorAll('.range-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        if (isNaN(months) || months <= 0) {
            // ALL
            xAxis.setExtremes(xAxis.dataMin, max);
        } else {
            const start = new Date(max);
            start.setUTCMonth(start.getUTCMonth() - months);
            xAxis.setExtremes(start.getTime(), max);
        }
    });
}
