/* Nurvirta Monarizqa - nm2773 */

function getRandomArbitrary(min, max) {
  return Math.round (Math.random() * (max - min) + min) -1;
}

var groups = {
    cpu_load: {
      value: 0,
      color: 'orange',
      data: []
    },
    mem_percent: {
      value: 0,
      color: 'green',
      data: []
    },
      storage_root: {
      value: 0,
      color: 'red',
      data: []
    }
}

// SOCKET CONNECTION

var ws = new WebSocket("ws://192.168.1.100:8888/realtime");
ws.onopen = function(){
    console.log("Connection Established");
};

ws.onmessage = function(ev){
    console.log("Got a message!");
    var json_data = JSON.parse(ev.data);
    console.log(json_data);
    cpu_load.innerHTML = "CPU Load: " + parseInt(json_data.cpu_load) + " %";
    mem_percent.innerHTML = "RAM Percent: " + parseFloat(json_data.mem_percent) + " %";
    storage_root.innerHTML = "Total Storage Used: " + parseFloat(json_data.storage_root) + " %";
    groups['cpu_load'].value = parseInt(json_data.cpu_load);
    groups['mem_load'].value = parseInt(json_data.mem_percent);
    groups['storage_load'].value = parseInt(json_data.storage_root);
    }
    setTimeout(function(){
        for (var name in groups){
           var group = groups[name];
           group.value = 0;
        }
    }, 10000);
};

ws.onclose = function(ev){
    console.log("connection was closed");
};

ws.onerror = function(ev){
    console.log("Error creating socket setup");
};
//

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 480 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

var parseDate = d3.time.format("%H:%M:%S").parse;

var xcenter =  width/2;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%S"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate('basis')
    .x(function(d) {
        return x(d.creatTime);
    })
    .y(function(d) {
        return y(d.cpuTime);
    });

// function

function myGetTime() {
    var dd = new Date();
    var hh = dd.getHours();
    var mm = dd.getMinutes();
    var ss = dd.getSeconds();
    return hh + ":" + mm + ":" + ss;
}


function getTime(group) {
  if(group.data.length === 25) {
    group.data.shift();
  }
  group.data.push({
      "creatTime":  myGetTime(),
      // "cpuTime": getRandomArbitrary(0,101),
      "cpuTime": group.value,
  });
}

function update() {
  for (var name in groups) {
      var group = groups[name];
      getTime(group);
  }
  render();
}

function render() {

  d3.select("svg")
         .remove();

  var svg = d3.select(".graph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 40)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  for (var name in groups) {
    var data = groups[name].data;
    data.forEach(function(d) {
        if(typeof d.creatTime === "string") {
          d.cpuTime = +d.cpuTime;
           d.creatTime = parseDate(d.creatTime);
        }

    });
  }

  x.domain(d3.extent(groups['cpu_load'].data, function(d) { return d.creatTime; }));
  y.domain([0,100]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .style("text-anchor", "end")
      .call(xAxis)
  .append("text")
      .attr("transform", "rotate(0)")
      .attr("y", 40)
      .attr("dx", xcenter)
      .attr("font-size", "1.3em")
      .style("text-anchor", "end")
      .text("time(s)");

  svg.append("text")
        .attr("transform", "rotate(0)")
        .attr("y", 20)
        .attr("x", 400)
        .attr("font-size", "1em")
        .style("text-anchor", "end")
        .text("green: memory usage, orange: cpu load, red: storage usage");

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate("+ height +",-180px)")
      .style("text-anchor", "end")
      .call(yAxis)
   .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("dy", ".41em")
      .attr("font-size", "1.3em")
      .style("text-anchor", "end")
      .text("%");

  for (var name in groups) {
      var group = groups[name];
      svg.append("path")
          .datum(group.data)
          .attr("class", "line")
          .attr("d", line)
          .style('stroke', group.color)
          .style('fill', 'none');
    }


}

// Start
update();
