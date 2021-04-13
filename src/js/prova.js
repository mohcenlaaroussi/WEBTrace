
window.onload = async function() {
  var app =await getWebsitesDb();
  console.log(app);

  var urlPage = document.URL;
  //var url_string = "http://www.example.com/t.html?a=1&b=3&c=m2-m3-m4-m5"; //window.location.href
  //var url = new URL(urlPage);
  //var c = url.searchParams.get("hostname");
  //console.log(c);
  //console.log(app[c]);
  var websiteCategories = {};
  var numWebsitesCat= {};
  let cat;
  for(let website in app){
    if(!app[website].category || app[website].category.length == 0)
      cat = "other";
    else{
    if(app[website].category[0].label == 'Non-Standard Content')
        cat = app[website].category[1].label;
    else
      cat = app[website].category[0].label;
    }
    if (!websiteCategories.hasOwnProperty(cat)) {
      websiteCategories[cat] = 0;
      numWebsitesCat[cat] = 0;

    }
    numWebsitesCat[cat]++;
    websiteCategories[cat]+= app[website].nThirdPartyCookies;
  }


  var labels = [];
  var values1 = [];
  var values2 = [];
  for (const [key, value] of Object.entries(websiteCategories)) {
    values1.push(value);
    labels.push(key);
  }
  for (const [key, value] of Object.entries(numWebsitesCat)) {
    values2.push(value);
    //labels.push(key);
  }
  console.log('VALUESSSS');
  console.log(websiteCategories);
  console.log(numWebsitesCat);

  var ctx = document.getElementById("chartCat").getContext("2d");


  const DATA_COUNT = 7;
  const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

  const categories = labels;
  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Number of websites per category',
        data: values1,
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      },
      {
        label: 'Numbers of third party cookies per category',
        data: values2,
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
      }
    ]
  };

  var myChart= new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      animation:false,
scaleOverride:true,
scaleSteps:9,
scaleStartValue:0,
scaleStepWidth:10,
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
          text: 'Chart.js Bar Chart'
        },
        labels: {
          fontColor: 'rgb(255, 255, 255)',
          size: 16
        }
      }
    },
  });
}
