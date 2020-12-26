let cells = [];
let nodesWebsites = [];
let connections = [];
let startSetup = false;
let imgs = [];
let loading;
let loaded;

function setup() {
	//if(startSetup){
	createCanvas(windowWidth, windowHeight);
	let loading = false;
	let loaded = false;
}


async function getImages(nodes){
	var app = [];
	console.log('linghezzza');
	console.log(nodes.length);
	nodes.forEach(node => {
	console.log(node.iconURL);

  		loadImage(node.iconURL, async function(i) {  
 			app.push(i);
	 	if(app.length == nodes.length)	
			loaded = true;
		}, function(e) {
	    	console.log(e);
		});
 	})



 	return app;
}

async function initSketch(nodes, links,website){
	nodesWebsites = nodes;

	imgs = await getImages(nodes);



	startSetup = true;
	if(!website){
		cells = nodes.map((node) => {
			return new Node(node);

		});
		//console.log(cells);
		connections = links.map((link) => {
			let node1;
			let node2;
			for(let cell of cells){
				if(cell.website.hostname === link.website1){
					node1 = cell;

				}
				if(cell.website.hostname === link.website2){
					node2 = cell;
				}
			}
			return new Link(node1,node2,link.cookie);
		});
	}else{
		let node1;
		let node2;
		for(let conn of links){
			for(let cell of cells){
				if(cell.website.hostname === conn.website1){
					node1 = cell;

				}
				if(cell.website.hostname === conn.website2){
					node2 = cell;
				}
			}
			connections.push(new Link(node1,node2,conn.cookie));
		}
		
  		cells.push(new Node(website));

	}
	startSetup = true;
}	
function draw() {
	background(100);

  if (loaded) {

	connections.forEach(conn => {
    	if (conn.isInside(mouseX, mouseY)) conn.flags.hover = true;
    	else conn.flags.hover = false;
    
    	conn.render();
  	})
  	
  	let i = -1;
	cells.forEach(cell => {
		++i;
    	if (cell.isInside(mouseX, mouseY)) cell.flags.hover = true;
    	else cell.flags.hover = false;
    	
    	cell.render(imgs[i]);


		});

    //image(img,this.x,this.y);
  }
	}

let dx = 0;
let dy = 0;
let dragged_cell;

function mousePressed() {
  
  for (let i = 0; i < connections.length; i++) {
    conn = connections[i];
    if (conn.flags.hover) {
      connections.splice(i, 1);
      return;
    }
  }
  let cell;
  for (let i = 0; i < cells.length; i++) {
    cell = cells[i];

    if (cell.flags.hover) {
      cell.flags.dragging = true;
      dragged_cell = cell;
      break;
    }
  }
  
  if (!dragged_cell) return;
  dx = mouseX - dragged_cell.x;
  dy = mouseY - dragged_cell.y;
}

function mouseDragged() {
  if (!dragged_cell) return;
  
  dragged_cell.x = mouseX - dx;
  dragged_cell.y = mouseY - dy;
}

function mouseReleased() {
  if (!dragged_cell) return;
  
  dragged_cell.flags.dragging = false;
  dragged_cell = undefined;
}


