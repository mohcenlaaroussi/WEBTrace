


window.onload = async function() {
  var app =await getWebsitesDb();
  console.log(app);

  var urlPage = document.URL;
  //var url_string = "http://www.example.com/t.html?a=1&b=3&c=m2-m3-m4-m5"; //window.location.href
  var url = new URL(urlPage);
  var c = url.searchParams.get("hostname");
  console.log(c);
  console.log(app[c]);


  var cookies = app[c].cookiesFirstParty;
  var table = document.getElementById("FPcookies").getElementsByTagName('tbody')[0];

  while(table.rows.length > 0) {
    table.deleteRow(0);
  }

  for(var i=0;i<cookies.length;i++){
    var row = table.insertRow();

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);

    // Add some text to the new cells:
    cell0.innerHTML = cookies[i].name;
    cell1.innerHTML = cookies[i].domain;
    cell2.innerHTML = cookies[i].category;
    cell3.innerHTML = cookies[i].description;
    cell4.innerHTML = cookies[i].path;
  }

  var select = document.getElementById("domains");


  for(let site of app[c].thirdPartySites){
    var option = document.createElement("option");
    option.text = site.hostname;
    option.value = site.hostname;
    select.add(option);
  }


  document.getElementById("domains").addEventListener("change", changeTable);
  table = document.getElementById("TPcookies").getElementsByTagName('tbody')[0];
  tableDel = document.getElementById("TPcookies");

  var i = 1;
  /*while(tableDel.rows.length > 1) {
    console.log('eeeee');
    tableDel.deleteRow(i);
    i++;
  }*/

  function changeTable(){
    var i = 1;
    while(tableDel.rows.length > 1) {
      console.log('eeeee');
      tableDel.deleteRow(i);
      //i++;
    }

    var x = document.getElementById("domains");
    console.log(x.value);
    for(let site of app[c].thirdPartySites){
      if(site.hostname == x.value){
        cookies = site.cookies;
        for(var i=0;i<cookies.length;i++){
          var row = table.insertRow();

          // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
          var cell0 = row.insertCell(0);
          var cell1 = row.insertCell(1);
          var cell2 = row.insertCell(2);
          var cell3 = row.insertCell(3);
          var cell4 = row.insertCell(4);

          // Add some text to the new cells:
          cell0.innerHTML = cookies[i].name;
          cell1.innerHTML = cookies[i].domain;
          cell2.innerHTML = cookies[i].category;
          cell3.innerHTML = cookies[i].description;
          cell4.innerHTML = cookies[i].path;
        }
        if (cookies.length == 0) {
          tableDel = document.getElementById("TPcookies");
          var row = tableDel.insertRow(1);
          var cell0 = row.insertCell(0);
          cell0.innerHTML = "<h2> No cookies for this domain</h2>";
        //  cell0.colspan = "5";
        tableDel.rows[1].cells[0].colSpan=5;


        //console.log(await getLinks());
        }

      }
    }

  }
  var links = await getNodesLinks(app);
  console.log('collegamenti');
  console.log(links);

  links = links.isLink;
  var collegamenti = {};

  for (var i = 0; i < links.length; i++) {
    let link = links[i];
    let website;
    if(link.website1 == c || link.website2 == c){
      if(!links.some(e => e.cookie.name == link.name && e.Cookie.domain == link.domain)){
        if(link.website1 == c)
          website = link.website2;
        else
          website = link.website1;
        if(!collegamenti[website])
          collegamenti[website] = [];
        collegamenti[website].push(link.cookie);

      }
    }
  }
  console.log(collegamenti);
  i = -1;
  for(let coll in collegamenti){
    i++;
    $("div#containerShared").append('<div class="row" style="padding:8px;"><div class="cardCookies card  shadow h-360 py-2" id ="card' + i + '" style = "border-left: 0.25rem solid white;"><div class="card-body"><h5 class="card-title">'+coll+'</h5><table class="table cookies" cellspacing="0" id="ShTable'+i+'"><thead></thead><tr><th>Name</th><th>Domain</th><th>Category</th></thead><tbody></tbody></table></div></div>');



    var table = document.getElementById("ShTable"+i).getElementsByTagName('tbody')[0];

    for(var i=0;i<collegamenti[coll].length;i++){
      var cookies = collegamenti[coll];
      var row = table.insertRow();

      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell0 = row.insertCell(0);
      var cell1 = row.insertCell(1);
      var cell2 = row.insertCell(1);


      // Add some text to the new cells:
      cell0.innerHTML = cookies[i].name;
      cell1.innerHTML = cookies[i].domain;
      cell2.innerHTML = cookies[i].category;
    }
    console.log(coll);
  }
   // Find a <table> element with id="myTable":

  // Create an empty <tr> element and add it to the 1st position of the table:

}
