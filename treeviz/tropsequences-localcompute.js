var graphHeight = 175;



var hspace = 60,
    vspace = 0;

// function troptree() {
//     return d3.layout.tree.call(this);

//     // this.x = 0;
//     // this.y = 0;
// }

// troptree.prototype = Object.create(d3.layout.tree.prototype);
// troptree.prototype.constructor = troptree;

var tree = d3.layout.tree()
    .nodeSize([210,30]);
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
var countformat = d3.format(",");

// d3.json("sequencetree-d3format.json", function(root) {
var tropnames = d3.map([{"char": "\u0597", "name": "revii", "heb": "רְבִ֗יע"}, {"char": "\u059d", "name": "gereshmukdam"}, {"char": "\u05a6", "name": "merkhakfula", "heb": "מֵרְכָא כּפוּלָ֦ה"}, {"char": "\u059e", "name": "gershayim", "heb": "גֵּרְשַׁ֞יִם"}, {"char": "\u059b", "name": "tevir", "heb": "תְּבִ֛יר"}, {"char": "\u059f", "name": "karnepara", "heb": "קַרְנֵי פָרָ֟ה"}, {"char": "\u0595", "name": "gadol", "heb": "גָּד֕וֹל"}, {"char": "\u05a0", "name": "telishagedola", "heb": "תְּ֠לִישָא גְדוֹלָה"}, {"char": "\u0599", "name": "pashta", "heb": "פַּשְׁטָא֙"}, {"char": "\u0593", "name": "shalshelet", "heb": "שַׁלְשֶׁ֓לֶת"}, {"char": "\u0596", "name": "tipkha", "heb": "טִפְחָ֖א"}, {"char": "\u059a", "name": "yetiv", "heb": "יְ֚תִיב"}, {"char": "\u0592", "name": "segol", "heb": "סְגוֹל֒"}, {"char": "\u05aa", "name": "yerakhbenyomo", "heb": "יֵרֶח בֶּן יוֹמ֪וֹ"}, {"char": "\u05ae", "name": "zarka", "heb": "זַרְקָא֮"}, {"char": "\u05a3", "name": "munakh", "heb": "מֻנַּ֣ח"}, {"char": "\u05a5", "name": "merkha", "heb": "מֵרְכָ֥א"}, {"char": "\u05a8", "name": "kadma", "heb": "קַדְמָ֨א"}, {"char": "\u0591", "name": "etnakhta", "heb": "אֶתְנַחְתָּ֑א"}, {"char": "\u05c3", "name": "sofpasuk", "heb": "סוֹף פָּסוּק׃"}, {"char": "\u0598", "name": "tsinnorit", "heb": "צִנּוֹרִת֘"}, {"char": "\u059c", "name": "geresh", "heb": "גֵּ֜רֵשׁ"}, {"char": "\u05a9", "name": "telishaketana", "heb": "תְּלִישָא קְטַנָּה֩"}, {"char": "\u05a7", "name": "darga", "heb": "דַּרְגָּ֧א"}, {"char": "\u05a1", "name": "pazer", "heb": "פָּזֵ֡ר"}, {"char": "\u05a4", "name": "mapakh", "heb": "מַהְפַּ֤ך"}, {"char": "\u0594", "name": "katan", "heb": "קָטָ֔ן"}], function(t) { return t.name });
// var treePreD3 = [];

var tropstrings;
var disaggregated;

var frombeginning = false;
var frombeginningprefix = function() { return frombeginning ? "^" : "" }

