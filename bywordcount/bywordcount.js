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
    chart.xAxis
        .axisLabel("Time (s)")
        .tickFormat(d3.format(',d'))
        .staggerLabels(true)
    ;
    chart.yAxis
        .axisLabel('Voltage (v)')
        .tickFormat(d3.format(',d'))
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
                return [[row[0],row[index+1]]];
            })
        };
    });
    return output;
}
