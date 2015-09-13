var graphHeight = 175;



var hspace = 60,
    vspace = 10;

// function troptree() {
//     return d3.layout.tree.call(this);

//     // this.x = 0;
//     // this.y = 0;
// }

// troptree.prototype = Object.create(d3.layout.tree.prototype);
// troptree.prototype.constructor = troptree;

var tree = d3.layout.tree()
    .nodeSize([100,100]);
// tree.nodeSize = function() {return [100, 100]; // setting this manually since I'm not using tree() anymore

height = 27 * (tree.nodeSize()[1] + vspace);
width = tree.nodeSize()[0] + hspace;

var x = d3.scale.linear()
    .domain([0, width])
    .range([width, 0]);

d3.select("#vizcontainer")
    .style({"height": (window.innerHeight - graphHeight - 28) + "px"});

var svg = d3.select("#vizcontainer")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("direction", "rtl");

var nodes = []
var links;
var depthsums = d3.map([], function(s) { return s.depth });
// var linkline = d3.svg.diagonal();
var linkline = function(d) {
    // console.log(d); ok, so it has d.source and d.target
    var starty = (d.source.y+tree.nodeSize()[1]/2);
    var endy = (d.target.y+tree.nodeSize()[1]/2);
    var startx = d.source.x;
    var endx = d.target.x + tree.nodeSize()[0];
    var pathstr = "M" + startx + " " + starty + "C " + (startx-hspace/2) + " " + starty + ", " + (endx+hspace/2) + " " + endy + ", " + endx + " " + endy;
    return pathstr;
}
var jsonobj; // temp
    // .projection(function(d) { return [d.y, d.x]; });

var probformat = d3.format(".1%");

d3.json("sequencetree-d3format.json", function(root) {
    // jsonobj = root;
    // console.log(root);
    root.forEach(function(r) {
        // console.log(r);
        nodes = nodes.concat(tree.nodes(r));
    });
    nodes = nodes.filter(function(d) { return d.depth == 0 });
    nodes.sort(function(a,b) { return b.count - a.count });
    // nodes = tree.nodes(root[0])
    //     .sort(function(a,b) { return b.count - a.count });

    var depthsum = depthsums.get(0) ? depthsums.get(0) : depthsums.set(0, d3.sum(nodes.map(function(d) { return d.count })));

    nodes.forEach(function(d, i) {
        // d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
        // d.y = i*(vspace + tree.nodeSize()[1]);
        // d.y = function(d, j) {
        //     return j*(vspace + tree.nodeSize()[1]);
        // }
        // d.count = parseInt(d.count);

        // don't use the collapse() function here because we don't want need to recurse within a forEach
        // console.log(i, d.name);
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }
        d.disabled = false;
        d.clicked = false;
        d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
        d.y = i*(vspace + tree.nodeSize()[1]); // - d.depth*(vspace + tree.nodeSize()[1]);

        d.prob = d.count/depthsum;
    });
    links = tree.links(nodes);

    update();
});

