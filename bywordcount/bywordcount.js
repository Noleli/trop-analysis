$(document).ready(function() {
  $.get("bywordcount.csv", function(d) {
    // console.log(typeof(d));
    thedata = multiSeriesData(processData(extractData(d))); //$("#data").text(d);
    console.log(thedata);
    // nvd3_tags.options.x_end = 32;
    // nvd3_tags.renderAll();
    nv.addGraph(function() {
    chart = nv.models.lineChart()
        .options({
            transitionDuration: 300,
            useInteractiveGuideline: true
        })
    ;
    // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
    chart.options.title = "hi";
    chart.xAxis
        .axisLabel("Words per pasuk")
        .tickFormat(d3.format(',d'))
        .staggerLabels(false)
    ;
    chart.yAxis
        .axisLabel('Average number of trop')
        .tickFormat(d3.format('g.3'))
    ;

    d3.select('#chart').append('svg')
        .datum(thedata)
        .call(chart);
    nv.utils.windowResize(chart.update);
    return chart;
});
  });
 });


function extractData(csvtext) {
    const separated = csvtext.split('\n');
    const cleaned = $.map(
        $.grep(separated, function(str) {
            return str.trim() != "";
        }),
        function(str) {
            return str.trim();
        }
    );
    const pairs = $.map(cleaned, function(str) {
        return [str.split(',')];
    });
    return $.grep(pairs, function(pair) {
        return pair != undefined;
    });
}

function processData(data) {
    return $.map(data, function(row) {
        return [$.map(row, function(item) {
            return !isNaN(item) ? parseFloat(item) : item;
        })];
    });
}

function multiSeriesData(data) {
    const labels = data[0].slice(1);
    const values = data.slice(1);
    const output = $.map(labels, function(label,index) {
        return {
            'key': label,
            'values': $.map(values, function(row, pos) {
                // return [[row[0],row[index+1]]];
                return {'x': row[0], 'y': row[index+1]}
            })
        };
    });
    return output;
}

function sincos() {
  var sin = [],
      cos = [];

  for (var i = 0; i < 100; i++) {
    sin.push({x: i, y: Math.sin(i/10)});
    cos.push({x: i, y: .5 * Math.cos(i/10)});
  }

  return [
    {
      values: sin,
      key: 'Sine Wave',
      color: '#ff7f0e'
    },
    {
      values: cos,
      key: 'Cosine Wave',
      color: '#2ca02c'
    }
  ];
}