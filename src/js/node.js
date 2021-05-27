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
  }


  open(){

      var body = document.body;
      $(document).ready(function(){ $('#exampleModalCenter').modal('show'); });
      document.getElementById("exampleModalLongTitle").innerHTML = "<h4>"+this.website.hostname.toUpperCase()+"</h4>";


      var cell1 = document.getElementById("FirstCookies");
      var cell2 = document.getElementById("ThirdCookies");
      var cell3 = document.getElementById("sizeXHR");
      var cell4 = document.getElementById("numberXHR");


      cell1.innerHTML = this.website.cookiesFirstParty.length;
      cell2.innerHTML = this.website.nThirdPartyCookies;
      cell3.innerHTML = Math.floor(this.website.sizePackets*100) / 100 + 'KB';
      cell4.innerHTML = this.website.nPackets;

      var table = document.getElementById("top3cookies");
      var row;

      var site = {};
      for(var i = 0; i<2; i++){
        row= table.rows[i+1];

        cell1 = row.cells[0];
        cell2 = row.cells[1];
        site = this.website.thirdPartySites[i];

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
}
