function InitHistoryData(){
    confirmedAllCasesHistoryjson = JSON.parse(Get('https://covid-api.mmediagroup.fr/v1/history?status=confirmed'));
    recoveredAllCasesHistoryjson = JSON.parse(Get('https://covid-api.mmediagroup.fr/v1/history?status=recovered'));
    deathsAllCasesHistoryjson = JSON.parse(Get('https://covid-api.mmediagroup.fr/v1/history?status=deaths'));
}

function LoadCountryHistory() {//saves cases data in the global history array of objects for a selected country
    var COVID19ConfirmedCasesjson = confirmedAllCasesHistoryjson[selectedCountryName];
    var COVID19RecoveredCasesjson = recoveredAllCasesHistoryjson[selectedCountryName];
    var COVID19DeathsCasesjson = deathsAllCasesHistoryjson[selectedCountryName];
    
    confirmedCasesHistoryArray = GetCountryDatesArray(COVID19ConfirmedCasesjson);// converts the data to object array needed for the line in this form
    recoveredCasesHistoryArray = GetCountryDatesArray(COVID19RecoveredCasesjson);
    deathsCasesHistoryArray = GetCountryDatesArray(COVID19DeathsCasesjson);

    try{
        selectedCountryPopulation = COVID19ConfirmedCasesjson['All']['population'];// avoid error when the no information
    }
    catch{
        selectedCountryPopulation = 0;
    }
    
    if (selectedCountryPopulation == undefined){
        selectedCountryPopulation = 0;
    }
    
    delete confirmedCasesHistoryArray.undefined;
    delete recoveredCasesHistoryArray.undefined;
    delete deathsCasesHistoryArray.undefined;
}

function GetCountryDatesArray(caseData){

    var datesData;

    //Try to fill the data might get error on populationCount if the original data has some problem
    try {
        datesData = caseData['All']['dates'];
    }
    catch(err) {
        // if an error occured while filling the data we refill it with today date
        var datesArray = [{date: new Date(), value: "0"}];

        return datesArray; //prevents updating the chart
    }

    var datesArray = [];
    Object.keys(datesData).map(function(dateskey, index) {
        datesArray.unshift({date: d3.timeParse("%Y-%m-%d")(dateskey), value: datesData[dateskey]});   
    });// want to convert the order of the data 

    // If the data becomes 0 at some point continue the data with the last known value
    for (var i = 0; i < datesArray.length; i++){// Us goes to zero
        if(i > 0 && datesArray[i].value == 0){
            datesArray[i].value = datesArray[i - 1].value;
        }
    }

    return datesArray;
}

