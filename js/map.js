/**
 * Created by Kong on 4/20/2017.
 */
var mapDiv = d3.select('.map');
var width = 1380;
var height = 0.35 * width;
var plotCenter = [ width/2, height/2 ];
var initialLongitude = -95;            // Initial longitude to center
var latitudeBounds = [ -80, 84 ];      // Maximum latitude to display

var projection = d3.geo.mercator().rotate([-initialLongitude, 0])    // Rotate the initial longitude to center
    .scale(1)                          // We'll scale up to match the viewport shortly
    .translate(plotCenter)
    .center([0, 10]);

var viewMin = [ 0, 0 ];
var viewMax = [ 0, 0 ];
// The following variables track the last processed event.
var translateLast = [0,0];
var scaleLast     = null;

var marks = []; //Longitude and latitude
var danceInfo = [];
var countryId = [];
var danceDescription = [];
var videoUrl = [];

var path,svg,map;

var solomarks = [];
var solodanceInfo = [];
var couplemarks = [];
var coupledanceInfo = [];
var groupmarks = [];
var groupdanceInfo = [];

var ballmarks = [];
var balldanceInfo = [];
var folkmarks = [];
var folkdanceInfo = [];
var ceremarks = [];
var ceredanceInfo = [];
var stmarks = [];
var stdanceInfo = [];
var conctmarks = [];
var conctdanceInfo = [];
var easymarks = [];
var easydanceInfo = [];
var medmarks = [];
var meddanceInfo = [];
var diffmarks = [];
var diffdanceInfo = [];
var wholemarks = [];
var wholedanceInfo = [];
var yrs = [];
var danceName = [];

