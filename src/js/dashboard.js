
window.onload = async function() {
  var app =await getWebsitesDb();
  console.log(app);
  var mybutton = document.getElementById("myBtn");

  window.onscroll = function() {scrollFunction(mybutton)};

  $(document).on("click", "#myBtn", function(event) {
    topFunction();

  });
  var urlPage = document.URL;
  var websiteCategories = {};
  var numWebsitesCat= {};
  var numXHRCat= {};
  let cat;
  for(let website in app){
    if(!app[website].category || app[website].category.length == 0)
      cat = "Other";
    else{
      if(app[website].category[0].label == 'Non-Standard Content'){
        if(app[website].category[1])
          cat = app[website].category[1].label;
        else
          cat = app[website].category[0].label;
      }else{
        if(app[website].category[1]  && app[website].category[1].score>=1.0)
          cat = app[website].category[1].label;
        else
          cat = app[website].category[0].label;
      }
    }
    if (!websiteCategories.hasOwnProperty(cat)) {
      websiteCategories[cat] = 0;
      numWebsitesCat[cat] = 0;
      numXHRCat[cat] = 0;

    }
    numWebsitesCat[cat]++;
    if(app[website].nThirdPartyCookies)
      websiteCategories[cat]+= app[website].nThirdPartyCookies;
    if(app[website].nPackets)
      numXHRCat[cat]+= app[website].nPackets;
  }


  var labels = [];
  var values1 = [];
  var values2 = [];
  var values3 = [];
  for (const [key, value] of Object.entries(websiteCategories)) {
    values1.push(Math.floor(value/numWebsitesCat[key]));
    labels.push(key);
  }
  for (const [key, value] of Object.entries(numWebsitesCat)) {
    values2.push(value);
  }
  for (const [key, value] of Object.entries(numXHRCat)) {
    values3.push(Math.floor(value/numWebsitesCat[key]));
  }

  var ctx = document.getElementById("chartCatWeb").getContext("2d");
  var ctx2 = document.getElementById("chartCatCookies").getContext("2d");
  var ctx3 = document.getElementById("chartCatXHR").getContext("2d");


  const DATA_COUNT = 7;
  const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

  var categories = labels;
  var data = {
    labels: categories,
    datasets: [
      {
        label: 'Number of websites per category',
        data: values2,
        borderRadius: 15,
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(255, 0, 0, 0.9)'
      //  borderColor: 'white'


      }
    ]
  };

  var myChart= new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      indexAxis: 'x',
      responsive: true,
      cornerRadius: 20,

      scales: {
        y: {
          beginAtZero: true,
          labels:{
            color:'white'
          },
          grid: {
            color:'#59595B',
            borderDash : [8,4]

          },
          ticks: {
            color:'white'
          }
        },
        x: {
          grid: {
          },
          ticks: {
            color:'white',
            autoSkip: false,
            maxRotation: 35,
            minRotation: 35,
            font: {
                size: 12,
            }
          }
        }
      },

      plugins: {
        legend: {
          position: 'top',
          labels: {
            color:'white',
            font: {
              size: 13,
            }
          }
        },
        title: {
          display: false,
          text: 'Chart.js Bar Chart'
        },
        labels: {
          size: 12
        }
      }
    },
  });




  categories = labels;
  data = {
    labels: categories,
    datasets: [
      {
        label: 'Average number of third party cookies per category',
        data: values1,
        borderRadius: 15,
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: '#2BEBC8'
        //borderColor: 'white'
      }
    ]
  };

  var myChart2= new Chart(ctx2, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      cornerRadius: 20,

      scales: {
        y: {
          beginAtZero: true,
          labels:{
            color:'white'
          },
          grid: {
            color:'#59595B',
            borderDash : [8,4]

          },
          ticks: {
            color:'white'
          }
        },
        x: {
          grid: {
            //color:'#59595B'
          },
          ticks: {
            color:'white',
            autoSkip: false,
            maxRotation: 35,
            minRotation: 35,
            font: {
              //fontColor: '#fff',

                size: 12,

            }
          }
        }
      //  xAxes: [{
        //  barPercentage: 0.4
        //}]

      },

      plugins: {
        legend: {
          position: 'top',
          labels: {
    // This more specific font property overrides the global property
    color:'white',
          font: {
            //fontColor: '#fff',

            size: 13,

          }
}
        },
        title: {
          display: false,
          text: 'Chart.js Bar Chart'
        },
        labels: {
          size: 16
        }
      }
    },
  });

  data = {
    labels: categories,
    datasets: [
      {
        label: 'Average number of XHR packets sent per category',
        data: values3,
        borderRadius: 15,
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: '#1E90FF'
        //borderColor: 'white'
      }
    ]
  };

  var myChart3= new Chart(ctx3, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      cornerRadius: 20,

      scales: {
        y: {
          beginAtZero: true,
          labels:{
            color:'white'
          },
          grid: {
            color:'#59595B',
            borderDash : [8,4]
          },
          ticks: {
            color:'white'
          }
        },
        x: {
          grid: {
          },
          ticks: {
            color:'white',
            autoSkip: false,
            maxRotation: 35,
            minRotation: 35,
            font: {
                size: 12,
            }
          }
        }
      },

      plugins: {
        legend: {
          position: 'top',
          labels: {
          color:'white',
            font: {
              size: 13,
            }
          }
        },
        title: {
          display: false,
          text: 'Chart.js Bar Chart'
        },
        labels: {
          size: 16
        }
      }
    },
  });

