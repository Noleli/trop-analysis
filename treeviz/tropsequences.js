var graphHeight = 200;



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
    .style({"height": (window.innerHeight - graphHeight - 5) + "px"});

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
        .attr("dx", 50)
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
    nodes = nodes.filter(function(n) { return n.depth <= d.depth });
    if(d.children || d._children) {
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
                links = links.filter(function(l) { return l.source != n});
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
            // d.clicked = true;

            d.prob = d.count/depthsum;
        });
        nodes = nodes.concat(d.children); //.sort(function(a,b) { return b.count - a.count }));
        // links = links.concat(tree.links(d.children).filter(function(n) { n.source.name == d.name && n.source.depth == d.depth; }));
        // console.log(d.children);
        // links = links.concat(tree.links(nodes));
        links = tree.links(nodes);
    }
    else {
        d.clicked = true;
        d.disabled = false;

        width = (d3.max(nodes.map(function(d) { return d.depth })) + 2) * (tree.nodeSize()[0] + hspace);
        x.domain([0, width]);
        x.range([width, 0]);
        svg.attr("width", width);
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





var graphMargin = {left: 4, right: 4, top: 2, bottom: 2};
var graphWidth = window.innerWidth - 4;

var graphsvg = d3.select("#graphcontainer")
    .append("svg")
        .attr("width", graphWidth)
        .attr("height", graphHeight);
        // .attr("direction", "rtl");

// var graphx = d3.scale.linear()
//     .domain([0, graphWidth])
//     .range([]);

var graphx = d3.scale.ordinal();
var graphy = d3.scale.linear();
    // .domain()

d3.json("byperek_munakhrevii.json", function(byperekjson) {
    jsonobj = byperekjson;
    graphx.domain(byperekjson.map(function(d) { return d.index }))
        .rangeBands([graphWidth-graphMargin.right, graphMargin.left], .2);

    graphy.domain(d3.extent(byperekjson.map(function(d) { return d.norm })))
        .range([graphHeight+graphMargin.bottom, graphMargin.top]);

    graphUpdate(byperekjson);
});

function graphUpdate(data) {
    var bar = graphsvg.selectAll("rect.bar").data(data, function(d) { return d.index });

    // var barwidth = Math.floor(data.length/(graphWidth-graphMargin.right-graphMargin.left)) - graphx
    var barwidth = graphx.rangeBand();

    var barenter = bar.enter()
        .append("rect")
            .attr("class", "bar");
        // console.log(n);
    bar
        .attr("width", barwidth)
        .attr("height", function(d) { return graphy(d.norm) })
        .attr("x", function(d) { return graphx(d.index) })
        .attr("y", function(d) { return graphHeight - graphy(d.norm) });

    bar.exit().remove();
}
