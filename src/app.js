import { select , geoNaturalEarth1} from 'd3'
import { feature } from 'topojson'
import { cleanedArr } from './cleanData.js';
import { drawMap } from './drawMap.js';

// D3 data transfomeren
// Eigen query aangepast
const query = `PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX gn: <http://www.geonames.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?landLabel ?countryLat ?countryLong ?continentLabel ?contLat ?contLong ?date (COUNT(?cho) AS ?choCount) WHERE {
   ?cho dct:created ?date;
        dct:spatial ?plaats .

  FILTER (!REGEX(?date, "[NI]")) .

   ?plaats skos:exactMatch/gn:parentCountry ?land .
   ?land wgs84:lat ?countryLat .
   ?land wgs84:long ?countryLong .
   ?land gn:name ?landLabel .

  <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?continent .
  ?continent skos:prefLabel ?continentLabel .
  ?continent skos:narrower* ?place .
  ?cho dct:spatial ?place .


} GROUP BY ?date ?landLabel ?countryLat ?countryLong ?continentLabel ?contLat ?contLong
ORDER BY DESC(?choCount)`

// Mijn end-point
const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-14/sparql"
const svg = select('svg')

const mapSettings = {
    projection: geoNaturalEarth1().rotate([-11,0]),
    circleDelay: 11
}

// Scales
let scale = d3.scaleLinear()

// Global data variable
let data

// standaard waarde
let centuryVar = 2000;


makeVisualization()

// Our main function which runs other function to make a visualization
async function makeVisualization(){
    //Draw the map using a module
    drawMap(svg, mapSettings.projection)
    //Use the cleanedArr module to get and process our data
    data = await cleanedArr(endpoint, query)

    // array van alle eeuw waardes
    // const fields = data.map(d => { return d.key });

    // var min = d3.min(data.amountOfCountryItems, function (d) { return d.amountOfCountryItems; });
    // var max = d3.max(data.amountOfCountryItems, function (d) { return d.amountOfCountryItems; });


    setUpCenturys(data)

}


//This awesome function makes dynamic input options based on our data!
//You can also create the options by hand if you can't follow what happens here
function setUpCenturys(data) {
    const form = d3.select('form')
        .style('left', '16px')
        .style('top', '16px')
            .selectAll('input')
            .data(data)
            .enter()
                .append('label')
                    .append('span')
                        .text(d => d.key)
                    .append('input')
                        .property('checked', d => d.key == centuryVar)
                        .attr('type', 'radio')
                        .attr('name', 'century')
                        .attr('value', d => d.key)
                            .on('change', selectionChanged)

}


//This function will change the graph when the user selects another variable
function selectionChanged(){
    //'this' refers to the form element!
    centuryVar = this ? parseInt(this.value) : centuryVar
    console.log("Dit is de huidige century ",centuryVar)
    // Laurens heeft mij hiermee geholpen
    let arrOfSelectedData = data.find(element => element.key == this.value)
    // veranderd de tekst boven aan
    document.querySelector("p b:last-of-type").innerHTML =  centuryVar + " & " + (centuryVar + 100);

    let amountOfCountryValues = arrOfSelectedData.values.map(e => e.value).map(v => v.amountOfCountryItems)

    // Credits to: https://stackoverflow.com/questions/11488194/how-to-use-d3-min-and-d3-max-within-a-d3-json-command/24744689
    // Check min en max van huidige selectie
    // create an array of key, value objects
    let max = d3.entries(amountOfCountryValues)
        .sort(function(a, b) {
            return d3.descending(a.value, b.value);
        })[0].value;
    let min = d3.entries(amountOfCountryValues)
        .sort(function(a, b) {
            return d3.ascending(a.value, b.value);
        })[0].value;

    let amountOfAllItems = d3.sum(amountOfCountryValues)
    // veranderd de tekst boven aan
    document.querySelector("p b:first-of-type").innerHTML =  amountOfAllItems;

    arrOfSelectedData.values.forEach(countries => {
        plotLocations(svg, [countries.value], mapSettings.projection, min, max)
    })
}


//Plot each location on the map with a circle
function plotLocations(container, data, projection, min, max) {

    let filterdNestedData = [data][0].filter(e => e.date === centuryVar)

    const scale = d3.scaleLinear().domain([ min, max ]).range([ 6, 80 ]);



    //geneste tekst en circle van: http://bl.ocks.org/ChrisJamesC/4474971
    let circles = svg.selectAll('.' + [data][0][0].country)
        .data([data][0])
        console.log(data[0])

    let elemEnter = circles
        .enter()
        .append("g")
        .attr('class', [data][0][0].date)

    let circle = elemEnter
        .append('circle')
        // .attr('class', [data][0][0].continent)
        .attr('cx', d => projection([d.contLong, d.contLat])[0])
        .attr('cy', d => projection([d.contLong, d.contLat])[1])
        //https://stackoverflow.com/questions/9481497/understanding-how-d3-js-binds-data-to-nodes
        .attr('r', function(d) { return scale([data][0][0].amountOfCountryItems) })

    elemEnter
        .append('text')
        .attr('x', d => projection([d.contLong, d.contLat])[0])
        .attr('y', d => projection([d.contLong, d.contLat])[1])
            .text([data][0][0].amountOfCountryItems)

    // selectAll('g')
    //     .exit()
    //     .remove()

    // updateFunction()

}
