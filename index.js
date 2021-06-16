var svgMapDataCOVID19Vaccinesjson; // json data as it is
var svgMapDataCOVID19Vaccines;// ready to use by map 

var confirmedAllCasesHistoryjson;// all countries confirmed cases
var confirmedCasesHistoryArray; // for one country chosen by the selection 

var recoveredAllCasesHistoryjson;
var recoveredCasesHistoryArray;

var deathsAllCasesHistoryjson;
var deathsCasesHistoryArray;

var selectedCountryName;
var selectedCountryAbbreviation;
var selectedCountryPopulation;

function loadingData(bool) {
    document.getElementById('loadingData').style.display=(bool?'flex':'none');// div of loading data
}

 loadingData(true);

setTimeout(() => { // needed for chrome
    InitLoadVaccines(); // loads the jason object and fills data into global variebles shown above. 

    InitHistoryData();// loads the jason cases data and fills the variables. onfirmedAllCasesHistoryjson...

    drawMap();// draws the map

    selectedCountryName = "Denmark";
    selectedCountryAbbreviation = "DK"

    LoadCountryHistory();// according to the selected country name fills the arrays for the linechart.

    drawLineChart();// draws linechart useing the variables above

    updateLineChart();//updates the chart with the circles and makes transition 

    SetMapOnClickEvents();// updates the linechart when clicking on the map

    CreatCountriesDropDown();// makes the dropdown list of the couontries 

    updateTexts();// updates the text in the div on the upper left by the selected country 

    loadingData(false);// 
}, 5000);

function UpdatePage(){// this is invoced when a country in the map is selected or when a country is selected in the dropdown.up-data with the 
    //selected country data

    LoadCountryHistory();

    updateTexts();

    updateLineChart();

}