function update() {
    var pos = function(d, i) {
        // var xPos = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
        // var yPos = i*(vspace + tree.nodeSize()[1]) - d.depth*(vspace + tree.nodeSize()[1]);

        // update these so we can use them when drawing links
        // d.x = xPos;
        // d.y = yPos;
        // return "translate(" + xPos + ", " + yPos + ")";
        return "translate(" + d.x + ", " + d.y + ")";
    }

    var node = svg.selectAll("g.node").data(nodes, function(d) { return ancestry(d) }); // .filter(function(d) { return d.depth <= 1 }).sort(tree.sort)
    
    var nodeenter = node.enter()
        .append("g")
            .attr("class", "node")
            .on("click", nodeclick);
        // console.log(n);
    nodeenter.append("rect")
        .attr("width", tree.nodeSize()[0]).attr("height", tree.nodeSize()[1]);

    nodeenter.append("text")
        .attr("class", "tropchar")
        .attr("dx", 50)
        .attr("dy", tree.nodeSize()[1]/2+30)
        .text(function(d) { return " " + d.char; });

    nodeenter.append("text")
        .attr("class", "count")
        .attr("dx", 50)
        .attr("dy", tree.nodeSize()[1]/2+30)
        .text(function(d) { return d.count; });

    nodeenter.append("text")
        .attr("class", "prob")
        .attr("dx", 60)
        .attr("dy", tree.nodeSize()[1]/2-20)
        .text(function(d) { return probformat(d.prob); });

    nodeenter.append("text")
        .attr("class", "name")
        .attr("dx", 70)
        .attr("dy", tree.nodeSize()[1]/2+10)
        .text(function(d) { return d.name; });


    node.attr("transform", pos);
    node.classed("disabled", function(d) { return d.disabled });

    // node.append("rect")
    //     .attr("width", tree.nodeSize()[0]).attr("height", tree.nodeSize()[1]);

    // node.append("text")
    //     .attr("class", "tropchar")
    //     .attr("dx", 50)
    //     .attr("dy", tree.nodeSize()[1]/2+30)
    //     .text(function(d) { return " " + d.char; });

    // node.append("text")
    //     .attr("class", "count")
    //     .attr("dx", 50)
    //     .attr("dy", tree.nodeSize()[1]/2+30)
    //     .text(function(d) { return d.count; });

    // node.append("text")
    //     .attr("class", "prob")
    //     .attr("dx", 50)
    //     .attr("dy", tree.nodeSize()[1]/2-20)
    //     .text(function(d) { return probformat(d.prob); });

    // node.append("text")
    //     .attr("class", "name")
    //     .attr("dx", 70)
    //     .attr("dy", tree.nodeSize()[1]/2+10)
    //     .text(function(d) { return d.name; });

    node.exit().remove();

    var link = svg.selectAll("path.link")
        .data(links); //, function(d) { return [d.name, d.depth] })
    
    link.enter().append("path")
            .attr("class", "link");
            // .attr("transform", "translate(0," + (tree.nodeSize()[1]/2) + ")");
    link.attr("d", linkline);
    link.classed("disabled", linkclass);
    link.exit().remove();
}

function linkclass(d) {
    return d.target.disabled;
}

function ancestry(n, s) {
    if(s == undefined) {
        s = n.name;
    }
    if(n.parent != undefined) {
        s += "," + n.parent.name;
        return ancestry(n.parent, s);
    }
    // else {
    else return s;
    // }
}

function nodeclick(d) {
    graph(ancestry(d).split(",").reverse().join(",")); // the ansestry string is backwards, so I have to do this silly thing.

    // nodes.forEach(function(n) {
    //     if(n.depth > d.depth) {
    //         // n.clicked = false;
    //         // n.disabled = false;
    //         collapse(n);
    //     }
    // });
    
    nodes = nodes.filter(function(n) {
        if(n.depth > d.depth) {
            collapse(n);
        }
        return n.depth <= d.depth
    });
    if(d.children || d._children) { // this is the more general way of asking whether it's not a sof pasuk
        width = (d3.max(nodes.map(function(d) { return d.depth })) + 2) * (tree.nodeSize()[0] + hspace);
        x.domain([0, width]);
        x.range([width, 0]);
        svg.attr("width", width);

        nodes.forEach(function(n) {
            // n.x += tree.nodeSize()[0] + hspace;
            n.x = x(n.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
            
            if(!n.clicked) n.disabled = true;

            if(n.depth == d.depth && n != d) {
                n.clicked = false;
                n.disabled = true;
                collapse(n);
                // links = links.filter(function(l) { return l.source != n});
                // width 
            }
        });

        d.disabled = false;
        d.clicked = true;
        expand(d);
        // width += tree.nodeSize()[0] + hspace;

        // if(d.depth > 0)
        // nodes = nodes.filter(function(n) { return n.depth < d.depth});
        
        // push all existing nodes to the right in preperation for widening the svg
        // console.log(d3.sum(d.children.map(function(n) { return n.count })));
        // console.log(d.depth);
        // var depthsum = depthsums.get(d.depth+1) ? depthsums.get(d.depth+1) : depthsums.set(d.depth+1, d3.sum(d.children.map(function(n) { return n.count })));
        var depthsum = d3.sum(d.children.map(function(n) { return n.count }));
        
        d.children.forEach(function(d, i) {
            d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
            d.y = i*(vspace + tree.nodeSize()[1]);

            d.disabled = false;
            d.clicked = false;

            d.prob = d.count/depthsum;
        });
        nodes = nodes.concat(d.children); //.sort(function(a,b) { return b.count - a.count }));
        // links = links.concat(tree.links(d.children).filter(function(n) { n.source.name == d.name && n.source.depth == d.depth; }));
        // console.log(d.children);
        // links = links.concat(tree.links(nodes));
        // links = tree.links(nodes);
    }
    else {
        console.log("not here, right?");
        d.clicked = true;
        d.disabled = false;

        nodes.forEach(function(n) {
            if(n.depth == d.depth && n != d) {
                n.clicked = false;
                n.disabled = true;
                collapse(n);
            }

            if(n.depth > d.depth) {
                collapse(n);
            }
        });

        // width = (d3.max(nodes.map(function(d) { return d.depth })) + 2) * (tree.nodeSize()[0] + hspace);
        // x.domain([0, width]);
        // x.range([width, 0]);
        // svg.attr("width", width);
    }
    links = tree.links(nodes);
    update();
}

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(function(n) {
            // d.clicked = false;
            // d.disabled = false;
            collapse(n);
        });
        d.children = null;
    }
}

