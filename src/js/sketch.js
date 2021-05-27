var nodes = [];
var links = [];
var simulation;
var link;
var node;
var graph = {};
var svg,svg2;
var width,height;
var widthModal,heightModal;
var linksOld,nodesOld;
var color = d3.scaleOrdinal()
  .domain([1, 2,3])
  .range([ "#F8766D", "red","black"]);

const defaultIcon = "../chrome-icon.png";

function initSketch(node,link,update){

	var margin = ({top: 30, right: 80, bottom: 5, left: 5});

  svg = d3.select("svg.prova");
  width = svg.attr("width");
  height = svg.attr("height");

  svg2 = d3.select("svg.prova2");

  var p = $( "#modalBody" );
  var offset = p.outerWidth();
  var modalWidth = document.getElementsByClassName('modal-body')[0].offsetWidth;
  widthModal = svg2.attr("width");
  heightModal = svg2.attr("height");


  graph = {
  	nodes: node,
  	links: link
  };

 simulation = d3.forceSimulation()
 		.force("link", d3.forceLink() // This force provides links between nodes
 										.id(d => d.hostname) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
 										.distance(180)
 		 )
 		.force("charge", d3.forceManyBody().strength(-700)) // This adds repulsion (if it's negative) between nodes.
 		.force("center", d3.forceCenter(width / 2, height / 2)); // This force attracts nodes to the center of the svg areaù

 		simulation.force("forceX", d3.forceX(width/2).strength(function(d) { return hasLinks(d,graph.links) ? 0 : 0.05; }) )
 		.force("forceY", d3.forceY(height/2).strength(function(d) { return hasLinks(d,graph.links) ? 0 : 0.05; }) )
 		.on("tick", ticked);

		setLinksNodes();

}

function setLinksNodes(){
  svg.selectAll("*").remove();

	var linkElements = svg.selectAll(".links")
	        .data(graph.links)
	        .enter()
	        .append("line")
	        .attr("class", "links")
		linkElements.append("title")
	    .text(d => d.target);

	var nodeElements = svg.selectAll(".nodes")
	    .data(graph.nodes, function(d){return d.hostname})
	    .enter()
	    .append("g")
	    .attr("class", "nodes")
	    .call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
	        .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
	        .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
	        .on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
	    )
			.on('mouseover', function(d,i) {
				linkElements.style('stroke-width', function(l){
					if(i.hostname == l.source.hostname || i.hostname == l.target.hostname)
						return 4;
					else
						return 0;
				}).style("stroke", function(d) { return ''; });
			})
			.on('mouseout', function(){
				linkElements.style('stroke-width', 0);
			})
			.on('click', function(d, i) {
	       open(i.hostname);
      });

	nodeElements.append("circle")
	    .attr("r", d=> 17)//+ d.runtime/20 )
			.attr("class", "nodo")
      .attr("fill",'transparent')
	    .style("stroke", "grey")
	    .style("stroke-opacity",0.3)
	    .style("stroke-width", d => 100/50)
	    // .style("fill", d => "red")

	  nodeElements.append("image")
					.attr("class", "icona")

			    .attr("xlink:href", d=> {if(d.website.iconURL && d.website.iconURL!="chrome://favicon") return d.website.iconURL; else return defaultIcon;})
          // .on("error", function(d){
          //     this.setAttribute("href", "YourFallbackImage.jpg");
          // })
			    .attr("width", 34)
			    .attr("height", 34)
			    .attr("x", -16)
			    .attr("y", -16);

	// node.append("title")
	//     .text(d => d.id + ": " + d.label + " - " + d.group +", runtime:"+ d.runtime+ "min");

	nodeElements.append("text")
	    .attr("dy", 30)
	    .attr("dx", -50)
      .style("font-size", 14)
      .style("font-weight", 'bold')
	    .text(d => d.hostname);
	// node.append("text")
	//     .attr("dy",12)
	//     .attr("dx", -8)
	nodeElements.exit().remove();
