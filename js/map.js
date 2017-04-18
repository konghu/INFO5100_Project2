/**
 * Created by Kong on 4/17/2017.
 */

var mapDiv = d3.select('.map');
// var width  = mapDiv.node().getBoundingClientRect().width;
var width = 1380;
var height = 0.35 * width;
var plotCenter = [ width/2, height/2 ];

var initialLongitude = -95;            // Initial longitude to center
var latitudeBounds = [ -80, 84 ];      // Maximum latitude to display

var projection = d3.geo.mercator()
    .rotate([-initialLongitude, 0])    // Rotate the initial longitude to center
    .scale(1)                          // We'll scale up to match the viewport shortly
    .translate(plotCenter)
    .center([0, 10]);

var viewMin = [ 0, 0 ];
var viewMax = [ 0, 0 ];

function updateProjectionBounds () {
    // Updates the view top left and bottom right with the current projection.
    var yaw = projection.rotate()[0];
    var longitudeHalfRotation = 180.0 - 1e-6;

    viewMin = projection([-yaw - longitudeHalfRotation, latitudeBounds[1]]);
    viewMax = projection([-yaw + longitudeHalfRotation, latitudeBounds[0]]);
}

updateProjectionBounds();

// Set up the scale extent and initial scale for the projection.
var s = width / (viewMax[0] - viewMin[0]);
var scaleExtent = [s, 50*s];        // The minimum and maximum zoom scales

projection
    .scale(scaleExtent[0]);         // Set up projection to minimium zoom

var path = d3.geo.path()            // Map Geometry
    .projection(projection);

var svg = mapDiv.append('svg')      // Set up map SVG element
    .attr('id', "map")
    .attr('width',width)
    .attr('height',height)

var map = svg.append('g');          // Map Group

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

var zoom = d3.behavior.zoom()       // Set up zoom
    .size([width,height])
    .scaleExtent(scaleExtent)
    .scale(projection.scale())
    .on("zoom", handlePanZoom);

svg.call(zoom);                     // Attach zoom event

// Load map data
d3.json("data/world-110m.json", function (error, world) {

    map.selectAll('path')
        .data(topojson.feature(world, world.objects.countries).features)
        .enter()
        .append('path');

    render();
});

// The following variables track the last processed event.
var translateLast = [0,0];
var scaleLast     = null;


function render() {
    map.selectAll('path')       // Redraw all map paths
        .attr('d', path);

    var g = svg.append("g");
    var marks = [{long: -75, lat: 43},{long: -78, lat: 41},{long: -70, lat: 53}];


    d3.selectAll(".icons")
        .remove();

    g.selectAll("circle")
        .data(marks)
        .enter()
        // .append("a")
        .append("circle")
        .attr("class", "icons")
        .attr("cx", function(d) {
            return projection([d.long, d.lat])[0];
        })
        .attr("cy", function(d) {
            return projection([d.long, d.lat])[1];
        })
        .attr("r", 5)
        .on('click', function(d){
            console.log("sbsb");
            document.getElementById("map").setAttribute("width", "900px")
            document.getElementById("map").setAttribute("height", "400px")
            document.getElementById("right").style.visibility = "visible";
        })
        .style("fill", "red");
}

function handlePanZoom() {
    // Handle pan and zoom events

    var scale = zoom.scale();
    var translate = zoom.translate();

    // If the scaling changes, ignore translation (otherwise touch zooms are weird).
    var delta = [ translate[0] - translateLast[0], translate[1] - translateLast[1] ];
    if (scale != scaleLast) {
        projection.scale(scale);
    } else {
        var longitude = projection.rotate()[0];
        var tp = projection.translate();

        // Use the X translation to rotate, based on the current scale.
        longitude += 360 * (delta[0] / width) * (scaleExtent[0] / scale);
        projection.rotate ([longitude, 0, 0]);

        // Use the Y translation to translate projection, clamped by min/max
        updateProjectionBounds();

        if (viewMin[1] + delta[1] > 0)
            delta[1] = -viewMin[1];
        else if (viewMax[1] + delta[1] < height)
            delta[1] = height - viewMax[1];

        projection.translate ([ tp[0], tp[1] + delta[1] ]);
    }

    // Store the last transform values. NOTE: Resetting zoom.translate() and zoom.scale()
    // would seem equivalent, but it doesn't seem to work reliably.
    scaleLast = scale;
    translateLast = translate;

    render();
}

