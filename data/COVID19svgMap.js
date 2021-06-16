function InitLoadVaccines() {

  svgMapDataCOVID19Vaccinesjson = JSON.parse(Get('https://covid-api.mmediagroup.fr/v1/vaccines'));
//runs on all the countries in the data
  var items = Object.keys(svgMapDataCOVID19Vaccinesjson).map(function(key, index) {// items is an array of objects
    var new_key = svgMapDataCOVID19Vaccinesjson[key]['All']['abbreviation'];
    var calculated_vaccinated_rate = svgMapDataCOVID19Vaccinesjson[key]['All']['population'] != 0 ? (((svgMapDataCOVID19Vaccinesjson[key]['All']['people_vaccinated'] * 100) / svgMapDataCOVID19Vaccinesjson[key]['All']['population'])) : 0;
    var calculated_partially_vaccinated_rate = svgMapDataCOVID19Vaccinesjson[key]['All']['population'] != 0 ? (((svgMapDataCOVID19Vaccinesjson[key]['All']['people_partially_vaccinated'] * 100) / svgMapDataCOVID19Vaccinesjson[key]['All']['population'])) : 0;
  
    return {// in each run of the mapping make an object with the corresponding appriviation
      [new_key]: {// I want it to corrspond with the local where the properties are abr
        administered: svgMapDataCOVID19Vaccinesjson[key]['All']['administered'],
        people_vaccinated: svgMapDataCOVID19Vaccinesjson[key]['All']['people_vaccinated'],
        people_partially_vaccinated: svgMapDataCOVID19Vaccinesjson[key]['All']['people_partially_vaccinated'],
        population: svgMapDataCOVID19Vaccinesjson[key]['All']['population'],
        vaccinated_rate: calculated_vaccinated_rate,
        partially_vaccinated_rate: calculated_partially_vaccinated_rate
      }
    };
  });
  
  var COVID19MapData = Object.assign({}, ...items);// we need one object to correspond to the svg map
  delete COVID19MapData.undefined;
    
  svgMapDataCOVID19Vaccines = {// opject with 3 prpperties 
    data: {// what to write in the box
      administered: {
        name: 'Administered vaccines',
        thousandSeparator: ',',
      },
      people_vaccinated: {
        name: 'Vaccinated',
        thousandSeparator: ',',
      },
      people_partially_vaccinated: {
        name: 'Partially vaccinated',
        thousandSeparator: ',',
      },
      population: {
        name: 'Population',
        thousandSeparator: ',',
      },
      vaccinated_rate: {
        name: 'Vaccinated rate',
        format: '{0}%',
        floatingNumbers: 2,
      },
      partially_vaccinated_rate: {
        name: 'Partially vaccinated rate',
        format: '{0}%',
        floatingNumbers: 2,
      },
    },
    applyData: 'vaccinated_rate', // how to color
    values: COVID19MapData, // we just made this object
  };
}

function drawMap(){// it will be called in the index.js
  new svgMap({
    targetElementID: 'COVID19svgMap',// draws in the div COVID19svgMap
    countryNames: svgMapCountryNamesEN,
    data: svgMapDataCOVID19Vaccines,
    colorMin: '#FFF0F9',
    colorMax: '#730B62',
    minZoom: 1,
    maxZoom: 10,
    initialZoom: 1,
    flagType: 'image',
    hideFlag: false,
    noDataText: 'No Data Available'
  });
}

function SetMapOnClickEvents(){
  for(var item in svgMapCountryNamesEN){
      var cn = document.getElementById("COVID19svgMap-map-country-" + item);// this id is given by the svg map for each country
      if (cn != null ){
          cn.addEventListener("click", function(){
              selectedCountryAbbreviation = this.id.slice(this.id.length-2,this.id.length);
              var select = document.getElementById("countriesSelector");// the value in dropdown list 
              select.value = selectedCountryAbbreviation;

              selectedCountryName = select[select.selectedIndex].text;

              UpdatePage();
          });
      }
  }
}