linkElements.exit().remove();
simulation.nodes(graph.nodes)
simulation.force("link").links(graph.links)
simulation.restart();

}
function ticked() {
	var nodeElements = svg.selectAll(".nodes");
	var linkElements = svg.selectAll(".links");
	linkElements
	  .attr("x1", function (d) {
	      //checkBounds(d.source);
	      return d.source.x;
	    })
	  .attr("y1", function (d) {
	      return d.source.y;
	    })
	  .attr("x2", function (d) {
	     // checkBounds(d.target);
	      return d.target.x;
	    })
	  .attr("y2", function (d) {
	    return d.target.y;
	    });

	nodeElements.attr("cx", function(d) { return d.x = Math.max(20, Math.min(width - 20, d.x)); })
	    .attr("cy", function(d) { return d.y = Math.max(20, Math.min(height - 20, d.y)); });

      nodeElements.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}


	function dragstarted(event) {
		if (!event.active) simulation.alphaTarget(0.1).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	function checkBounds(d){
	  if (d.x < 0) d.x = 0;
	  if (d.x > width) d.x = width;
	  if (d.y < 0) d.y = 0;
	  if (d.y > width) d.y = height;
	}

	function hasLinks(d, links) {
    var isLinked = false;

	links.forEach(function(l) {
		if (l.source.hostname == d.hostname) {
			isLinked = true;
		}
	})
	return isLinked;
}


//}

async function open(hostname){

    let obj = await getWebsite(hostname, function(){});
		var nodesModal = [];
		var linksModal = [];
    let iconNode;
    if(obj.iconURL && obj.iconURL!="chrome://favicon")
      iconNode =  obj.iconURL;
    else
      iconNode = defaultIcon;
		nodesModal.push({"hostname" : obj.hostname, "icon" : iconNode, "color" : false});
    if(obj.thirdPartySites && obj.thirdPartySites.length>0){
  		for(let node of obj.thirdPartySites){
  			nodesModal.push({"hostname" : node.hostname, "icon": false, "color" : 1});
  		}

  		for(let node of obj.thirdPartySites){
  			linksModal.push({"source": obj.hostname, "target": node.hostname});
  		}
    }

		if(obj.xhrPackets && obj.xhrPackets.length>0){
			for(let node of obj.xhrPackets){
        let linkPresent = false;
        let nodePresent = false;
        for(let link of linksModal){
          if(link.source == obj.hostname && link.target == node[0])
            linkPresent = true;
        }
        for(let nod of nodesModal){
          if(nod.hostname == node[0])
            nodePresent = true;
        }
        if(!linkPresent){
  				linksModal.push({"source": obj.hostname, "target": node[0]});
          if(!nodePresent)
  				    nodesModal.push({"hostname" : node[0], "icon": false, "color" : 2});
        }else{
          nodesModal.forEach(nodeModal => {
            if(nodeModal.hostname == node[0])
              nodeModal.color = 3;
          });

        }

			}
		}

		//var color = d3.scaleOrdinal(d3.schemeCategory20);

		var sim = d3.forceSimulation()
	    .force("link", d3.forceLink().id(function(d) { return d.hostname; }).distance(130))
	    .force("charge", d3.forceManyBody())
	    .force("center", d3.forceCenter((widthModal) / 2, heightModal / 2))
			.force('collide', d3.forceCollide(10));

		sim
				//.nodes(nodes)
				.on("tick", () =>{
					var nodeElements = svg2.selectAll(".nodesNode");
					var linkElements = svg2.selectAll(".linksNode");
						linkElements
							.attr("x1", function(d) { return d.source.x; })
							.attr("y1", function(d) { return d.source.y; })
							.attr("x2", function(d) { return d.target.x; })
							.attr("y2", function(d) { return d.target.y; });
						nodeElements
							.attr("transform", function(d) {
							return "translate(" + d.x + "," + d.y + ")";
						})
				});


				updateModal(sim, nodesModal, linksModal);

				nodesOld = nodesModal;
				linksOld = linksModal;

    var max = await getMax();


		var body = document.body;

		$(document).ready(function(){ $('#exampleModalCenter').modal('show'); });

    let badge = '';
    if(obj.nThirdPartyCookies){
      let nThirdPartyCookies = obj.nThirdPartyCookies;
      let mean = nThirdPartyCookies/max;
      var rounded = Math.round((mean + Number.EPSILON) * 100) / 100;
      if(mean >= 0 && mean < 0.05)
        badge = 'success';
      if(mean >= 0.05 && mean < 0.3)
        badge = 'primary';
      if(mean >= 0.3 && mean < 0.7)
          badge = 'warning';
      if(mean >= 0.7){
        badge = 'danger';
      }
      document.getElementById("exampleModalLongTitle").innerHTML = "<h4>"+obj.hostname.toUpperCase()+"<span class='badge badge-pill badge-"+badge+"'>Dan</span></h4>";

    }else {
      document.getElementById("exampleModalLongTitle").innerHTML = "<h4>"+obj.hostname.toUpperCase()+"</h4>";

  }





		var cell1 = document.getElementById("FirstCookies");
		var cell2 = document.getElementById("ThirdCookies");
		var cell3 = document.getElementById("sizeXHR");
		var cell4 = document.getElementById("numberXHR");


		// Add some text to the new cells:
		cell1.innerHTML = obj.cookiesFirstParty.length;
		cell2.innerHTML = obj.nThirdPartyCookies;
		cell3.innerHTML = Math.floor(obj.sizePackets*100) / 100 + 'KB';
		cell4.innerHTML = obj.nPackets;


		var table = document.getElementById("top3cookies");
		var row;
    let length;
		var site = {};
    if(obj.thirdPartySites){
      if(obj.thirdPartySites.length>=3)
        length = 3;
      else
        length = obj.thirdPartySites.length;
  		for(var i = 0; i<length; i++){
  			row= table.rows[i+1];

  			cell1 = row.cells[0];
  			cell2 = row.cells[1];
  			site = obj.thirdPartySites[i];

  			// Add some text to the new cells:
  			cell1.innerHTML = site.hostname;
  			cell2.innerHTML = site.cookies.length;

  		}
    }

		table = document.getElementById("top3xhr");
		//let length;
		if(obj.xhrPackets){
			if(obj.xhrPackets.length>=3)
				length = 3;
			else
				length = obj.xhrPackets.length;
			for(var i = 0; i<length; i++){
				row= table.rows[i+1];

				cell1 = row.cells[0];
				cell2 = row.cells[1];
				site = obj.xhrPackets[i];
				cell1.innerHTML = site[0];
				cell2.innerHTML = site[1];

			}
}
		document.getElementById("linkDetails").href="details.html?hostname="+obj.hostname;
    let dom = obj.hostname.substring(obj.hostname.lastIndexOf(".", obj.hostname.lastIndexOf(".") - 1) + 1);
    var uniqueDomains = [];
    uniqueDomains.push(dom);
    var cookies = obj.cookiesFirstParty;

    if(obj.thirdPartySites){
      for(let site of obj.thirdPartySites){
        dom = site.hostname.substring(site.hostname.lastIndexOf(".", site.hostname.lastIndexOf(".") - 1) + 1);
        if(!uniqueDomains.includes(dom)){
          uniqueDomains.push(dom);
          cookies.push(...site.cookies);
        }
      }
    }

		var cookieCategories = {};
		let cat;
		for(let cookie of cookies){
			if(cookie.category == "")
				cat = "other";
			else
				cat = cookie.category;
			if (!cookieCategories.hasOwnProperty(cat)) {
				cookieCategories[cat] = 0;
			}
			cookieCategories[cat]++;
		}



		var labels = [];
		var values = [];
		for (const [key, value] of Object.entries(cookieCategories)) {
			values.push(value);
			labels.push(key);
		}

		$("canvas#myChart").remove();
		$("div#chartPie").append('<canvas id="myChart" height="350"  class="animated fadeIn"></canvas>');
		var ctx = document.getElementById("myChart").getContext("2d");
		var myChart= new Chart(ctx, {
				type: 'pie',
				data: {
					labels: labels,
		datasets: [{
		label: 'My First Dataset',
		data: values,
		backgroundColor: [
			'rgb(255, 99, 132)',
			'rgb(54, 162, 235)',
			'rgb(255, 205, 86)',
			'rgb(80, 120, 200)'
		],
		hoverOffset: 4
		}]
		},
				options: {
						scales: {
								y: {
										beginAtZero: true
								}
						}
				}
		});

}


function updateModal(sim, nodesModal, linksModal){
	svg2.selectAll("*").remove();

	var nodeElementsOld = svg.selectAll(".linksNode");
	var linkElementsOld = svg.selectAll(".nodesNode");
	nodeElementsOld.exit().remove();
	linkElementsOld.exit().remove();

	var linkElements = svg2.selectAll(".linksNode")
		.data(linksModal)
		.enter()
		.append("line")
		.attr("class", "linksNode")
		.attr("stroke-width", function(d) { return '1'});

		var nodeElements = svg2.selectAll(".nodesNode")
				.data(nodesModal, function(d){return d.hostname})
				.enter()
				.append("g")
				.attr("class", "nodesNode")

	var circles = nodeElements.append("circle")
			.attr("r", 5)
			.attr("fill", function(d) { return color(d.color); });

		var images = nodeElements.append("image")
						.attr("class", "icona")

						.attr("xlink:href", d=> {if(d.icon) return d.icon;})
						.attr("width", 34)
						.attr("height", 34)
						.attr("x", -16)
						.attr("y", -16);

	var lables = nodeElements.append("text")
			.text(function(d) {
				return d.hostname;
			})
			.attr('x', 6)
			.attr('y', 3)
      .style("visibility", "hidden");

      nodeElements.on("mouseover", function(d) {
        d3.select(this).select("text").style("visibility", "visible")
              .style("font-size", 14)
              .style("font-weight", 'bold')
      })
      .on("mouseout", function(d) {
        d3.select(this).select("text").style("visibility", "hidden")
      })


	nodeElements.append("title")
		.text(function(d) { return d.hostname; });

		nodeElements.exit().remove();
		linkElements.exit().remove();

		sim.nodes(nodesModal)
		sim.force("link").links(linksModal)
		sim.restart();
}

async function getMax(){
  var app =await getWebsitesDb();
  let max = await getFirstValue(app);

  for(let website in app){
    if(app[website].nThirdPartyCookies){
      if(app[website].nThirdPartyCookies>max)
        max = app[website].nThirdPartyCookies;
    }
  }
  return max;
}

async function getFirstValue(data) {

  for (var prop in data){
    if(data[prop].nThirdPartyCookies)
      return data[prop].nThirdPartyCookies;
  }
}