function wholemap()
{

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

    projection.scale(scaleExtent[0]);         // Set up projection to minimium zoom

    path = d3.geo.path().projection(projection);

    svg = mapDiv.append('svg')      // Set up map SVG element
        .attr('id', "map")
        .attr('width',width)
        .attr('height',height);

    map = svg.append('g');          // Map Group

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

    var legendDiv1 = d3.select('.legend1');
    var legendDiv2 = d3.select('.legend2');
    var legendsvg1 = legendDiv1.append('svg').attr('height',10).attr('width',10).style("opacity",0.95).style("fill","green").style("border","0px");
    var legendsvg2 = legendDiv2.append('svg').attr('height',10).attr('width',10).style("opacity",0.95).style("fill","green").style("border","0px");
    legendsvg1.append("rect").attr("class","overlay").attr("x",0).attr("y",0).attr("height",10).attr("width",10).style("fill","#ff9900").style("opacity",0.95);
    legendsvg2.append("rect").attr("class","overlay").attr("x",0).attr("y",0).attr("height",10).attr("width",10).style("fill","#ff3399").style("opacity",0.95);

    // Load map data
    d3.json("data/world-110m.json", function (error, world) {

        map.selectAll('path')
            .data(topojson.feature(world, world.objects.countries).features)
            .enter()
            .append('path');

        render();
    });



    d3.json("data/danceform.json", function(error, d){
        var index = 0;
        for(var i in d) {

            var item = d[i];
            var y = String(item.Year);

            if(y.includes("BC"))
            {	yrs.push(Number(0));	}
            else
            {	yrs.push(Number(item.Year));	}

            marks.push({
                "lat" : item.Latitude,
                "long"  : item.Longitude
            });

            danceInfo.push({
                "id": item.Country,
                "name" : item.Name,
                "year" : yrs[index],
                "description": item.Description
            });
            index = index + 1;
            countryId.push(item.Country);
            danceDescription.push(item.Description);
            videoUrl.push(item.Video);
            danceName.push(item.Name);
        }

        render();
    });

    d3.json("data/danceform.json", function(error, d){
        var yr = 0;
        for(var i in d) {

            var item = d[i];
            if(String(item.Year).includes("BC"))
            {	yr = 0;	}
            else
            {	yr = Number(item.Year);	}
            wholemarks.push({
                "lat" : item.Latitude,
                "long"  : item.Longitude
            });

            wholedanceInfo.push({
                "id": item.Country,
                "name" : item.Name,
                "year": yr,
                "description": item.Description
            });

            if( (item.Participation=="Solo") || (item.Participation=="Solo,Group") )
            {
                solomarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                solodanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Participation=="Partner") )
            {
                couplemarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                coupledanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "description": item.Description
                });
            }
            if( (item.Participation=="Group") || (item.Participation=="Solo,Group")  )
            {
                groupmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                groupdanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Category=="Ballroom") || (item.Category=="Ballroom,Folk") )
            {
                ballmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                balldanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Category=="Folk") || (item.Category=="Ballroom,Folk") || (item.Category=="Folk,Ceremonial") )
            {
                folkmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                folkdanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Category=="Ceremonial") || (item.Category=="Folk,Ceremonial") )
            {
                ceremarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                ceredanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Category=="Street") )
            {
                stmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                stdanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Category=="Concert") )
            {
                conctmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                conctdanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Difficulty=="Easy") )
            {
                easymarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                easydanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Difficulty=="Medium") )
            {
                medmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                meddanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
            if( (item.Difficulty=="Difficult") )
            {
                diffmarks.push({
                    "lat" : item.Latitude,
                    "long"  : item.Longitude
                });
                diffdanceInfo.push({
                    "id": item.Country,
                    "name": item.Name,
                    "year": yr,
                    "description": item.Description
                });
            }
        }
    });

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function render() {
        map.selectAll('path')       // Redraw all map paths
            .attr('d', path);

        d3.selectAll("image").remove();
        d3.selectAll("text").remove();


        var circles = svg.append("g")
            .attr("class", "group");

        circles.selectAll("text")
            .data(marks)
            .enter()
            .append("text")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("fill", function(d,i) { return coloryears(danceInfo[i].year);})
            .attr("x", function(d) {
                return projection([d.long, d.lat])[0] -14.7;
            })
            .attr("y", function(d) {
                return projection([d.long, d.lat])[1] -14.7;
            })
            .text(function(d,i) {
                return danceInfo[i].name;
            });


        circles.selectAll("image")
            .data(marks)
            .enter()
            .append("image")
            .attr("xlink:href","images/icon.png ")
            .attr("class", "icons")
            .attr("id", function (d, i) {
                return danceInfo[i].id
            })
            .attr("height", 25)
            .attr("width", 25)
            .attr("x", function(d) {
                return projection([d.long, d.lat])[0] -15;
            })
            .attr("y", function(d) {
                return projection([d.long, d.lat])[1] -15;
            })
            .attr("r", 5)
            .on('click', function(d,i){
                document.getElementById("map").setAttribute("width", "900px");
                document.getElementById("map").setAttribute("height", "500px");
                document.getElementById("name").innerHTML = danceInfo[i].name;
                document.getElementById("pop").innerHTML = "";


                var description = document.createTextNode(danceDescription[countryId.indexOf(this.id)]);
                $("#description").html("");
                $("#description").html(description);
                updateVideo(this.id);
            })

            .on("mouseover", function (d) {
                div.transition()
                    .duration(100)
                    .style("opacity", .9);
                div.html(this.id)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY -28) + "px");
            })

            .on("mouseout", function(d) {
                div.transition()
                    .duration(100)
                    .style("opacity", 0);
            });
    }

    function updateVideo(id) {

        document.getElementById("right").style.display = "block";
        document.getElementById("videoTag").src = videoUrl[countryId.indexOf(id)];
        d3.select(".legend").style("opacity",0);
        d3.select(".legend1").style("opacity",0);
        d3.select(".legend2").style("opacity",0);
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
}
function dstyle(flag)
{
    document.getElementById("pop").style.display = "None";
    d3.selectAll("image").remove();
    d3.selectAll("text").remove();
    var circles = svg.append("g")
        .attr("class", "group");
    var temp_marks,temp_danceInfo;
    if(flag=="0")
    {
        temp_marks = solomarks;
        temp_danceInfo = solodanceInfo;
    }
    if(flag=="1")
    {
        temp_marks = couplemarks;
        temp_danceInfo = coupledanceInfo;
    }
    if(flag=="2")
    {
        temp_marks = groupmarks;
        temp_danceInfo = groupdanceInfo;
    }
    if(flag=="3")
    {
        temp_marks = ballmarks;
        temp_danceInfo = balldanceInfo;
    }
    if(flag=="4")
    {
        temp_marks = folkmarks;
        temp_danceInfo = folkdanceInfo;
    }
    if(flag=="5")
    {
        temp_marks = groupmarks;
        temp_danceInfo = groupdanceInfo;
    }
    if(flag=="6")
    {
        temp_marks = groupmarks;
        temp_danceInfo = groupdanceInfo;
    }
    if(flag=="7")
    {
        temp_marks = groupmarks;
        temp_danceInfo = groupdanceInfo;
    }
    if(flag=="8")
    {
        temp_marks = easymarks;
        temp_danceInfo = easydanceInfo;
    }
    if(flag=="9")
    {
        temp_marks = medmarks;
        temp_danceInfo = meddanceInfo;
    }
    if(flag=="10")
    {
        temp_marks = diffmarks;
        temp_danceInfo = diffdanceInfo;
    }
    if(flag=="20")
    {
        temp_marks = wholemarks;
        temp_danceInfo = wholedanceInfo;
        d3.select(".legend").style("opacity",1);
        d3.select(".legend1").style("opacity",1);
        d3.select(".legend2").style("opacity",1);
    }
    marks = temp_marks;
    danceInfo = temp_danceInfo;
    circles.selectAll("text")
        .data(temp_marks)
        .enter()
        .append("text")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", function(d,i) { return coloryears(temp_danceInfo[i].year);})
        .attr("x", function(d) {
            return projection([d.long, d.lat])[0] -14.7;
        })
        .attr("y", function(d) {
            return projection([d.long, d.lat])[1] -14.7;
        })
        .text(function(d,i) {
            return temp_danceInfo[i].name;
        });

    circles.selectAll("image")
        .data(temp_marks)
        .enter()
        .append("image")
        .attr("xlink:href","images/icon.png ")
        .attr("class", "icons")
        .attr("id", function (d, i) {
            return temp_danceInfo[i].id;
        })
        .attr("height", 25)
        .attr("width", 25)
        .attr("x", function(d) {
            return projection([d.long, d.lat])[0] -15;
        })
        .attr("y", function(d) {
            return projection([d.long, d.lat])[1] -15;
        })
        .attr("r", 5)
        .on('click', function(d, i){
            document.getElementById("map").setAttribute("width", "900px");
            document.getElementById("map").setAttribute("height", "500px");
            document.getElementById("name").innerHTML = danceInfo[i].name;
            document.getElementById("pop").innerHTML = "";
            d3.select(".legend").style("opacity",0);
            d3.select(".legend1").style("opacity",0);
            d3.select(".legend2").style("opacity",0);

            var description = document.createTextNode(danceDescription[countryId.indexOf(this.id)]);
            $("#description").html("");
            $("#description").html(description);
            document.getElementById("right").style.display = "block";
            document.getElementById("videoTag").src = videoUrl[countryId.indexOf(this.id)];

        });

}
function contact()
{
    document.getElementById("right").style.display = "None";
    document.getElementById("name").innerHTML = "";
    document.getElementById("description").innerHTML= "";
    document.getElementById("videoTag").src = "";
    document.getElementById("pop").style.display = "block";
    document.getElementById("map").setAttribute("width", "900px");
    document.getElementById("map").setAttribute("height", "500px");
    document.getElementById("right").style.display = "block";
    document.getElementById("pop").innerHTML = "Team Members : Anusha Chowdhury(ac2633), Yitong Gao(yg398), Kong Hu(zh299)";
}
function instruct()
{
    document.getElementById("right").style.display = "None";
    document.getElementById("name").innerHTML = "";
    document.getElementById("description").innerHTML = "";
    document.getElementById("videoTag").src = "";
    document.getElementById("pop").style.display = "block";
    document.getElementById("map").setAttribute("width", "900px");
    document.getElementById("map").setAttribute("height", "500px");
    document.getElementById("right").style.display = "block";
    var str = "WELCOME to our world of 20 interesting dance forms. \
		Instructions to interact : To know more about each dance form, click on the icons one by one.\
		To zoom into the map, double click at that spot. \
		To travel through the map, just click and drag the mouse through the map.   \
		To classify dance forms based on style, category or difficulty level, use the dropdown menus.\
		To go back to the first map with all the dances, click Home. Year of Origin is shown with binary colors. THANK YOU for visiting our dance world!!";
    document.getElementById("pop").style.font = "italic bold 20px arial,serif";
    document.getElementById("pop").innerHTML = str;

}
function coloryears(x)
{

    var myData = yrs.sort();
    var sc = d3.scale.quantize().domain(myData).range(["#ff9900", "#ff3399"]);

    return sc(x);
}