function drawLineChart(){

    var margin = {top: 10, right: 10, bottom: 20, left: 60},
    width = 800 - 60,
    height = 400 - 30;

    var svg = d3.select("#linePlot")
    .append("svg")
    .attr("width", 800)
    .attr("height", 400)
    .attr("margin", "auto")
    .attr("padding", "auto")
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
    .domain(d3.extent(confirmedCasesHistoryArray, function(d) { return d.date; }))
    .range([ 0, width ]);
    svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
    
    var yDomain;
    var yConfirmedDomain = d3.max(confirmedCasesHistoryArray, function(d) { return +d.value; });
    var yRecoveredDomain = d3.max(recoveredCasesHistoryArray, function(d) { return +d.value; });
    var yDeathesDomain = d3.max(deathsCasesHistoryArray, function(d) { return +d.value; });

    if (yConfirmedDomain > yDeathesDomain && yConfirmedDomain > yRecoveredDomain){
        yDomain = yConfirmedDomain;
    } else if (yDeathesDomain > yConfirmedDomain && yDeathesDomain > yRecoveredDomain){
        yDomain = yDeathesDomain;
    } else {
        yDomain = yRecoveredDomain;
    }

    var y = d3.scaleLinear()
    .domain([0 , yDomain])
    .range([ height, 0 ]);
    svg.append("g")
    .attr("class", "yAxis")
    .call(d3.axisLeft(y));

    svg.append("path")
    .datum(confirmedCasesHistoryArray)
    .attr("class", "confirmedDataLine")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) }));

    svg.append("path")
    .datum(recoveredCasesHistoryArray)
    .attr("class", "recoveredDataLine")
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) }));

    svg.append("path")
    .datum(deathsCasesHistoryArray)
    .attr("class", "deathsDataLine")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) }));

    // Text that shows the selected country name
    svg
        .append('g')
        .append('text')
        .attr("class","countryNameText")
        .attr("x", '20px')
        .attr("y", '5px')
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .style("opacity", 1)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");
    
    var legend_keys = ["Confirmed", "Recovered", "Deaths"]
    var color_scale = { Confirmed: "darkblue", Recovered: "darkgreen", Deaths: "darkred"};
    
    // The Legend for the line chart
    var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class","lineLegend")
        .attr("transform", function (d,i) {
            return "translate(" + 20 + "," + ((i*20) + 18) +")";
        });

    lineLegend.append("text").text(function (d) {return d;})
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .attr("transform", "translate(15,10)");

    lineLegend.append("rect")
        .attr("fill", function (d) {return color_scale[d]; })
        .attr("width", 10).attr("height", 10);

    // Circles tha moves along the lines
    svg
        .append('g')
        .append('circle')
        .attr("class","confirmedLineFollowingcircle")
        .style("fill", "darkblue")
        .attr("stroke", "black")
        .attr('r', 5)
        .style("opacity", 0);

    svg
        .append('g')
        .append('circle')
        .attr("class","recoveredLineFollowingcircle")
        .style("fill", "darkgreen")
        .attr("stroke", "black")
        .attr('r', 5)
        .style("opacity", 0);

    svg
        .append('g')
        .append('circle')
        .attr("class","deathsLineFollowingcircle")
        .style("fill", "darkred")
        .attr("stroke", "black")
        .attr('r', 5)
        .style("opacity", 0);

    // Text appears next to the legened with information from the lines
    svg
        .append('g')
        .append('text')
        .attr("class","confirmedLineText")
        .attr("x", '120px')
        .attr("y", '24px')
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    svg
        .append('g')
        .append('text')
        .attr("class","recoveredLineText")
        .attr("x", '120px')
        .attr("y", '44px')
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

   svg
        .append('g')
        .append('text')
        .attr("class","deathsLineText")
        .attr("x", '120px')
        .attr("y", '62px')
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    // the rectangle that handles the mouse movement
    svg
        .append('rect')
        .attr("class", "circlesRect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height);
        
}