d3.json("tropstrings.json", function(root) {
    // jsonobj = root;
    tropstrings = root;

    // console.log(root);
    // root.forEach(function(r) {
    //     // console.log(r);
    //     nodes = nodes.concat(tree.nodes(r));
    // });
    // nodes = nodes.filter(function(d) { return d.depth == 0 });

    // go through and read in the root of each tree
    tropnames.forEach(function(t) {
        var node = {"name": tropnames.get(t).name, "char": tropnames.get(t).char, "heb": tropnames.get(t).heb};
        // console.log(node);
        var exp = RegExp(frombeginningprefix() + node.char, "g");
        node.count = d3.sum(tropstrings.filter(function(d) { return d.trop.search(exp) > -1 }).map(function(d) { return d.trop.match(exp).length }));
        // treePreD3.push(node);

        nodes = nodes.concat(tree.nodes(node)); // this needs to go inside the loop because each trop parent is a root
    });

    

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
        // todo: this shouldn't be necessary now because we haven't defined any children
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

var pos = function(d, i) {
    // var xPos = x(d.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
    // var yPos = i*(vspace + tree.nodeSize()[1]) - d.depth*(vspace + tree.nodeSize()[1]);

    // update these so we can use them when drawing links
    // d.x = xPos;
    // d.y = yPos;
    // return "translate(" + xPos + ", " + yPos + ")";
    return "translate(" + d.x + ", " + d.y + ")";
}

var oldypos = function(d) {
    // console.log(this.attributes);
    if(this.attributes.getNamedItem("transform")) {
        // console.log("hey");
        var t = this.attributes.getNamedItem("transform").nodeValue;
        var oldy = t.substring(t.indexOf(",") + 1, t.indexOf(")"));
    }
    else oldy = d.y;
    // console.log(d.prevy);
    return "translate(" + d.x + ", " + oldy + ")";
}

function update() {

    var node = svg.selectAll("g.node").data(nodes, function(d) { return d.name + "," + d.depth }); // .filter(function(d) { return d.depth <= 1 }).sort(tree.sort)
    
    var nodeenter = node.enter()
        .append("g")
            .attr("class", "node")
            // .attr("transform", pos)
            .on("click", nodeclick);
        // console.log(n);
    nodeenter.append("rect")
        .attr("class", "outerbox")
        .attr("width", tree.nodeSize()[0])
        .attr("height", tree.nodeSize()[1]);
        
        

    nodeenter.append("rect")
        .attr("class", "histbar")
        .attr("y", 0)
        .attr("height", tree.nodeSize()[1]);

    nodeenter.append("text")
        .attr("class", "tropchar")
        .attr("dx", 50)
        .attr("dy", tree.nodeSize()[1]/2+30)
        .text(function(d) { return " " + d.char; });


    nodeenter.append("text")
        .attr("class", "name")
        .attr("dy", tree.nodeSize()[1]/2 + 6)
        .text(function(d) { return d.heb ? d.heb : d.name; })
        .attr("dx", tree.nodeSize()[0] - 5);

    nodeenter.append("text")
        .attr("class", "count")
        .attr("dx", 4)
        .attr("dy", 26);

    nodeenter.append("text")
        .attr("class", "prob")
        .attr("dx", 4)
        .attr("dy", 12);


    node.select("rect.histbar")
        .attr("x", function(d) { return tree.nodeSize()[0] - tree.nodeSize()[0] * d.prob })
        .attr("width", function(d) { return tree.nodeSize()[0] * d.prob });

    node.select("text.count")
        .text(function(d) { return countformat(d.count); });

    node.select("text.prob")
        .text(function(d) { return probformat(d.prob); });

    // node.select("rect.outerbox")
    //     .attr("width", function(d) { return tree.nodeSize()[0] * (d.depth ? d.parent.prob : 1 ) } )
    //     .transition().duration(2000)
    //     .attr("width", tree.nodeSize()[0]);

    node
        // .attr("transform", function(d) {
        //     var translate;
        //     var scale = "scale(" + 0.2 + ")";
        //     if(d.depth) {
        //         translate = "translate(";
        //         translate += (d.parent.x - tree.nodeSize()[0] - tree.nodeSize()[0] * d.prob) + ",";
        //         translate += d.parent.y + ")";
        //     }
        //     else {
        //         translate = pos(d);
        //     }
        //     return translate + "," + scale;
        // })
        .attr("transform", oldypos)
        .transition().duration(250)
        .attr("transform", pos);

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
        .data(links, function(d) { return d.target.name + "," + d.target.depth })
    
    link.enter().append("path")
            .attr("class", "link");
            // .attr("transform", "translate(" + (tree.nodeSize()[1] + hspace) + ")"); // attempt to shift it, then shift it back
    link //.transition().duration(500)
        .attr("d", linkline);
        // .attr("transform", "translate(" + 0 + ")");
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

var ancestrynames = [];
function nodeclick(d) {
    ancestrynames = ancestry(d).split(",").reverse(); // the ancestry string is backwards, so I have to do this silly thing.
    // console.log(ancestrynames);
    // graph(ancestrynames.join(","));

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
        return n.depth <= d.depth;
    });

    var ancestorstring = ancestrynames.map(function(a) { return tropnames.get(a).char }).join("");
    if(d.children == undefined) { // it's never been calculated. I think this will always be true because collapse() now deletes children.
        var newchildren = [];
        
        // console.log(ancestrynames);
        tropnames.forEach(function(t) {
            var child = {"name": tropnames.get(t).name, "char": tropnames.get(t).char, "heb": tropnames.get(t).heb};
            var exp = RegExp(frombeginningprefix() + ancestorstring + child.char, "g");
            // console.log(child);
            
            // this line can do it in one line, but moving it out to a loop so we can also do sources for the graph at the same time
            child.count = d3.sum(tropstrings.filter(function(p) { return p.trop.search(exp) > -1 }).map(function(p) { return p.trop.match(exp).length }));
            // child.count = 0;
            

            child.depth = d.depth + 1;
            child.parent = d;
            // console.log(exp);
            // console.log(child);
            if(child.count > 0) newchildren.push(child);
        });

        // treePreD3.find(function() { return d }).children = children;
        var children = tree.nodes(newchildren); //.reverse();
        // console.log(children);
        // d.children = tree.nodes(children);
        d.children = children[0].sort(function(a,b) { return b.count - a.count });
        // console.log(d);
    }

    // do graph location data
    disaggregated = [];
    var exp = RegExp(frombeginningprefix() + ancestorstring, "g");
    tropstrings.forEach(function(p) {
        var pasukobj = new Object();
        pasukobj.sefer = p.sefer;
        pasukobj.perek = p.perek;
        pasukobj.pasuk = p.pasuk;
        pasukobj.numtrop = p.trop.length;
        
        var thematch = p.trop.match(exp);
        pasukobj.count = thematch ? thematch.length : 0;

        disaggregated.push(pasukobj);
    });

    // width = (d.depth + 1) * (tree.nodeSize()[0] + hspace) + tree.nodeSize()[0];
    // width = (d3.max(nodes.map(function(d) { return d.depth })) + 2) * (tree.nodeSize()[0] + hspace);

    if(d.children) { // this is the more general way of asking whether it's not a sof pasuk
        width = (d3.max(nodes.map(function(d) { return d.depth })) + 2) * (tree.nodeSize()[0] + hspace);
        x.domain([0, width]);
        x.range([width, 0]);
        svg.attr("width", width);

        nodes.forEach(function(n) {
            // n.x += tree.nodeSize()[0] + hspace;
            n.x = x(n.depth * (hspace + tree.nodeSize()[0])) - tree.nodeSize()[0];
            n.prevy = n.y;

            
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
        // expand(d);
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
            // d.prevy = d.y;
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

    if(d.children != null) {
        if(d.children.length == 1) {
            nodeclick(d.children[0]);
        }
    }
    // if(d._children != null) {
    //     if(d._children.length == 1) {
    //         nodeclick(d.children[0]);
    //     }
    // }
    graph();
}

// function collapse(d) {
//     if (d.children) {
//         d._children = d.children;
//         d._children.forEach(function(n) {
//             // d.clicked = false;
//             // d.disabled = false;
//             collapse(n);
//         });
//         d.children = null;
//     }
// }

// we can just recalculate it every time it gets re-clicked on
function collapse(d) {
    d.children = null;
}

// function expand(d) {
//     if (d._children) {
//         d.children = d._children.sort(function(a,b) { return b.count - a.count });
//         d.children.forEach(collapse);
//         d._children = null;
//     }
// }

// function regraph() {
//     // i feel like there's a way to do this in one line, but I can't think of it
//     var clicked = nodes.filter(function(d) { return d.clicked });
//     var maxclickeddepth = d3.max(clicked, function(d) { return d.depth });
//     var maxclicked = clicked.filter(function(d) { return d.depth == maxclickeddepth })[0];

//     nodeclick(maxclicked);
// }







//////////////// graph //////////////

var perekindex = ["bereshit,1","bereshit,2","bereshit,3","bereshit,4","bereshit,5","bereshit,6","bereshit,7","bereshit,8","bereshit,9","bereshit,10","bereshit,11","bereshit,12","bereshit,13","bereshit,14","bereshit,15","bereshit,16","bereshit,17","bereshit,18","bereshit,19","bereshit,20","bereshit,21","bereshit,22","bereshit,23","bereshit,24","bereshit,25","bereshit,26","bereshit,27","bereshit,28","bereshit,29","bereshit,30","bereshit,31","bereshit,32","bereshit,33","bereshit,34","bereshit,35","bereshit,36","bereshit,37","bereshit,38","bereshit,39","bereshit,40","bereshit,41","bereshit,42","bereshit,43","bereshit,44","bereshit,45","bereshit,46","bereshit,47","bereshit,48","bereshit,49","bereshit,50","shmot,1","shmot,2","shmot,3","shmot,4","shmot,5","shmot,6","shmot,7","shmot,8","shmot,9","shmot,10","shmot,11","shmot,12","shmot,13","shmot,14","shmot,15","shmot,16","shmot,17","shmot,18","shmot,19","shmot,20","shmot,21","shmot,22","shmot,23","shmot,24","shmot,25","shmot,26","shmot,27","shmot,28","shmot,29","shmot,30","shmot,31","shmot,32","shmot,33","shmot,34","shmot,35","shmot,36","shmot,37","shmot,38","shmot,39","shmot,40","vayikra,1","vayikra,2","vayikra,3","vayikra,4","vayikra,5","vayikra,6","vayikra,7","vayikra,8","vayikra,9","vayikra,10","vayikra,11","vayikra,12","vayikra,13","vayikra,14","vayikra,15","vayikra,16","vayikra,17","vayikra,18","vayikra,19","vayikra,20","vayikra,21","vayikra,22","vayikra,23","vayikra,24","vayikra,25","vayikra,26","vayikra,27","bmidbar,1","bmidbar,2","bmidbar,3","bmidbar,4","bmidbar,5","bmidbar,6","bmidbar,7","bmidbar,8","bmidbar,9","bmidbar,10","bmidbar,11","bmidbar,12","bmidbar,13","bmidbar,14","bmidbar,15","bmidbar,16","bmidbar,17","bmidbar,18","bmidbar,19","bmidbar,20","bmidbar,21","bmidbar,22","bmidbar,23","bmidbar,24","bmidbar,25","bmidbar,26","bmidbar,27","bmidbar,28","bmidbar,29","bmidbar,30","bmidbar,31","bmidbar,32","bmidbar,33","bmidbar,34","bmidbar,35","bmidbar,36","dvarim,1","dvarim,2","dvarim,3","dvarim,4","dvarim,5","dvarim,6","dvarim,7","dvarim,8","dvarim,9","dvarim,10","dvarim,11","dvarim,12","dvarim,13","dvarim,14","dvarim,15","dvarim,16","dvarim,17","dvarim,18","dvarim,19","dvarim,20","dvarim,21","dvarim,22","dvarim,23","dvarim,24","dvarim,25","dvarim,26","dvarim,27","dvarim,28","dvarim,29","dvarim,30","dvarim,31","dvarim,32","dvarim,33","dvarim,34"];

var graphMargin = {left: 20, right: 66, top: 55, bottom: 18};
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
    .range([graphHeight-graphMargin.top-graphMargin.bottom, 0]);
var barwidth = graphx.rangeBand();

var xAxis = d3.svg.axis()
    .scale(graphx)
    .orient("bottom")
    .innerTickSize(3)
    .outerTickSize(0)
    .tickValues(["bereshit,1", "shmot,1", "vayikra,1", "bmidbar,1", "dvarim,1"])
    .tickFormat(function(t) {
        if(t == "bereshit,1") return "בראשית";
        else if(t == "shmot,1") return "שמות";
        else if(t == "vayikra,1") return "ויקרא";
        else if(t == "bmidbar,1") return "במדבר";
        else if(t == "dvarim,1") return "דברים";
        else return t;
    });

var xaxisg = graphsvg.append("g")
    .attr("transform", "translate(" + graphMargin.left + ", " + (graphHeight - graphMargin.bottom) + ")")
    .attr("height", graphMargin.bottom)
    .call(xAxis);


var tooltipvmargin = 4;
var tooltiphpadding = 4;
var tooltipg = graphsvg.append("g")
    .attr("class", "tooltips")
    .attr("height", graphMargin.top)
    .attr("transform", "translate(" + graphMargin.left + "," + tooltipvmargin + ")");

// var graphcontrolWidth = 180;
// var graphcontrols = graphsvg.append("g")
//     .attr("class", "graphcontrols")
//     .attr("transform", "translate(" + (graphWidth - (graphcontrolWidth + tooltiphpadding)) + ", " + (-tooltipvmargin) + ")");

// graphcontrols.append("rect")
//     .attr("class", "graphcontrolbox")
//     .attr("width", graphcontrolWidth)
//     .attr("height", 25)
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("rx", 5)
//     .attr("ry", 5);

// var normbox = graphcontrols.append("rect")
//     .attr("class", "graphcontrolhiddenbox")
//     .attr("height", 20)
//     .datum("norm")
//     .on("click", switchYvalue);

// var normtext = graphcontrols.append("text")
//     .text("Per Perek");
// normbox.attr("width", normtext[0][0].getComputedTextLength());

// var countbox = graphcontrols.append("rect")
//     .attr("class", "graphcontrolhiddenbox")
//     .attr("height", 20)
//     .datum("count")
//     .on("click", switchYvalue);

// var counttext = graphcontrols.append("text")
//     .text("Counts");
// countbox.attr("width", counttext[0][0].getComputedTextLength());

// var perperekcontrol = graphcontrols.append("path")
//     .datum("norm")
//     .attr("d", "M 0,0 L 50,0")
    // .on("click", switchYvalue)

// .append("text")
//         .text("Per Perek");

// graphcontrols.append("text")
//     .attr("transform", "translate(" + (-perperekcontrol[0][0].getComputedTextLength() - 10) + ")")
//     .text("Counts")
//     .datum("count")
//     .on("click", switchYvalue);

var byperekdata;
// d3.json("byperek_full.json", function(byperekjson) {
//     byperekdata = d3.map(byperekjson, function(d) { return d.seq });
// });

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

var yValue = "norm";
function graph() {
    // var data = byperekdata.get(seq).sources;
    var data = aggregate(disaggregated, "perek"); // aggregate by perek
    var bar = barg.selectAll("rect.bar").data(data, function(d) { return d.key });
    // console.log(data);

    graphy.domain([0, d3.max(data.map(function(d) { return d.values[yValue] }))]);        

    var barenter = bar.enter()
        // .append("a")
        //     .attr("xlink:href", function(d) { return "http://www.sefaria.org/" + linkformat(d.key) })
            .append("rect")
                .attr("class", "bar")
                .attr("width", barwidth)
                .attr("x", function(d) { return graphx(d.key) })
                .attr("y", function(d) { return graphy(d.values[yValue]) })
                .attr("height", function(d) { return (graphHeight-graphMargin.bottom-graphMargin.top) - graphy(d.values[yValue]) })
                .on("mouseover", dotooltip)
                .on("mouseout", function(d) { tooltipg.selectAll("g.mytooltip").remove()})
                .on("click", graphclick);


    // bar
    //     .attr("title", function(d) { return d.index })
    bar.transition().duration(250)
        .attr("y", function(d) { return graphy(d.values[yValue]) })
        .attr("height", function(d) { return (graphHeight-graphMargin.bottom-graphMargin.top) - graphy(d.values[yValue]) });

    bar.exit().transition().duration(250)
        .attr("height", 1)
        .attr("y", graphHeight-graphMargin.bottom-graphMargin.top);
}

// function initgraph() {
//     var initdata = perekindex.map(function(i) { return { index: i, norm: 0 }});
//     graphUpdate(initdata);
// }

function aggregate(data, by) {
    var aggregated;
    if(by == "perek") {
        aggregated = d3.nest()
            .key(function(d) { return d.sefer+","+d.perek })
            // .key(function(d) { return d.perek })
            .rollup(function(l) {
                // console.log(l);
                var countsum = d3.sum(l, function(d) { return d.count });
                // var normdenominator = d3.sum(l, function(d) { return d.numtrop });
                var normdenominator = l.length;
                return {"sefer": l[0].sefer, "perek": l[0].perek, "count": countsum, "norm": countsum/normdenominator}
            })
            .entries(disaggregated)
    }

    return aggregated;


}

var normformat = d3.format(".2f");
function dotooltip(d) {
    tooltipg.selectAll("g.mytooltip").remove();
    var tooltip = tooltipg.append("g")
        .attr("class", "mytooltip")
        .attr("direction", "ltr");
        // .attr("transform", "translate(" + graphx(d.index) + ")")

    var ttbgrect = tooltip.append("rect").attr("class", "mytooltip")
        .attr("rx", 4)
        .attr("ry", 4);

    var locationtext = tooltip.append("text")
        .text(locationformat(d.key))
        .attr("transform", "translate(" + tooltiphpadding + "," + 13 + ")")
        .attr("class", "location");
    
    var occurrencestext = tooltip.append("text")
        .text(d.values.count + (d.values.count == 1 ? " occurrence" : " occurrences"))
            .attr("transform", "translate(" + tooltiphpadding + "," + 27 + ")");
    var normtext = tooltip.append("text")
        .text(normformat(d.values.norm) + " per pasuk")
            .attr("transform", "translate(" + tooltiphpadding + "," + 41 + ")");

    var ttwidth = occurrencestext[0][0].getComputedTextLength() > normtext[0][0].getComputedTextLength() ? occurrencestext[0][0].getComputedTextLength() : normtext[0][0].getComputedTextLength();
    ttbgrect
        .attr("width", ttwidth + 2*tooltiphpadding)
        .attr("height", graphMargin.top - 2*tooltipvmargin);

    tooltip.attr("transform", "translate(" + (graphx(d.key) - ttwidth/2) + ")");
}

// init the modal
// $(function() {
//     $("#detailoutercontainer").easyModal({
//         // hasVariableWidth: true,
//         // top: 100
//     });
// });
function graphclick(d) {
    var pasuklist = disaggregated.filter(function(p) { return p.sefer == d.values.sefer && p.perek == d.values.perek && p.count > 0 });
    console.log(pasuklist);
    /*var detailsDiv = d3.select("#detailoutercontainer").append("div")
        .attr("id", "detailcontainer")
        .append("div")
            .attr("id", "details");

    // detailsDiv.append("p").html(pasuklist[0].pasuk);
    pasuklist.forEach(function(p) {
        detailsDiv.append("p").html(p.sefer + " " + p.perek + " " + p.pasuk);
    });

    d3.select("body")
        .on("keydown", function(e) {
            // e.preventDefault();
            // console.log(d3.event);
            if(d3.event.keyCode == 27) {
                d3.select("#detailcontainer").remove();
                d3.select("body").on("keydown", null);
            }
        });*/

    d3.select("#detailsModalLabel").html(locationformat(d.key));
    d3.select("#currentSearch").html(ancestrynames.map(function(d) { return tropnames.get(d).heb; } ).join(" "));
    // d3.select("#details").html("loading...");
    $("#detailsModal").modal("show");

    var textlist = [];
    // http://www.sefaria.org/api/texts/Exodus.16?lang=he&commentary=0&context=0
    d3.jsonp("http://www.sefaria.org/api/texts/" + linkformat(d.key) + "?lang=he&commentary=0&context=0&callback={callback}", function(r) {
        textlist = d3.map(r.he.map(function(t,p) { return {'pasuk': p+1, 'text': t}}), function(p) { return p.pasuk });
        console.log(textlist);

        pasuklist.forEach(function(p) {
            console.log(p.pasuk, textlist[p.pasuk]);
            d3.select("#details").append("tr").html("<td class='pasuknum'>" + p.pasuk + "</td><td class='pasuktext'>" + textlist.get(p.pasuk).text + "</td>"); //p.sefer + " " + p.perek + " " + p.pasuk);
        });
        // $("#detailoutercontainer").trigger("openModal");
    });
}


function switchYvalue(d) {
    console.log(d);
    yValue = d.value;
    graph();
}
d3.selectAll(".graphValues")
    .datum(function() { return this.dataset; })
    .on("change", switchYvalue);

var locationformat = function(t) {
    var split = t.split(",");

    var sefer;
    if(split[0] == "bereshit") sefer = "בראשית"; // "Bereshit";
    else if(split[0] == "shmot") sefer = "שמות"; // "Shmot";
    else if(split[0] == "vayikra") sefer = "ויקרא"; // "Vayikra";
    else if(split[0] == "bmidbar") sefer = "במדבר"; // "B’midbar";
    else if(split[0] == "dvarim") sefer = "דברים"; // "D’varim";

    return sefer + " " + split[1];
}

var linkformat = function(t) {
    var split = t.split(",");

    var sefer;
    if(split[0] == "bereshit") sefer = "Genesis";
    else if(split[0] == "shmot") sefer = "Exodus";
    else if(split[0] == "vayikra") sefer = "Leviticus";
    else if(split[0] == "bmidbar") sefer = "Numbers";
    else if(split[0] == "dvarim") sefer = "Deuteronomy";

    return sefer + "." + split[1];
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

    d3.select("#cog")
        .style({"top": (window.innerHeight - graphHeight - 48) + "px"});
});


d3.select("#cog")
    .style({"top": (window.innerHeight - graphHeight - 48) + "px"});








// $(function() {
//     $("#prefs").easyModal({
//         // hasVariableWidth: true,
//         // top: 100
//     });
// });

// d3.select("#cog").on("click", function() {
//     $("#prefs").trigger("openModal");
// });















































//     jsonobj = root;

//     // this gives the correct answer to how many munakh reviis there are, and it's fast:
//     // d3.sum(jsonobj.filter(function(d) { return d.trop.search(/\u05a3\u0597/) > -1 }).map(function(d) { return d.trop.match(/\u05a3\u0597/g).length }))
// });

