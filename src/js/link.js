class Link {
  constructor(cell1, cell2,cookie) {
    this.cell1 = cell1;
    this.cell2 = cell2;
    this.cookie = cookie;

    this.flags = {
      hover : false,
      dragging : false,
    };
  }

  render() {
    this.render_line();
  }

  set_flag_hover(bool){
    this.flags.hover = bool;
  }

  render_line() {
    //stroke(0);
    //strokeWeight(2);
    if (this.flags.hover) {
      pop();
      line(this.cell1.x, this.cell1.y, this.cell2.x, this.cell2.y);
      //strokeWeight(2);
      stroke('#fff');
      push();

    }
  }

  isInside(x, y) {

    const d1 = dist(this.cell1.x, this.cell1.y, x, y);
    const d2 = dist(this.cell2.x, this.cell2.y, x, y);

    if (d1 <= this.cell1.radius || d2 <= this.cell2.radius) return false;

    const length = dist(this.cell1.x, this.cell1.y, this.cell2.x, this.cell2.y);

    const cond1 = (d1 + d2)-0.5 <= length;
    const cond2 = (d1 + d2)+0.5 >= length;

    return cond1 && cond2;
  }

}
