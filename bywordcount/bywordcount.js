$(document).ready(function() {
    $.getScript("//assets.noahliebman.net/d3/d3.min.js", function() {
        $.getScript("//assets.noahliebman.net/nvd3/nv.d3.min.js", doTheGraphThing);
    });
});

function doTheGraphThing() {
    $.get("/post-uploads/trop/bywordcount.csv", function(d) {
        thedata = multiSeriesData(processData(extractData(d))); //$("#data").text(d);
        // console.log(thedata);
        nv.addGraph(function() {
        var chart = nv.models.lineChart()
            .options({
            transitionDuration: 300,
            useInteractiveGuideline: true
        });

        // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
        chart.xAxis
            .axisLabel("Words per pasuk")
            .tickFormat(d3.format(',d'))
            .staggerLabels(false);

        chart.yAxis
            .axisLabel('Average number of trop')
            .tickFormat(d3.format('.3g'));

        var chartElt = document.getElementById("bywordcount_chart");
        // console.log(d3.select(chartElt));
        var thesvg = d3.select(chartElt).append("svg:svg");
        var thedatums = thesvg.datum(thedata);
        console.log(thedatums);
        // console.log(chart);
        console.log(thedatums.call(chart));
        nv.utils.windowResize(chart.update);




      // set up which series are displayed. surely there's a less hacky way of doing this.
      var click = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      var doubleClick = new MouseEvent('dblclick', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      
      $(".nv-series")[1].dispatchEvent(doubleClick); // show just the etnakhta
      $(".nv-series")[9].dispatchEvent(click);
      $(".nv-series")[13].dispatchEvent(click);
      $(".nv-series")[22].dispatchEvent(click);



    return chart;
  });
  });
}


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

// for IE
if (typeof MouseEvent !== 'function') {
    (function (){
        var _MouseEvent = window.MouseEvent;
        window.MouseEvent = function (type, dict){
            dict = dict | {};
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent(
                    type,
                    (typeof dict.bubbles == 'undefined') ? true : !!dict.bubbles,
                    (typeof dict.cancelable == 'undefined') ? false : !!dict.cancelable,
                    dict.view || window,
                    dict.detail | 0,
                    dict.screenX | 0,
                    dict.screenY | 0,
                    dict.clientX | 0,
                    dict.clientY | 0,
                    !!dict.ctrlKey,
                    !!dict.altKey,
                    !!dict.shiftKey,
                    !!dict.metaKey,
                    dict.button | 0,
                    dict.relatedTarget || null
            );
            return event;
        }
    })();
}