let nowDate = new Date(Date.now());
let day = nowDate.getDate();
let month = nowDate.getMonth()+1;
let year = nowDate.getUTCFullYear();
document.getElementById('datepicker').value  = year+'-'+'0'+month+'-'+day;
  var chart = await createChart(app,nowDate.toLocaleDateString());
  var ctx3 = document.getElementById("chartXHR").getContext("2d");

  var ranges = chart.labels;
  var data = {
    labels: ranges,
    datasets: [
      {
        label: 'Data sent by websites using XHR',
        data: chart.frequences,
        borderRadius: 15,
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: [getRandomColor(),getRandomColor(),getRandomColor(),getRandomColor(),getRandomColor()]

      }
    ]
  };

  myChart = await drawChart(myChart,ctx3,data);


  $('#datepicker').change(async function() {

      var date = $(this).val();
      let string = date.split('-');
      var dateFormat = string[2]+'/'+parseInt(string[1],10)+'/'+string[0];
      myChart.destroy();
      chart = await createChart(app,dateFormat);
      data = {
        labels: chart.labels,
        datasets: [
          {
            label: 'Data sent by websites using XHR',
            data: chart.frequences,
            borderRadius: 15,
            borderColor: 'rgb(0, 0, 0)',
            backgroundColor: [getRandomColor(),getRandomColor(),getRandomColor(),getRandomColor(),getRandomColor()]

          }
        ]
      };

      myChart = await drawChart(myChart,ctx3,data);
  });
}

async function drawChart(myChart,ctx3,data){
  myChart= new Chart(ctx3, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      cornerRadius: 20,
      scales: {
        y: {
          beginAtZero: true,
          labels:{
            color:'white'
          },
          grid: {
            color:'#59595B',
            borderDash : [8,4]

          },
          ticks: {
            color:'white'
          }
        },
        x: {
          grid: {
          },
          ticks: {
            color:'white',
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            font: {

                size: 12,

            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color:'white',
            boxWidth: 0,
            font: {
            size: 16,
            }
          }
        },
        title: {
          display: false,
          text: 'Chart.js Bar Chart'
        },
        labels: {
          size: 12
        }
      }
    },
  });
  return myChart;
}

async function createChart(app,date){
  let min_max = await find_min_max(app,date);

  let range = min_max.max - min_max.min;
  let width = Math.floor(range/5);

  let classes = [];
  let freq = [0,0,0,0,0];
  let value = min_max.min;
  let dec = 100;
  for(let i = 0; i<=5; i++){
    if(value<1000)
      dec = 10;
    else
      dec = 100;
    value = Math.floor(value/dec)*dec
    classes.push(value);
    value += width;
  }

  for(let website in app){
    let condition;
      for(let i = 0; i<=4; i++){
        if(app[website].dataShared && app[website].dataShared[date]){
          if(i == 4)
            condition =  true;
          else
            condition = app[website].dataShared[date].sum < classes[i+1];
          if((app[website].dataShared[date].sum >= classes[i]) && (condition)){
            freq[i]++;
            break;
          }
        }
      }

  }
  label = [];
  for(let i = 0; i<=4; i++){
    if(i == 4){
      label.push(classes[i]+'+');
    }else
      label.push(classes[i]+'-'+classes[i+1]);

  }
  return{
    labels : label,
    frequences : freq
  };
}



async function find_min_max(app,date){
  let minXHR = maxXHR = await getFirstKey(app,date);
  for(let website in app){
    if(app[website].dataShared && app[website].dataShared[date]){
      if(app[website].dataShared[date].sum < minXHR)
        minXHR = app[website].dataShared[date].sum;
      if(app[website].dataShared[date].sum > maxXHR)
        maxXHR = app[website].dataShared[date].sum;
    }
}

  let min_max = {
    min : minXHR,
    max : maxXHR
  };

  return min_max;
}

async function getFirstKey(data,date) {

  for (var prop in data){
    if(data[prop].dataShared && data[prop].dataShared[date])
      return data[prop].dataShared[date].sum;
  }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function scrollFunction(mybutton) {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
