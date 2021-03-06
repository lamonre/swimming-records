//ALL SWIMMERS
var margin = {t:5,r:0,b:5,l:0};
var width = d3.select('#allSwimmers').node().clientWidth - margin.r - margin.l,
    height = d3.select('#allSwimmers').node().clientHeight - margin.t - margin.b;


var canvasAllSwimmers = d3.select('#allSwimmers')
    .append('canvas')
    .attr("id","allrecordsViz")
    // .attr('width',width)
    // .attr('height',height)
    .node();

canvasAllSwimmers.width = 2 * width;
canvasAllSwimmers.height = 2 * height;

var ctx = canvasAllSwimmers.getContext("2d");

var canvasALL = document.getElementById("allrecordsViz");


var widthb = d3.select('#eventPlot').node().clientWidth - margin.r - margin.l,
    heightb = d3.select('#eventPlot').node().clientHeight - margin.t - margin.b;

var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();


var sBrowser, sUsrAg = navigator.userAgent;

if(sUsrAg.indexOf("Chrome") > -1) {
    sBrowser = "Google Chrome";
} else if (sUsrAg.indexOf("Safari") > -1) {
    sBrowser = "Apple Safari";
} else if (sUsrAg.indexOf("Opera") > -1) {
    sBrowser = "Opera";
} else if (sUsrAg.indexOf("Firefox") > -1) {
    sBrowser = "Mozilla Firefox";
} else if (sUsrAg.indexOf("MSIE") > -1) {
    sBrowser = "Microsoft Internet Explorer";
}

var screenMode = 'screen';

if (sBrowser === "Mozilla Firefox"){
    screenMode = 'normal';
}



var myReq;
var today = new Date ();
var seconds = today.getSeconds();

var formatDate = d3.timeFormat("%B %d, %Y"),
    formatDate2 = d3.timeFormat("%b %d, %Y"),
    formatYear = d3.timeFormat("%Y"),
    formatSpeed = d3.format(".2f"),
    scaleColor = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]),
    mySize = 2,
    startingPoint = 60,
    endPoint = width-50;
    topPoint = 50,
    scaleX = d3.scaleLinear().range([startingPoint, endPoint]),
    scaleY = d3.scaleTime().range([topPoint,height-10]);


swimmerDispatch = d3.dispatch('selectswimmer');
swimmerDispatch2 = d3.dispatch('selectswimmer2');

var typeOfMultiple;

var btnControl;
var btnControl2;
var tooltip = null;
//var drawMultiples = null;

var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 100 m medley relay","4 x 200 m freestyle relay"]

//TODO: import data, parse, and draw
//d3.csv("data/20161106-swimming-times.csv", parseData, draw1);