function updateLineChart() {

    
    if (selectedCountryPopulation == 0){// write the name of the country in the text and stop
        d3.select(".countryNameText")
            .html(selectedCountryName);
        return;
    }

    var width = 740;
    var height = 370;

    var durationOfTransition = 2000;

    var svg = d3.select("#linePlot");

    var x = d3.scaleTime()
    .domain(d3.extent(confirmedCasesHistoryArray, function(d) { return d.date; }))
    .range([ 0, width ]);
    svg.selectAll(".xAxis")
    .transition()
    .duration(durationOfTransition)
    .call(d3.axisBottom(x));
    var yDomain;
    var yConfirmedDomain = d3.max(confirmedCasesHistoryArray, function(d) { return +d.value; });
    var yRecoveredDomain = d3.max(recoveredCasesHistoryArray, function(d) { return +d.value; });
    var yDeathesDomain = d3.max(deathsCasesHistoryArray, function(d) { return +d.value; });

    if (yConfirmedDomain > yDeathesDomain && yConfirmedDomain > yRecoveredDomain){
        yDomain = yConfirmedDomain;
    } else if (yDeathesDomain > yConfirmedDomain && yDeathesDomain > yRecoveredDomain){
        yDomain = yDeathesDomain;
    } else {
        yDomain = yRecoveredDomain;
    }

    var y = d3.scaleLinear()
    .domain([0 , yDomain])
    .range([ height, 0 ]);
    svg.selectAll(".yAxis")
    .transition()
    .duration(durationOfTransition)
    .call(d3.axisLeft(y));

    d3.select(".countryNameText")
    .html(selectedCountryName);

    var confirmedUpdater = svg.selectAll(".confirmedDataLine")
      .data([confirmedCasesHistoryArray], function(d){ return d.date });
  
    confirmedUpdater
        .enter()
        .append("path")
        .attr("class","confirmedDataLine")
        .merge(confirmedUpdater)
        .transition()
        .duration(durationOfTransition)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); }))
        .attr("fill", "none")
        .attr("stroke", "darkblue")
        .attr("stroke-width", 1.5);

    var recoveredUpdater = svg.selectAll(".recoveredDataLine")
        .data([recoveredCasesHistoryArray], function(d){ return d.date });
    
    recoveredUpdater
        .enter()
        .append("path")
        .attr("class","recoveredDataLine")
        .merge(recoveredUpdater)
        .transition()
        .duration(durationOfTransition)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); }))
        .attr("fill", "none")
        .attr("stroke", "darkgreen")
        .attr("stroke-width", 1.5);

    var deathsUpdater = svg.selectAll(".deathsDataLine")
        .data([deathsCasesHistoryArray], function(d){ return d.date });
    
    deathsUpdater
        .enter()
        .append("path")
        .attr("class","deathsDataLine")
        .merge(deathsUpdater)
        .transition()
        .duration(durationOfTransition)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); }))
        .attr("fill", "none")
        .attr("stroke", "darkred")
        .attr("stroke-width", 1.5);

    
    d3.select(".circlesRect")
        .on('mouseover', mouseOver)
        .on('mousemove', mouseMove)
        .on('mouseout', mouseOut);
    
    function mouseOver() {
        d3.select(".confirmedLineFollowingcircle").style("opacity", 1);
        d3.select(".recoveredLineFollowingcircle").style("opacity", 1);
        d3.select(".deathsLineFollowingcircle").style("opacity", 1);
        d3.select(".confirmedLineText").style("opacity",1);
        d3.select(".recoveredLineText").style("opacity",1);
        d3.select(".deathsLineText").style("opacity",1);
    }

    function mouseMove(event) {
        
        var rectClientRect = event.target.getBoundingClientRect();//gives the place of the circles rectangel
        var mouseRectX = event.clientX - rectClientRect.left;
        var DateX = x.invert(mouseRectX);

        var getDateIndex = d3.bisector(function(d) {
            return d.date;
        }).right;

        var dateIndex = getDateIndex(confirmedCasesHistoryArray, DateX);

        d3.select(".confirmedLineFollowingcircle")
        .attr("cx", x(confirmedCasesHistoryArray[dateIndex].date))
        .attr("cy", y(confirmedCasesHistoryArray[dateIndex].value));

        d3.select(".recoveredLineFollowingcircle")
        .attr("cx", x(recoveredCasesHistoryArray[dateIndex].date))
        .attr("cy", y(recoveredCasesHistoryArray[dateIndex].value));

        d3.select(".deathsLineFollowingcircle")
        .attr("cx", x(deathsCasesHistoryArray[dateIndex].date))
        .attr("cy", y(deathsCasesHistoryArray[dateIndex].value));

        d3.select(".confirmedLineText")
        .html("Date: " + confirmedCasesHistoryArray[dateIndex].date.toLocaleString("en-GB").split(',')[0] + "  -  " + "Confirmed: " + confirmedCasesHistoryArray[dateIndex].value.toLocaleString() + " Cases.");

        d3.select(".recoveredLineText")
        .html("Date: " + recoveredCasesHistoryArray[dateIndex].date.toLocaleString("en-GB").split(',')[0] + "  -  " + "Recovered: " + recoveredCasesHistoryArray[dateIndex].value.toLocaleString() + " Persons.");

        d3.select(".deathsLineText")
        .html("Date: " + deathsCasesHistoryArray[dateIndex].date.toLocaleString("en-GB").split(',')[0] + "  -  " + "deaths: " + deathsCasesHistoryArray[dateIndex].value.toLocaleString() + " Persons.");
    }

    function mouseOut() {
        d3.select(".confirmedLineFollowingcircle").style("opacity", 0);
        d3.select(".recoveredLineFollowingcircle").style("opacity", 0);
        d3.select(".deathsLineFollowingcircle").style("opacity", 0);
        d3.select(".confirmedLineText").style("opacity",0);
        d3.select(".recoveredLineText").style("opacity",0);
        d3.select(".deathsLineText").style("opacity",0);
    }
}

