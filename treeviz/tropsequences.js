// var width = window.innerWidth,
//     height = window.innerHeight;



var hspace = 20,
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

var svg = d3.select("#vizcontainer").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("direction", "rtl");

var nodes = []
var links;
var linkline = d3.svg.diagonal();
var jsonobj; // temp
    // .projection(function(d) { return [d.y, d.x]; });

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
        d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
        d.y = i*(vspace + tree.nodeSize()[1]); // - d.depth*(vspace + tree.nodeSize()[1]);
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

    var node = svg.selectAll("g.node").data(nodes, function(d) { return [d.name, d.depth] }) // .filter(function(d) { return d.depth <= 1 }).sort(tree.sort)
    node.enter().append("g")
            .attr("class", "node");

    node.on("click", function(d) {
        // console.log("click");
        expand(d);
        width += tree.nodeSize()[0] + hspace;
        x.domain([0, width]);
        x.range([width, 0]);
        svg.attr("width", width);
        // if(d.depth > 0)
        // nodes = nodes.filter(function(n) { return n.depth < d.depth});
        
        // push all existing nodes to the right in preperation for widening the svg
        nodes.forEach(function(d) {
            d.x += tree.nodeSize()[0] + hspace;
        });
        d.children.forEach(function(d, i) {
            d.x = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
            d.y = i*(vspace + tree.nodeSize()[1]);
        });
        nodes = nodes.concat(d.children); //.sort(function(a,b) { return b.count - a.count }));
        // links = links.concat(tree.links(d.children).filter(function(n) { n.source.name == d.name && n.source.depth == d.depth; }));
        // console.log(d.children);
        links = links.concat(tree.links(nodes));
        update();
    });

    node.attr("transform", pos);

    node.append("rect")
        .attr("width", tree.nodeSize()[0]).attr("height", tree.nodeSize()[1]);

    node.append("text")
        .attr("class", "tropchar")
        .attr("dx", 50)
        .attr("dy", tree.nodeSize()[1]/2+30)
        .text(function(d) { return " " + d.char; });

    node.append("text")
        .attr("class", "count")
        .attr("dx", 50)
        .attr("dy", tree.nodeSize()[1]/2+30)
        .text(function(d) { return d.count; });

    node.append("text")
        .attr("class", "count")
        .attr("dx", 70)
        .attr("dy", tree.nodeSize()[1]/2+10)
        .text(function(d) { return d.name; });

    node.exit().remove();

    var link = svg.selectAll("path.link")
        .data(links); //, function(d) { return [d.name, d.depth] })
    
    link.enter().append("path")
            .attr("class", "link");
            // .attr("transform", "translate(0," + (tree.nodeSize()[1]/2) + ")");
    link.attr("d", linkline);
    link.exit().remove();
}

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        // d._children.forEach(collapse);
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