function expand(d) {
    if (d._children) {
        d.children = d._children.sort(function(a,b) { return b.count - a.count });
        d.children.forEach(collapse);
        d._children = null;
    }
}







//////////////// graph //////////////

var perekindex = ["bereshit,1","bereshit,2","bereshit,3","bereshit,4","bereshit,5","bereshit,6","bereshit,7","bereshit,8","bereshit,9","bereshit,10","bereshit,11","bereshit,12","bereshit,13","bereshit,14","bereshit,15","bereshit,16","bereshit,17","bereshit,18","bereshit,19","bereshit,20","bereshit,21","bereshit,22","bereshit,23","bereshit,24","bereshit,25","bereshit,26","bereshit,27","bereshit,28","bereshit,29","bereshit,30","bereshit,31","bereshit,32","bereshit,33","bereshit,34","bereshit,35","bereshit,36","bereshit,37","bereshit,38","bereshit,39","bereshit,40","bereshit,41","bereshit,42","bereshit,43","bereshit,44","bereshit,45","bereshit,46","bereshit,47","bereshit,48","bereshit,49","bereshit,50","shmot,1","shmot,2","shmot,3","shmot,4","shmot,5","shmot,6","shmot,7","shmot,8","shmot,9","shmot,10","shmot,11","shmot,12","shmot,13","shmot,14","shmot,15","shmot,16","shmot,17","shmot,18","shmot,19","shmot,20","shmot,21","shmot,22","shmot,23","shmot,24","shmot,25","shmot,26","shmot,27","shmot,28","shmot,29","shmot,30","shmot,31","shmot,32","shmot,33","shmot,34","shmot,35","shmot,36","shmot,37","shmot,38","shmot,39","shmot,40","vayikra,1","vayikra,2","vayikra,3","vayikra,4","vayikra,5","vayikra,6","vayikra,7","vayikra,8","vayikra,9","vayikra,10","vayikra,11","vayikra,12","vayikra,13","vayikra,14","vayikra,15","vayikra,16","vayikra,17","vayikra,18","vayikra,19","vayikra,20","vayikra,21","vayikra,22","vayikra,23","vayikra,24","vayikra,25","vayikra,26","vayikra,27","bmidbar,1","bmidbar,2","bmidbar,3","bmidbar,4","bmidbar,5","bmidbar,6","bmidbar,7","bmidbar,8","bmidbar,9","bmidbar,10","bmidbar,11","bmidbar,12","bmidbar,13","bmidbar,14","bmidbar,15","bmidbar,16","bmidbar,17","bmidbar,18","bmidbar,19","bmidbar,20","bmidbar,21","bmidbar,22","bmidbar,23","bmidbar,24","bmidbar,25","bmidbar,26","bmidbar,27","bmidbar,28","bmidbar,29","bmidbar,30","bmidbar,31","bmidbar,32","bmidbar,33","bmidbar,34","bmidbar,35","bmidbar,36","dvarim,1","dvarim,2","dvarim,3","dvarim,4","dvarim,5","dvarim,6","dvarim,7","dvarim,8","dvarim,9","dvarim,10","dvarim,11","dvarim,12","dvarim,13","dvarim,14","dvarim,15","dvarim,16","dvarim,17","dvarim,18","dvarim,19","dvarim,20","dvarim,21","dvarim,22","dvarim,23","dvarim,24","dvarim,25","dvarim,26","dvarim,27","dvarim,28","dvarim,29","dvarim,30","dvarim,31","dvarim,32","dvarim,33","dvarim,34"];