var queue = d3_queue.queue()
    .defer(d3.csv,'data/data.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .await(draw);


function draw (err, rows, types, swimmers) {

    d3.select(".swimmer-list").on("change", function () {swimmerDispatch.call("selectswimmer", this, this.value);});
    d3.select(".swimmer-list2").on("change", function () {swimmerDispatch2.call("selectswimmer2", this, this.value);});


    var date1and2 = d3.extent(rows.map(function (d) {return d.date}));

    var firstRecord = date1and2[0];
    var lastRecord = date1and2[1];

    //FILTERS
    var data = rows.sort(function(a,b){return a.date - b.date}),
        swims = crossfilter (data),
        swimsByEvent = swims.dimension(function(d){return d.event}),
        swimsBySwimmer = swims.dimension(function(d){return d.name}),
        x = 0;

    var swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);

    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});
    var speedExtent = d3.extent(data.map(function (d) {return d.speed}));
    var speedScale = d3.scaleLinear().domain(speedExtent).range([1,4]);
    var dateExtent = d3.extent(data.map(function (d) {return d.date}));

    //y = always, speed dif. depending on TIME
    scaleY = scaleY.domain(dateExtent);

    scaleX = scaleX.domain([0,50]);

    data.forEach(function(d,i){
        d.xPos = startingPoint;
        d.yPos = scaleY(d.date);
    });

    data.sort(function(a,b){return b.speed - a.speed});
    console.log(data);

    //drawSwimmers ();

    //var xPos = 0;
    var mySpeed = "";

    //ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'normal';
    ctx.scale(2,2);
    ctx.fillStyle = "#192F38";
    ctx.fillRect(0,0,width,height);

    drawSwimmers();

    function drawSwimmers (){
        //ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'normal';
        ctx.fillStyle = "#192F38";
        ctx.scale(1,1);
        ctx.fillRect(0,0,width,height);

        //Y axis
        var years = [firstRecord,new Date(1920,1,1),new Date(1940,1,1),new Date(1960,1,1),new Date(1980,1,1),new Date(2000,1,1),lastRecord];
        years.forEach(function(d){
            ctx.beginPath();
            ctx.textAlign = "left";
            ctx.fillStyle ="#758288";
            ctx.font ="600 13px Raleway";
            ctx.textBaseline = "middle";
            ctx.fillText(formatYear(d),0,scaleY(d));
            ctx.fillStyle = "none";
            ctx.strokeStyle = "#475960";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 2]);
            ctx.moveTo(startingPoint-20,scaleY(d));
            ctx.lineTo(endPoint+mySize+5,scaleY(d));
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.fillStyle ="#758288";
        ctx.font ="600 13px Raleway";
        ctx.textAlign = "left";
        ctx.fillText("Years",0,topPoint-35);
        ctx.fillText("Start (0 m)",startingPoint,topPoint-35);
        ctx.textAlign = "right";
        ctx.fillText("End (50 m)",(endPoint+mySize+1),topPoint-35);
        ctx.fillStyle = "none";
        ctx.strokeStyle = "#475960";
        ctx.lineWidth = 1;
        ctx.setLineDash([0, 0]);
        ctx.moveTo(startingPoint,height);
        ctx.lineTo(startingPoint,(topPoint-20));
        ctx.stroke();
        ctx.moveTo((endPoint+mySize+1),height);
        ctx.lineTo((endPoint+mySize+1),(topPoint-20));
        ctx.stroke();
        ctx.closePath();

        var myYPOS;
        var size;


        ctx.globalCompositeOperation = screenMode;

        //Loop over the dataset and draw each circle to the canvas
        for (var i = 0; i < data.length; i++) {
            var swimmer = data[i];
            var aleatory = noise.simplex2(swimmer.xPos/10, swimmer.yPos)*mySpeed-mySpeed*2;
            var mySpeed = 20*(swimmer.speed*50)/endPoint;

            if (data[data.length-1].xPos==endPoint){
                swimmer.xPos = startingPoint;
            }if (swimmer.xPos>0 && swimmer.xPos<endPoint){
                swimmer.xPos = swimmer.xPos + mySpeed;
                myYPOS = swimmer.yPos  + aleatory;
                size = mySize;
            }else{
                swimmer.xPos = endPoint;
                myYPOS = swimmer.yPos;
                size = Math.random() * (mySize*1.1 - mySize/2) + mySize*1.1;
            };

            //Draw each circle
            ctx.beginPath();
            ctx.fillStyle = scaleColor(swimmer.sex);
            ctx.arc(swimmer.xPos, myYPOS, size, 0,  2 * Math.PI);
            ctx.fill();
            ctx.closePath();
         }

        requestAnimationFrame(drawSwimmers);

        canvasAllSwimmers.addEventListener('mousemove', function(evt) {
            var mousePos = getMousePos(canvasAllSwimmers, evt);

            var tooltip = d3.select(".custom-tooltip-swimmers");

            if(mousePos.y>380){
                tooltip.style("margin-top",380);
            }if(mousePos.y<380 && mousePos.y>0){
                tooltip.style("margin-top", (mousePos.y) + "px");
            }if(mousePos.y<0){
                tooltip.style("margin-top", 5 + "px");
            };

            if (mousePos.x>4*width/5){
                tooltip.style("left",mousePos.x-230 +"px")
            }if (mousePos.x<4*width/5){
                tooltip.style("left",mousePos.x+10 +"px")
            }

            data.forEach(function(d){
                if (mousePos.x> d.xPos-mySize && mousePos.x<d.xPos+mySize && mousePos.y> d.yPos-mySize && mousePos.y<d.yPos+mySize){
                    //console.log(d);
                    tooltip.style("opacity",1);
                    tooltip.style("display","inherit");
                    tooltip.select("#swimmer").html(d.name);
                    tooltip.select("#country").html(d.country);
                    tooltip.select("#event").html(d.event);
                    tooltip.select("#time").html("Record: " + msToTime(d.time));
                    tooltip.select("#speed").html("Speed: " + formatSpeed(d.speed) + " meters/second");
                    tooltip.select("#date").html("Record broken on " + formatDate(d.date));
                }
            })
        }, false);
    }

    //highlight a swimmer
    swimmerDispatch.on("selectswimmer", function(swimmerName,i) {

        if (swimmerName == "All swimmers") {

            data.forEach(function(d){
                d.xPos = startingPoint;
            });

            drawSwimmers();

        } if (swimmerName!="All swimmers") {

            data.forEach(function(d){
                d.xPos = startingPoint;
            });

            drawSwimmerSelected();

            function drawSwimmerSelected (){
                ctx.globalCompositeOperation = 'normal';
                ctx.fillStyle = "#192F38";
                ctx.fillRect(0,0,width,height);

                //Y axis
                var years = [firstRecord,new Date(1920,1,1),new Date(1940,1,1),new Date(1960,1,1),new Date(1980,1,1),new Date(2000,1,1),lastRecord];
                years.forEach(function(d){
                    ctx.beginPath();
                    ctx.textAlign = "left";
                    ctx.fillStyle ="#758288";
                    ctx.font ="600 13px Raleway";
                    ctx.textBaseline = "middle";
                    ctx.fillText(formatYear(d),0,scaleY(d));
                    ctx.fillStyle = "none";
                    ctx.strokeStyle = "#475960";
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 2]);
                    ctx.moveTo(startingPoint-5,scaleY(d));
                    ctx.lineTo(endPoint+mySize+5,scaleY(d));
                    ctx.stroke();
                    ctx.closePath();
                });

                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.fillStyle ="#758288";
                ctx.font ="600 13px Raleway";
                ctx.fillText("Start",startingPoint,topPoint-35);
                ctx.fillText("End",(endPoint+mySize+1),topPoint-35);
                ctx.fillStyle = "none";
                ctx.strokeStyle = "#475960";
                ctx.lineWidth = 1;
                ctx.setLineDash([0, 0]);
                ctx.moveTo(startingPoint,height);
                ctx.lineTo(startingPoint,(topPoint-20));
                ctx.stroke();
                ctx.moveTo((endPoint+mySize+1),height);
                ctx.lineTo((endPoint+mySize+1),(topPoint-20));
                ctx.stroke();
                ctx.closePath();

                ctx.globalCompositeOperation = screenMode;
                //Loop over the dataset and draw each circle to the canvas
                for (var i = 0; i < data.length; i++) {
                    var swimmer = data[i];

                    var mySpeed = 20*(swimmer.speed*50)/endPoint;

                    if (swimmer.xPos>0 && swimmer.xPos<endPoint+1){
                        swimmer.xPos = swimmer.xPos + mySpeed;
                    }else{
                        swimmer.xPos = endPoint;
                    }


                    if (swimmerName==swimmer.name){
                        ////Draw each circle
                        ctx.beginPath();
                        ctx.fillStyle = "none";
                        ctx.lineWidth = "1pt";
                        ctx.globalCompositeOperation = screenMode;
                        ctx.globalAlpha = 0.1;
                        ctx.strokeStyle = scaleColor(swimmer.sex);
                        ctx.setLineDash([0, 0]);
                        ctx.moveTo(startingPoint-5,scaleY(swimmer.date));
                        ctx.lineTo(endPoint+mySize+5,scaleY(swimmer.date));
                        ctx.moveTo(startingPoint-5,scaleY(swimmer.date));
                        ctx.lineTo(endPoint+mySize+5,scaleY(swimmer.date));
                        ctx.stroke();
                        ctx.strokeStyle = "none";
                        ctx.globalCompositeOperation = 'normal';
                        ctx.globalAlpha = 1;
                        ctx.closePath();

                        ctx.beginPath();
                        ctx.globalCompositeOperation = screenMode;
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = scaleColor(swimmer.sex);
                        ctx.arc(swimmer.xPos, swimmer.yPos +noise.simplex2(swimmer.xPos/10, swimmer.yPos)*mySpeed-mySpeed*2, mySize, 0,  2 * Math.PI);
                        ctx.fill();
                        ctx.globalCompositeOperation = 'normal';
                        ctx.globalAlpha = 1;
                        ctx.closePath();


                    }if (swimmerName != swimmer.name){
                        ////Draw each circle
                        ctx.beginPath();
                        ctx.globalCompositeOperation = screenMode;
                        ctx.globalAlpha = 0.1;
                        ctx.fillStyle = scaleColor(swimmer.sex);
                        ctx.arc(swimmer.xPos, swimmer.yPos +noise.simplex2(swimmer.xPos/10, swimmer.yPos)*mySpeed-mySpeed*2, 1, 0,  2 * Math.PI);
                        ctx.fill();
                        ctx.globalCompositeOperation = 'normal';
                        ctx.globalAlpha = 1;
                        ctx.closePath();
                    }


                }

                requestAnimationFrame(drawSwimmerSelected);

                var canvasAllSwimmersSelected = canvasAllSwimmers;

                canvasAllSwimmersSelected.addEventListener('mousemove', function(evt) {
                    var mousePos = getMousePos(canvasAllSwimmersSelected, evt);
                    var tooltip = d3.select(".custom-tooltip-swimmers");

                    if(mousePos.y>380){
                        tooltip.style("margin-top",380);
                    }if(mousePos.y<380 && mousePos.y>0){
                        tooltip.style("margin-top", (mousePos.y) + "px");
                    }if(mousePos.y<0){
                        tooltip.style("margin-top", 5 + "px");
                    };

                    if (mousePos.x>4*width/5){
                        tooltip.style("left",mousePos.x-230 +"px")
                    }if (mousePos.x<4*width/5){
                        tooltip.style("left",mousePos.x+10 +"px")
                    }

                    data.forEach(function(d){
                        if (swimmerName == d.name && mousePos.x> d.xPos-mySize && mousePos.x<d.xPos+mySize && mousePos.y> d.yPos-mySize && mousePos.y<d.yPos+mySize){
                            console.log(d.name)
                            tooltip.style("opacity",1);
                            tooltip.style("display","inherit");
                            tooltip.select("#swimmer").html(d.name);
                            tooltip.select("#country").html(d.country);
                            tooltip.select("#event").html(d.event);
                            tooltip.select("#time").html("Record: " + msToTime(d.time));
                            tooltip.select("#speed").html("Speed: " + formatSpeed(d.speed) + " meters/second");
                            tooltip.select("#date").html("Record broken on " + formatDate(d.date));
                        }
                    })
                }, false);
            }
        }
    });



    smallMultiplesNormal ();

    function smallMultiplesNormal (){
        typeOfMultiple = "normal";

        d3.select("#eventPlot").selectAll("canvas").remove();
        d3.select("#eventPlot").selectAll("div").remove();


        //small events
        var nestedEvents = d3.nest()
            .key(function (d) {
                return event = d.event
            })
            .sortKeys(function(a,b){
                return events.indexOf(a) - events.indexOf(b)
            })
            .sortValues(function(a,b){
                return a.date - b.date})
            .entries(data);

        var drawEvents = d3.select(".eventPlot")
            .selectAll(".event")
            .data(nestedEvents);

        drawEvents = drawEvents
            .enter()
            .append('div')
            .attr('class', 'speed col-md-3');

        drawEvents
            .each(function (d, i) {

                var modality = d.values;

                var widthEvent = d3.select(this).node().clientWidth - margin.r - margin.l,
                    heightEvent = d3.select(this).node().clientHeight - margin.t - margin.b;

                var eventSeries = d3.speedSeries()
                    .width(widthEvent)
                    .height(300)
                    .radius([widthEvent/10,widthEvent/2])
                    .speedExtent(speedExtent)
                    .dateExtent(dateExtent)
                    .eventNames(events);

                d3.select(this)
                    .datum(d.values)
                    .call(eventSeries)
                ;
            });
    }


    //highlight a swimmer
    swimmerDispatch2.on("selectswimmer2", function(swimmer,i) {

        for (var i = 1; i < 99999; i++) {
            window.clearInterval(i);
            window.cancelRequestAnimFrame(i);
        }

       requestAnimationFrame(drawSwimmers);

        d3.select("#eventPlot").selectAll("canvas").remove();
        d3.select("#eventPlot").selectAll("div").remove();

        if (swimmer == "All swimmers") {
            typeOfMultiple = "normal";
            drawMultiples = smallMultiplesNormal;
        } else {
            typeOfMultiple = "selection";
            //small events
            var nestedEvents = d3.nest()
                .key(function (d) {
                    return event = d.event
                })
                .sortKeys(function(a,b){
                    return events.indexOf(a) - events.indexOf(b)
                })
                .sortValues(function(a,b){
                    return a.date - b.date})
                .entries(data);

            var drawEvents = d3.select(".eventPlot")
                .selectAll(".event")
                .data(nestedEvents);

            drawEvents = drawEvents
                .enter()
                .append('div')
                .attr('class', 'speed col-md-3');

            drawEvents
                .each(function (d, i) {

                    var modality = d.values;

                    var widthEvent = d3.select(this).node().clientWidth - margin.r - margin.l,
                        heightEvent = d3.select(this).node().clientHeight - margin.t - margin.b;

                    var eventSeries = d3.speedSeriesASwimmer()
                        .width(widthEvent)
                        .height(300)
                        .id(swimmer)
                        .radius([widthEvent/10,widthEvent/2])
                        .speedExtent(speedExtent)
                        .dateExtent(dateExtent)
                        .eventNames(events);

                    d3.select(this)
                        .datum(d.values)
                        .call(eventSeries)
                    ;
                });
        }
    });

    d3.select('#replay').on('click',function(){
        smallMultiplesNormal();
    });

    d3.select('#replayViz2').on('click',function(){
        data.forEach(function(d){
            d.xPos = startingPoint;
        });

        drawSwimmers();
    });

    d3.select('#up').on('click',function(){
        $("html, body").animate({
            scrollTop: ($("#body").offset().top)
        }, 500);
    });

    d3.select("#speedCalculation").on("mouseover",function(){
        d3.select("#speedInfo").classed("speedInfo",true).classed("speedInfoHide",false);
    })

    d3.select("#speedCalculation").on("mouseout",function(){
        d3.select("#speedInfo").classed("speedInfo",false).classed("speedInfoHide",true);
    })

    d3.select("#speedCalculation2").on("mouseover",function(){
        d3.select("#speedInfo2").classed("speedInfo",true).classed("speedInfoHide",false);
    })

    d3.select("#speedCalculation2").on("mouseout",function(){
        d3.select("#speedInfo2").classed("speedInfo",false).classed("speedInfoHide",true);
    })



}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}





function parseData(d){
    return {
        id: d["id"],
        id2: d["id2"],
        event: d["Event"],
        distance: +d["Distance"],
        name: d["Swimmer"],
        sex: d["Sex"],
        country: d["Swimmer nationality"],
        nCountry: +d["nCountry"],
        continent: d["Continent nationality"],
        nContinent: +d["nContinent"],
        time: +d["Miliseconds"],
        date: new Date (d["Date"]),
        ranking: +d["Ranking"],
        location: d["Meet location"],
        meet: d["Meet"],
        when: d["When"],
        speed: +d["Distance"]/(+d["Miliseconds"]/1000)

    }

}

function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return hrs + ':' + mins + ':' + secs + '.' + ms;
}


function parseType(n){
    d3.select(".type-list") //class in the html file
        .append("option") //it has to be called this name
        .html(n.type)
        .attr("value", n.type)
}

function parseSwimmer(n){
    d3.select(".swimmer-list") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer);

    d3.select(".swimmer-list2") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer);
}

function getMousePos(canvasALL, evt) {
    var rect = canvasALL.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}