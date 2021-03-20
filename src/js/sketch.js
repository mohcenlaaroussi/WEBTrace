let cells = [];
let nodesWebsites = [];
let connections = [];
let startSetup = false;
let imgs = [];
let dragged;
let loaded;
let click = true;

function setup() {
	//if(startSetup){
	createCanvas(windowWidth, windowHeight);
	let loading = false;
	let loaded = false;
}


async function getImages(nodes){
	var app = [];
	//console.log('linghezzza');
	//console.log(nodes.length);
	nodes.forEach(node => {
		if(node.iconURL){
			//console.log(node.hostname);
			//console.log(node.iconURL);
			var protocol = node.iconURL.split(":")[0];
			if(protocol != 'chrome' && protocol != 'chrome-extension'){
	  			loadImage(node.iconURL, async function(i) {
	  				const obj = {
	  					'hostname' : node.hostname,
	  					'img' : i
	  				};
	 				app.push(obj);
				}, function(e) {
		    	console.log(e);
				});
	  		}else{
	  			const obj = {
	  				'hostname' : node.hostname,
	  				'img' : loadImage('../chrome-icon.png')
	  			};
				app.push(obj);
	  		}
			if(app.length == nodes.length)
				loaded = true;
		}
 	})
 	return app;
}

async function initSketch(nodes, links,website = false){
	nodesWebsites = nodes;
	//console.log('prova');
	//console.log(nodesWebsites);
	imgs = await getImages(nodes);

	//console.log('WEBSITEEEE');
	//console.log(website);

	startSetup = true;
	if(!website){
		cells = nodes.map((node) => {
			return new Node(node);

		});
		//console.log('LINKSSSSSS');
		//console.log(links);
		connections = links.map((link) => {
			let node1;
			let node2;
			for(let cell of cells){
				if(cell.website.hostname == link.website1){
					node1 = cell;

				}
				if(cell.website.hostname == link.website2){
					node2 = cell;
				}
			}
			if(node1 && node2)
				return new Link(node1,node2,link.cookie);
		});
	}else{
		let flag = false;
		for(let node of cells){
			if(node.website.hostname == website.hostname){
				flag = true;
				node.website = website;
			}
		}
		if(!flag)
			cells.push(new Node(website));

		for(let conn of links){
			let node1;
			let node2;
			for(let cell of cells){
				//console.log(cell.website.hostname +'==='+ conn.website1);
				if(cell.website.hostname == conn.website1){
					node1 = cell;

				}
				//console.log(cell.website.hostname +'==='+ conn.website2);

				if(cell.website.hostname == conn.website2){
					node2 = cell;
				}
			}
			if(node1 && node2)
				connections.push(new Link(node1,node2,conn.cookie));
		}


	}
	startSetup = true;
}
function draw() {
	background(100);
	//dragged = false;
	//console.log('nodes: ');
	//console.log(cells);
	//console.log('immagini: ');
	//console.log(imgs);
	//console.log('links: ');
	//console.log(connections);
	//console.log(loaded);
	//console.log(imgs.length == cells.length);
	if (loaded || imgs.length == cells.length) {
		var prova = [];
		cells.forEach(cell => {
			if(cell.isInside(mouseX, mouseY)){
				connections.forEach(conn => {
						if (conn.cell1.website.hostname == cell.website.hostname || conn.cell2.website.hostname == cell.website.hostname){
							 conn.flags.hover = true;
							 prova.push(conn);
						} else{ conn.flags.hover = false;}
							conn.render();
				});
			}
	  })

	  	let i = -1;
		cells.forEach(cell => {
			let hostname;
			let img;
			++i;
	    	if (cell.isInside(mouseX, mouseY)) cell.flags.hover = true;
	    	else cell.flags.hover = false;

	    	//TODO: DA MIGLIORARE E RENDERLO PIU EFFICIENTE
	    	for(let i = 0; i<imgs.length; i++){
	    		if(imgs[i].hostname == cell.website.hostname){
	    			img = imgs[i].img;
	    			//imgs.splice(i,1);
	    			//console.log(img);
	    		}
	    	}

	    	cell.render(img);


			});

	    //image(img,this.x,this.y);
  		}
	}

let dx = 0;
let dy = 0;
let dragged_cell;
let clickedImg = false;


function mouseClicked(){
	if (!click) return;
	let cell;
	for (let i = 0; i < cells.length; i++) {
    cell = cells[i];

    if (cell.flags.hover) {
    	if(clickedImg){
    		cell.open();
   		}
    }
  }
}


function mousePressed() {
  clickedImg = true;
  /*for (let i = 0; i < connections.length; i++) {
    conn = connections[i];
    if (conn.flags.hover) {
      connections.splice(i, 1);
      return;
    }
  }*/
  let cell;
  for (let i = 0; i < cells.length; i++) {
    cell = cells[i];

    if (cell.flags.hover) {
    	/*if(clickedImg){
    		cell.open();
   		}*/
   		if(mouseIsPressed){
    		cell.flags.dragging = true;
    		dragged_cell = cell;
    		break;
    	}
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

  dragged = true;
}

function mouseReleased() {
	if(dragged) click = false;
	else click = true;
	if (!dragged_cell) return;

	dragged_cell.flags.dragging = false;
	dragged_cell = undefined;
	dragged = false;

}
