class Node {
  constructor(website, x=-1, y=-1) {
    this.x = x == -1 ? random(width) : x;
    this.y = y == -1 ? random(height) : x;
    this.website = website;
    this.loaded = false;
    this.loading = false;
    this.flags = {
      'hover' : false,
      'dragging' : false,
    };

    this.radius = 25;
  }


  open(){
      /*$('#modal-container').removeAttr('class').addClass(buttonId);
      $('body').addClass('modal-active');*/

      var body = document.body;
      var modal = document.getElementById("modal-container");
      modal.removeAttribute('class');
      modal.classList.add("one");
      body.classList.add("modal-active");

  }

  render(img) {
    this.render_circle(img);
    this.render_text(img);
  }

  render_text(img) {
    noStroke();
    fill(0);
    textSize(20);
    //console.log('cella: ');
    //console.log(img);

   // text(this.label, this.x - (textWidth(this.label) / 2), this.y + ((textAscent() + textDescent()) / 4));
    image(img,this.x - (img.width / 2),this.y-(img.width / 2));
    img.resize((this.radius*2),(this.radius*2));
  }

  render_circle(img) {
    stroke(0);
    strokeWeight(2);
    fill(100);
    if (this.flags.hover) {
      strokeWeight(3);
    }
    if (this.flags.dragging) {
      //fill(100, 255, 255);
      fill(100);
    }
        //image(img,this.x,this.y);
  //ellipseMode(RADIUS);
   ellipse(this.x, this.y, this.radius*2, this.radius*2);
  }

  isInside(x, y) {
    const d = dist(this.x, this.y, x, y);
    return d <= this.radius;
  }

}
