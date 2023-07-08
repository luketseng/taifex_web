//var domain_name = 'http://zane.ftp.sh/'  //mapping http://180.176.148.174/
//var domain_name = 'http://180.176.148.174/'
const domain_name = window.location.hostname;
const domain_url = `http://${domain_name}/`;
var groupingUnits = [[
        'day',                         // unit name
        [1]                             // allowed multiples
    ], [
        'week',                         // unit name
        [1]                             // allowed multiples
    ], [
        'month',
        [1, 2, 3, 4, 6]
    ]];

var chart1_options = {
    plotOptions: {
	    candlestick: {
	    	color: '#8FBC8F',
	    	upColor: 'Crimson',
	    	lineColor: '#8FBC8F',
	    	upLineColor: 'Crimson',
	    	maker:{
	    		states:{
	    			hover:{
	    				enabled:false,
	    			}
	    		}
	    	}
	    },
        series: {
            stacking: 'normal'
        }
    },

    rangeSelector: {
        selected: 1
    },

    title: {
        text: 'Foreign orientation'
    },

    yAxis: [{
        labels: {
            format: '{value:.,0f}',
            align: 'right',
            x: -3
        },
        title: {
            text: 'FUT_TX'
        },
        height: '34%',
        lineWidth: 2,
        resize: {
            enabled: true
        }
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'Amount (0.1 Billion, E)'
        },
        top: '35%',
        height: '34%',
        offset: 0,
        lineWidth: 2,
        resize: {
            enabled: true
        },
        stackLabels: {
          enabled: true,
          formatter: function() {
              //console.log(this);
              stack_index = this.x
              sum = 0

              if (this.isNegative) {
                neg = (this.axis.stacking.stacks['column,,,'][stack_index]? this.axis.stacking.stacks['column,,,'][stack_index].total : 0)
                sum = this.total + neg
                //console.log(this.total, neg, Number(sum.toFixed(2)))
                if (sum < 0) {
                    return Number(sum.toFixed(2))
                }
              }
              else {
                neg = (this.axis.stacking.stacks['-column,,,'][stack_index]? this.axis.stacking.stacks['-column,,,'][stack_index].total : 0)
                sum = this.total + neg
                //console.log(this.total, not_neg, sum.toFixed(2))
                if (sum > 0) {
                    return Number(sum.toFixed(2))
                }
              }
          },
          style: {
            fontWeight: 'bold',
            color: ( // theme
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color
            ) || 'black'
          }
        }
    }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'Amount (Lots)'
        },
        top: '70%',
        height: '30%',
        offset: 0,
        lineWidth: 2
    }],

    tooltip: {
        split: true
    },

    series: [{
        type: 'candlestick',
        name: 'FUT_TX',
        data: [],
        yAxis: 0,
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'column',
        name: 'TX',
        data: [],
        yAxis: 1,
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'column',
        name: 'Spot',
        data: [],
        yAxis: 1,
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'column',
        name: 'TXO',
        data: [],
        yAxis: 1,
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'column',
        name: 'TX_Volume',
        color: "#E22E36",
        data: [],
        yAxis: 2,
        dataGrouping: {
            units: groupingUnits
        }
    }]
};


Highcharts.getJSON(domain_url+'~luke/taifex_web/FUT_TX.json', function (data) {

    // split the data set into ohlc and volume
    var ohlc = [],
        volume = [],
        dataLength = data.length,
        i = 0;

    for (i; i < dataLength; i += 1) {
        chart1_options.series[0].data.push([
            data[i][0], // the date
            data[i][1], // open
            data[i][2], // high
            data[i][3], // low
            data[i][4] // close
        ]);
    }
});

Highcharts.getJSON(domain_url+'~luke/taifex_web/data.json', function (data) {

    i = 0;
    dataLength = data.length;
    for (i; i < dataLength; i += 1) {
        chart1_options.series[1].data.push([data[i][0], parseFloat(data[i][1])]);
        chart1_options.series[2].data.push([data[i][0], parseFloat(data[i][2])]);
        chart1_options.series[3].data.push([data[i][0], parseFloat(data[i][3])]);
        chart1_options.series[4].data.push([data[i][0], parseFloat(data[i][4])]);
    }
    //console.log(options.series)

    // create the chart
    document.getElementById('container_stock').setAttribute("style","min-width: 330px; height: 990px; margin: 0 2.6rem;");
    Highcharts.stockChart('container_stock', chart1_options);
});

var chart2_options = {
    plotOptions: {
        series: {
            stacking: 'normal'
        }
    },

    rangeSelector: {
        selected: 1
    },

    title: {
        text: 'MTX orientation'
    },

    yAxis: {
        labels: {
            align: 'right',
            x: 28
        },
        title: {
            text: 'lots'
        },
        height: '100%',
        lineWidth: 2,
        resize: {
            enabled: true
        },
        stackLabels: {
          enabled: true,
          formatter: function() {
              //console.log(this);
              stack_index = this.x
              sum = 0

              if (this.isNegative == true) {
                neg = (this.axis.stacking.stacks['column,,,'][stack_index]? this.axis.stacking.stacks['column,,,'][stack_index].total : 0)
                sum = this.total + neg
                //console.log(this.total, neg, Number(sum.toFixed(2)))
                if (sum < 0) {
                    return Number(sum.toFixed(2))
                }
              } else if (this.isNegative == false){
                neg = (this.axis.stacking.stacks['-column,,,'][stack_index]? this.axis.stacking.stacks['-column,,,'][stack_index].total : 0)
                sum = this.total + neg
                //console.log(this.total, not_neg, sum.toFixed(2))
                if (sum > 0) {
                    return Number(sum.toFixed(2))
                }
              }
          },
          style: {
            fontWeight: 'bold',
            color: ( // theme
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color
            ) || 'black'
          }
        }
    },

    tooltip: {
        split: true
    },

    series: [{
        type: 'column',
        name: '自營商',
        data: [],
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'column',
        name: '投信',
        data: [],
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'column',
        name: '外資',
        data: [],
        dataGrouping: {
            units: groupingUnits
        }
    }, {
        type: 'line',
        name: '5日平均',
        data: [],
    }]
};
Highcharts.getJSON(domain_url+'~luke/taifex_web/data_MTX.json', function (data) {
    //console.log(data)

    i = 0;
    dataLength = data.length;
    for (i; i < dataLength; i += 1) {
        chart2_options.series[0].data.push([data[i][0], parseFloat(data[i][1])]);
        chart2_options.series[1].data.push([data[i][0], parseFloat(data[i][2])]);
        chart2_options.series[2].data.push([data[i][0], parseFloat(data[i][3])]);
        chart2_options.series[3].data.push([data[i][0], parseFloat(data[i][4])]);
        //chart2_options.series[4].data.push([data[i][0], parseFloat(data[i][5])]);
    }
    //console.log(options.series)

    // create the chart
    document.getElementById('container_MTX').setAttribute("style","min-width: 330px; height: 660px; margin: 0 2.6rem; padding: 1rem 0;");
    Highcharts.stockChart('container_MTX', chart2_options);
});
