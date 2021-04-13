class Node {
  constructor(website, x=-1, y=-1) {
    this.radius = 25;
    this.x = x == -1 ? random(0+this.radius, width-this.radius) : x;
    this.y = y == -1 ? random(0+this.radius, height-this.radius) : x;
    this.website = website;
    this.label = website.hostname;
    this.loaded = false;
    this.loading = false;
    this.flags = {
      'hover' : false,
      'dragging' : false,
    };
    //this.myChart = null;
    //this.ctx = document.getElementById('myChart').getContext('2d');
    //this.myChart = null;

    //this.myChart.destroy();

  }


  open(){
      /*$('#modal-container').removeAttr('class').addClass(buttonId);
      $('body').addClass('modal-active');*/

      var body = document.body;
      /*var modal = document.getElementById("modal-containerr");
      modal.removeAttribute('class');
      modal.classList.add("one");
      body.classList.add("modal-active");*/
      //var modal = document.getElementById("exampleModalCenter");
      //modal.modal('show');
      $(document).ready(function(){ $('#exampleModalCenter').modal('show'); });
      document.getElementById("exampleModalLongTitle").innerHTML = "<h4>"+this.website.hostname.toUpperCase()+"</h4>";


      //var table = document.getElementById("sumTable");

      // Create an empty <tr> element and add it to the 1st position of the table:
      //var row1 = table.rows[1];

      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell1 = document.getElementById("FirstCookies");
      var cell2 = document.getElementById("ThirdCookies");
      var cell3 = document.getElementById("sizeXHR");
      var cell4 = document.getElementById("numberXHR");


      // Add some text to the new cells:
      cell1.innerHTML = this.website.cookiesFirstParty.length;
      cell2.innerHTML = this.website.nThirdPartyCookies;
      cell3.innerHTML = Math.floor(this.website.sizePackets*100) / 100 + 'KB';
      cell4.innerHTML = this.website.nPackets;

      //var row1 = table.rows[2];
      //cell1 = row2.cells[0];

      var table = document.getElementById("top3cookies");
      var row;

      var site = {};
      for(var i = 0; i<2; i++){
        row= table.rows[i+1];

        cell1 = row.cells[0];
        cell2 = row.cells[1];
        site = this.website.thirdPartySites[i];

        // Add some text to the new cells:
        cell1.innerHTML = site.hostname;
        cell2.innerHTML = site.cookies.length;

      }

      table = document.getElementById("top3xhr");
      let length;
      if(this.website.xhrPackets.length>=3)
        length = 2;
      else
        length = this.website.xhrPackets.length;
      for(var i = 0; i<length; i++){
        row= table.rows[i+1];

        cell1 = row.cells[0];
        cell2 = row.cells[1];
        site = this.website.xhrPackets[i];
        console.log(site);
        // Add some text to the new cells:
        cell1.innerHTML = site[0];
        cell2.innerHTML = site[1];

      }

      document.getElementById("linkDetails").href="details.html?hostname="+this.website.hostname;

      var cookieCategories = {};
      let cat;
      for(let cookie of this.website.cookiesFirstParty){
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
      console.log('VALUESSSS');
      console.log(values);

      //this.myChart.destroy();


      /*if(window.myChart && window.myChart != null){
          window.myChart.destroy();
      }*/
      //var ctx = document.getElementById('myChart').getContext('2d');



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



      /*if(this.myCharts.length>=1){
        this.myCharts[0].destroy();
        //this.myCharts = [];
      }else{
        this.myCharts.push(1);
      }*/
      //if(this.myChart && this.myChart !== null)
      //this.myChart.destroy();

      /*this.myChart=new Chart(this.ctx, {
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
      });*/

      //this.myChart.destroy();

  }

  close(){
    if(this.myChart && this.myChart!=null){
    //  myChart.destroy();
      //this.myChart=null;
    }
  }

  render(img) {
    this.render_circle(img);
    this.render_text(img);
  }

  render_text(img) {
    noStroke();
    //fill(0);
    textSize(20);
    var easing = 0.03;
    //console.log('cella: ');
    //console.log(img);
    var diffX = random(-3,3);
    var diffY = random(-3,3);
    this.show_text();
   this.x += diffX * easing;
   this.y += diffY * easing;
    image(img,this.x - (img.width / 2),this.y-(img.width / 2));
    img.resize((this.radius*1.5),(this.radius*1.5));
  }

  show_text(){
    textSize(18);
    fill('#fff');
    text(this.label, this.x - (textWidth(this.label) / 2), this.y + this.radius+10);
  }

  render_circle(img) {
    stroke('#000');
    //strokeWeight(2);
    fill('#343A40');
    //fill(100);
    if (this.flags.hover) {
      stroke('#fff');
      strokeWeight(1);

    }
    if (this.flags.dragging) {
      //fill(100, 255, 255);
      fill('#343A40');
    }
        //image(img,this.x,this.y);
  //ellipseMode(RADIUS);
   ellipse(this.x, this.y, this.radius*1.5, this.radius*1.5);
  }

  isInside(x, y) {
    const d = dist(this.x, this.y, x, y);
    return d <= this.radius;
  }

}
