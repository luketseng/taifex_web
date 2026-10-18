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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
    },
    plotOptions: {
        candlestick: {
            color: '#27ae60',       // 跌 (綠)
            upColor: '#eb5757',     // 漲 (紅)
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
        selected: 2,
        inputEnabled: false,
        buttons: [{
            type: 'month',
            count: 1,
            text: '1月'
        }, {
            type: 'month',
            count: 3,
            text: '3月'
        }, {
            type: 'month',
            count: 6,
            text: '6月'
        }, {
            type: 'year',
            count: 1,
            text: '1年'
        }, {
            type: 'all',
            text: '全部'
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
            text: '外資期貨淨留倉 (口)',
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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
    },
    plotOptions: {
        series: {
            stacking: 'normal'
        }
    },
    rangeSelector: {
        selected: 2,
        inputEnabled: false,
        buttons: [{
            type: 'month',
            count: 1,
            text: '1月'
        }, {
            type: 'month',
            count: 3,
            text: '3月'
        }, {
            type: 'month',
            count: 6,
            text: '6月'
        }, {
            type: 'year',
            count: 1,
            text: '1年'
        }, {
            type: 'all',
            text: '全部'
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
            text: '小台未平倉口數 (Lots)',
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

    const latestTx = futTxData[futTxData.length - 1];
    const prevTx = futTxData[futTxData.length - 2];
    const txDate = new Date(latestTx[0]);
    const dateStr = `${txDate.getFullYear()}/${String(txDate.getMonth() + 1).padStart(2, '0')}/${String(txDate.getDate()).padStart(2, '0')}`;

    const closePrice = latestTx[4];
    const prevClose = prevTx[4];
    const priceChange = closePrice - prevClose;
    const priceChangePct = ((priceChange / prevClose) * 100).toFixed(2);
    const volume = latestTx[5];

    let foreignTxLots = 0;
    let foreignTxLotsChange = 0;
    let spotAmountYi = 0;
    if (chipData && chipData.length >= 2) {
        const latestChip = chipData[chipData.length - 1];
        const prevChip = chipData[chipData.length - 2];
        foreignTxLots = parseFloat(latestChip[4]);
        foreignTxLotsChange = foreignTxLots - parseFloat(prevChip[4]);
        spotAmountYi = (parseFloat(latestChip[2]) / 10).toFixed(2); // 原始為 0.1 億，除以 10 為億元
    }

    let mtxDealer = 0;
    let mtxIt = 0;
    let mtxForeign = 0;
    let mtxTotal = 0;
    if (mtxData && mtxData.length >= 1) {
        const latestMtx = mtxData[mtxData.length - 1];
        mtxDealer = Math.round(parseFloat(latestMtx[1]));
        mtxIt = Math.round(parseFloat(latestMtx[2]));
        mtxForeign = Math.round(parseFloat(latestMtx[3]));
        mtxTotal = mtxDealer + mtxIt + mtxForeign;
    }

    return {
        dateStr,
        closePrice,
        priceChange,
        priceChangePct,
        volume,
        foreignTxLots,
        foreignTxLotsChange,
        spotAmountYi,
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
    if (txPriceEl && txChangeEl) {
        txPriceEl.textContent = kpi.closePrice.toLocaleString();
        const sign = kpi.priceChange > 0 ? '+' : '';
        const colorClass = kpi.priceChange > 0 ? 'val-up' : (kpi.priceChange < 0 ? 'val-down' : 'val-neutral');
        const arrow = kpi.priceChange > 0 ? '▲' : (kpi.priceChange < 0 ? '▼' : '─');
        txChangeEl.className = `kpi-sub ${colorClass}`;
        txChangeEl.innerHTML = `<span>${arrow} ${sign}${kpi.priceChange} (${sign}${kpi.priceChangePct}%)</span>`;
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

    // Card 3: Foreign Spot Net Amount
    const spotEl = document.getElementById('kpi_spot_amount');
    const spotSubEl = document.getElementById('kpi_spot_sub');
    if (spotEl && spotSubEl) {
        const spotColor = kpi.spotAmountYi > 0 ? 'val-up' : (kpi.spotAmountYi < 0 ? 'val-down' : 'val-neutral');
        const spotSign = kpi.spotAmountYi > 0 ? '+' : '';
        spotEl.className = `kpi-value ${spotColor}`;
        spotEl.textContent = `${spotSign}${kpi.spotAmountYi} 億`;
        spotSubEl.textContent = kpi.spotAmountYi > 0 ? '偏多買超' : (kpi.spotAmountYi < 0 ? '偏空賣超' : '平盤');
    }

    // Card 4: MTX Major Entities Net
    const mtxEl = document.getElementById('kpi_mtx_total');
    const mtxDetailEl = document.getElementById('kpi_mtx_detail');
    if (mtxEl && mtxDetailEl) {
        const mtxColor = kpi.mtxTotal > 0 ? 'val-up' : (kpi.mtxTotal < 0 ? 'val-down' : 'val-neutral');
        const mtxSign = kpi.mtxTotal > 0 ? '+' : '';
        mtxEl.className = `kpi-value ${mtxColor}`;
        mtxEl.textContent = `${mtxSign}${kpi.mtxTotal.toLocaleString()} 口`;
        mtxDetailEl.textContent = `外資 ${kpi.mtxForeign > 0 ? '+' : ''}${kpi.mtxForeign} / 投信 ${kpi.mtxIt > 0 ? '+' : ''}${kpi.mtxIt}`;
    }

    // Card 5: TX Volume
    const volEl = document.getElementById('kpi_tx_vol');
    if (volEl) {
        volEl.textContent = `${Math.round(kpi.volume).toLocaleString()} 口`;
    }
}

// Main Data Fetcher
document.addEventListener('DOMContentLoaded', function() {
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
            // Note: convert 0.1 億 to 億 (除以 10) for easier reading
            chart1_options.series[1].data.push([chipData[i][0], parseFloat((parseFloat(chipData[i][1]) / 10).toFixed(2))]);
            chart1_options.series[2].data.push([chipData[i][0], parseFloat((parseFloat(chipData[i][2]) / 10).toFixed(2))]);
            chart1_options.series[3].data.push([chipData[i][0], parseFloat((parseFloat(chipData[i][3]) / 10).toFixed(2))]);
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

        // Hide Skeletons
        const stockSkeleton = document.getElementById('stock_skeleton');
        const mtxSkeleton = document.getElementById('mtx_skeleton');
        if (stockSkeleton) stockSkeleton.style.display = 'none';
        if (mtxSkeleton) mtxSkeleton.style.display = 'none';

        // Render Highcharts
        stockChartInstance = Highcharts.stockChart('container_stock', chart1_options);
        mtxChartInstance = Highcharts.stockChart('container_MTX', chart2_options);

        // Setup custom range buttons
        setupRangeButtons('stock_range_btns', stockChartInstance);
        setupRangeButtons('mtx_range_btns', mtxChartInstance);
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
            const min = max - (months * 30 * 24 * 3600 * 1000);
            xAxis.setExtremes(min, max);
        }
    });
}