function updateTexts(){
    var confirmedCasesTotal;
    var recoveredCasesTotal;
    var deathsCasesTotal;

    try{
        confirmedCasesTotal = d3.max(confirmedCasesHistoryArray, function(d) { return +d.value; });
    }
    catch{ confirmedCasesTotal = 0;}

    try{
        recoveredCasesTotal = d3.max(recoveredCasesHistoryArray, function(d) { return +d.value; });
    }
    catch{ recoveredCasesTotal = 0;}

    try{
        deathsCasesTotal = d3.max(deathsCasesHistoryArray, function(d) { return +d.value; });
    }
    catch{ deathsCasesTotal = 0;}

    document.getElementById("selectedCountry").innerText = selectedCountryName;
    
    try{
        document.getElementById("populationCount").innerText = selectedCountryPopulation.toLocaleString();
        let dataDate = confirmedCasesHistoryArray[confirmedCasesHistoryArray.length - 1].date;
        document.getElementById("dataDate").innerText = dataDate.toLocaleString("en-GB").split(',')[0];
        document.getElementById("totalInfectedCount").innerText = confirmedCasesTotal.toLocaleString();
        document.getElementById("totalRecoveredCount").innerText = recoveredCasesTotal.toLocaleString();
        document.getElementById("totalDeathsCount").innerText = deathsCasesTotal.toLocaleString();

        if (selectedCountryPopulation == 0){
            document.getElementById("populationCount").innerText = "No data available";
            document.getElementById("dataDate").innerText = "../../....";
            document.getElementById("totalInfectedCount").innerText = "No data available";
            document.getElementById("totalRecoveredCount").innerText = "No data available";
            document.getElementById("totalDeathsCount").innerText = "No data available";
        }
    }
    catch{
        document.getElementById("populationCount").innerText = "No data available";
        document.getElementById("dataDate").innerText = "../../....";
        document.getElementById("totalInfectedCount").innerText = "No data available";
        document.getElementById("totalRecoveredCount").innerText = "No data available";
        document.getElementById("totalDeathsCount").innerText = "No data available";
    }

    try{
        document.getElementById("totalAdministeredVaccienes").innerText = svgMapDataCOVID19Vaccines['values'][selectedCountryAbbreviation].administered.toLocaleString();
        document.getElementById("totalVaccinated").innerText = svgMapDataCOVID19Vaccines['values'][selectedCountryAbbreviation].people_vaccinated.toLocaleString();
        document.getElementById("totalPartiallyVaccinated").innerText = svgMapDataCOVID19Vaccines['values'][selectedCountryAbbreviation].people_partially_vaccinated.toLocaleString();
    } catch{
        document.getElementById("totalAdministeredVaccienes").innerText = "No data available";
        document.getElementById("totalVaccinated").innerText = "No data available";
        document.getElementById("totalPartiallyVaccinated").innerText = "No data available";
    }
    
}

function CreatCountriesDropDown(){//make a dropdown list 
    var select = document.getElementById("countriesSelector");
    Object.keys(svgMapCountryNamesEN).map(function(key, index) {
        var abbreviation = key;
        var countryName = svgMapCountryNamesEN[key];
        var option = document.createElement("option");
        option.value = abbreviation;
        option.text = countryName;
        select.appendChild(option);
    });

    select.value = "DK";// first choice dk

    select.addEventListener("change", function(){
        selectedCountryAbbreviation = this.value;
        selectedCountryName = this[this.selectedIndex].text;
        UpdatePage();
    });
}