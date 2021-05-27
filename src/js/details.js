


window.onload = async function() {
  var app =await getWebsitesDb();

  var urlPage = document.URL;
  var url = new URL(urlPage);
  var c = url.searchParams.get("hostname");
  document.getElementById("websiteID").innerHTML = c;


  var cookies = app[c].cookiesFirstParty;
  var table = document.getElementById("FPcookies").getElementsByTagName('tbody')[0];

  while(table.rows.length > 0) {
    table.deleteRow(0);
  }

  for(var i=0;i<cookies.length;i++){
    var row = table.insertRow();

    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);

    cell0.innerHTML = cookies[i].name;
    cell1.innerHTML = cookies[i].domain;
    cell2.innerHTML = cookies[i].category;
    cell3.innerHTML = cookies[i].description;
    cell4.innerHTML = cookies[i].path;
  }

  var select = document.getElementById("domains");


  if(app[c].thirdPartySites){
    for(let site of app[c].thirdPartySites){
      var option = document.createElement("option");
      option.text = site.hostname;
      option.value = site.hostname;
      select.add(option);
    }

  }

  document.getElementById("domains").addEventListener("change", changeTable);
  table = document.getElementById("TPcookies").getElementsByTagName('tbody')[0];
  tableDel = document.getElementById("TPcookies");
  changeTable();


  var i = 1;

  function changeTable(){
    var i = 1;
    while(tableDel.rows.length > 1) {
      tableDel.deleteRow(i);
    }
    var x = document.getElementById("domains");


    if(app[c].thirdPartySites){
      for(let site of app[c].thirdPartySites){
        if(site.hostname == x.value){

          cookies = site.cookies;
          table = document.getElementById("TPcookies").getElementsByTagName('tbody')[0];

          for(var i=0;i<cookies.length;i++){
            var row = table.insertRow();

            var cell0 = row.insertCell(0);
            var cell1 = row.insertCell(1);
            var cell2 = row.insertCell(2);
            var cell3 = row.insertCell(3);
            var cell4 = row.insertCell(4);

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
          tableDel.rows[1].cells[0].colSpan=5;


          }

        }
      }

  }

  }
  var links = await getNodesLinks(app);

  links = links.links;
  var collegamenti = {};

  for (var i = 0; i < links.length; i++) {
    let link = links[i];
    let website;
    if(link.source == c || link.target == c){
        if(link.source == c)
          website = link.target;
        else
          website = link.source;
        if(!collegamenti[website])
          collegamenti[website] = [];
        collegamenti[website].push(...link.cookies);

    }
  }

  $(document).on("click", ".show-more-button", function(event) {
    let y = event.target.id;

  $('#ShTable'+y+' .hidden').slice(0, 2).removeClass('hidden');
    if ($('#ShTable'+y+' .hidden').length == 0) {
      $(this).addClass('hidden');
    }
  });

  let j = -1;
  for(let coll in collegamenti){
    j++;

    $("div#containerShared").append('<div class="col" style="padding:8px;"><div class="cardCookies card  shadow h-360 py-2" id ="card' + j + '" style = "border-left: 0.25rem solid white;"><div class="card-body"><h5 class="card-title">'+coll+'</h5><table class="table cookies" cellspacing="0" id="ShTable'+j+'"><thead></thead><tr><th>Name</th><th>Category</th><th>Domain</th></thead><tbody></tbody></table><p><input type="button"  id="'+j+'" class="show-more-button" ù value="More"></p></div></div>');
    $("div#containerShared").append('');



    var table = document.getElementById("ShTable"+j).getElementsByTagName('tbody')[0];

    for(var i=0;i<collegamenti[coll].length;i++){
      var cookies = collegamenti[coll];
      var row = table.insertRow();
      if(i>=4)
        row.classList.add("hidden");
      // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
      var cell0 = row.insertCell(0);
      var cell1 = row.insertCell(1);
      var cell2 = row.insertCell(1);


      // Add some text to the new cells:
      cell0.innerHTML = cookies[i].name;
      cell1.innerHTML = cookies[i].domain;
      cell2.innerHTML = cookies[i].category;
    }
  }


  if(app[c].dataShared){
    var labels = [];
    var values = [];
    let shared = app[c].dataShared;
    for (const [key, value] of Object.entries(shared)) {
      values.push(value.sum);
      labels.push(key);
    }

  }


}
