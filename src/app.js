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
    circleDelay: 11,
    circleSize: 6
}

makeVisualization()

// Our main function which runs other function to make a visualization
async function makeVisualization(){
    //Draw the map using a module
    drawMap(svg, mapSettings.projection)
    //Use the cleanedArr module to get and process our data
    let data = await cleanedArr(endpoint, query)

    // array van alle eeuw waardes
    const fields = data.map(d => { return d.key });


    data.forEach(century => {
        century.values.forEach(
            countries => {
                // console.log("Countries loop", countries.value)
                plotLocations(svg, [countries.value], mapSettings.projection)
            }
        )
        // plotLocations(svg, century, mapSettings.projection)
    })
    setUpCenturys(fields)
    // setUpRange()

}


//This awesome function makes dynamic input options based on our data!
//You can also create the options by hand if you can't follow what happens here
function setUpCenturys(fields) {
    const form = d3.select('form')
        .style('left', '16px')
        .style('top', '16px')
        .on('change', selectionChanged)
            .selectAll('input')
            .data(fields)
            .enter()
            .append('input')
            .attr('type', 'radio')
            .attr('name', 'century')
            .attr('value', d => d)
            .text(d => d)
    console.log("form",form)
}


//This function will change the graph when the user selects another variable
function selectionChanged(){
  //'this' refers to the form element!
  console.log("Changing graph to reflect this variable", this.value)
    // yVar = this.value
    setupScales()
    //y.domain([0, d3.max( data.map(preference => preference.value[yVar]) )] );

    // svg.selectAll('.bar')
    //     .attr('y', d => y(d.value[yVar]))
    //     .attr('height', d => height - y(d.value[yVar]))
    // svg.select('.axis-y')
    //     .call(d3.axisLeft(y).ticks(10))
}


// //Set up the scales we'll use
// function setupScales(){
//     //We'll set the x domain to the different preferences
    // x.domain(data.map(preference => preference.key))
//     //The y-domain is set to the min and max of the current y variable
//     y.domain([0, d3.max( data.map(preference => preference.value[yVar]) )] )
//     x.rangeRound([0, width]);
//     y.rangeRound([height, 0]);
// }

//Plot each location on the map with a circle
function plotLocations(container, data, projection) {
    // console.log("Checking", data[0].amountOfContinentItems)
    svg
        .selectAll('.'+ [data][0].country)
        .data([data][0])
        .enter()
        .append('circle')
            .attr('class', data.continent)
            .attr('cx', d => projection([d.contLong, d.contLat])[0])
            .attr('cy', d => projection([d.contLong, d.contLat])[1])
            .attr('r', '0px')
            .transition()
                // Delay calculation is still a work in progress
                .delay(d => svg.selectAll('circle').size() * mapSettings.circleDelay)//(d, i) => i * mapSettings.circleDelay)
                .duration(1500)
                .ease(d3.easeBounce)
                .attr('r', mapSettings.circleSize+'px')
    svg
        .selectAll('.'+ [data][0].country)
        .data([data][0])
        .enter()
            .append('text')
                .attr('x', d => projection([d.contLong, d.contLat])[0])
                .attr('y', d => projection([d.contLong, d.contLat])[1])
                .text(data[0].amountOfContinentItems)
}