var graphMargin = {left: 4, right: 50, top: 2, bottom: 22};
var graphWidth = window.innerWidth - 20;

var graphsvg = d3.select("#graphcontainer")
    .append("svg")
        .attr("width", graphWidth)
        .attr("height", graphHeight);

var barg = graphsvg.append("g")
    .attr("width", graphWidth)
    .attr("height", graphHeight - graphMargin.top - graphMargin.bottom)
    .attr("transform", "translate(" + graphMargin.left + ", " + graphMargin.top + ")");

var graphx = d3.scale.ordinal()
    .domain(perekindex)
    .rangeBands([graphWidth-graphMargin.right, graphMargin.left], .2);
var graphy = d3.scale.linear()
    .range([graphHeight-graphMargin.bottom, graphMargin.top]);    ;
var barwidth = graphx.rangeBand();

var xAxis = d3.svg.axis()
    .scale(graphx)
    .orient("bottom")
    .innerTickSize(3)
    .outerTickSize(0)
    .tickValues(["bereshit,1", "shmot,1", "vayikra,1", "bmidbar,1", "dvarim,1"])
    .tickFormat(function(t) {
        if(t == "bereshit,1") return "Bereshit";
        else if(t == "shmot,1") return "Shmot";
        else if(t == "vayikra,1") return "Vayikra";
        else if(t == "bmidbar,1") return "B’midbar";
        else if(t == "dvarim,1") return "D’varim";
        else return t;
    });

var xaxisg = graphsvg.append("g")
    .attr("transform", "translate(" + graphMargin.left + ", " + (graphHeight - graphMargin.bottom + 2) + ")")
    .attr("height", graphMargin.bottom)
    .call(xAxis);

var byperekdata;
d3.json("byperek_full.json", function(byperekjson) {
    byperekdata = d3.map(byperekjson, function(d) { return d.seq });
});

/*function graph(seq) {
    var filename = "byperek_" + seq + ".json";
    d3.json("byperek/" + filename, function(byperekjson) {
        jsonobj = byperekjson;
        // graphx.domain(byperekjson.map(function(d) { return d.index }))
        // graphx.domain(perekindex)
        //     .rangeBands([graphWidth-graphMargin.right, graphMargin.left], .2);

        // console.log(d3.extent(byperekjson.map(function(d) { return d.norm })));
        graphy.domain([0, d3.max(byperekjson.map(function(d) { return d.norm }))])
        // graphy.domain([0, 0.04])
            .range([graphHeight-graphMargin.bottom, graphMargin.top]);

        graphUpdate(byperekjson);
    });
}*/

function graph(seq) {
    var data = byperekdata.get(seq).sources;
    var bar = barg.selectAll("rect.bar").data(data, function(d) { return d.index });

    graphy.domain([0, d3.max(data.map(function(d) { return d.norm }))]);        

    var barenter = bar.enter()
        .append("rect")
            .attr("class", "bar")
            .attr("width", barwidth)
            .attr("x", function(d) { return graphx(d.index) })
            .attr("title", function(d) { return d.index });

    bar.transition().duration(250)
        .attr("y", function(d) { return graphy(d.norm) })
        .attr("height", function(d) { return (graphHeight-graphMargin.bottom) - graphy(d.norm) });

    bar.exit().transition().duration(250)
        .attr("height", 1)
        .attr("y", graphHeight-graphMargin.bottom-1);
}

function initgraph() {
    var initdata = perekindex.map(function(i) { return { index: i, norm: 0 }});
    graphUpdate(initdata);
}

d3.select(window).on("resize", function() {
    d3.select("#vizcontainer")
        .style({"height": (window.innerHeight - graphHeight - 28) + "px"});

    graphWidth = window.innerWidth - 20;
    graphsvg.attr("width", graphWidth);
    barg.attr("width", graphWidth);
    graphx.rangeBands([graphWidth-graphMargin.right, graphMargin.left], .2);
    barwidth = graphx.rangeBand();
    xaxisg.call(xAxis);
    barg.selectAll(".bar")
        .attr("width", barwidth)
        .attr("x", function(d) { return graphx(d.index) });
});




