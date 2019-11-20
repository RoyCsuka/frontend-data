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

# let op: geeft aantal van unieke combinaties van ?date en ?landLabel
SELECT ?landLabel ?lat ?long ?date (COUNT(?cho) AS ?choCount) WHERE {
   ?cho dct:created ?date;
        dct:spatial ?plaats .
 # We willen geen datums die de string [NI] bevatten
   FILTER (!REGEX(?date, "[NI]")) . #zorgt ervoor dat de string "NI" niet wordt meegenomen
 # geef het label van het land waar de plaats ligt en de lat/long van het land
   ?plaats skos:exactMatch/gn:parentCountry ?land .
   ?land wgs84:lat ?lat .
   ?land wgs84:long ?long .
   ?land gn:name ?landLabel .
} GROUP BY ?date ?landLabel ?lat ?long
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

    data.forEach(country => {
        // plotLocations(svg, country.values, mapSettings.projection)
    })
// plotAll(data)
}

//Todo: try this: https://stackoverflow.com/questions/7111584/using-nested-data-with-d3-js/7426206#7426206
function plotAll(data){
 	svg
        .selectAll('circle').data.map(d => d.values)
}

//Plot each location on the map with a circle
function plotLocations(container, data, projection) {
  svg
    .selectAll('.'+ data[0].landLabel)
    .data(data)
    .enter()
    .append('circle')
      .attr('class', data[0].landLabel)
      .attr('cx', d => projection([d.long, d.lat])[0])
      .attr('cy', d => projection([d.long, d.lat])[1])
      .attr('r', '0px')
      .transition()
  			//Delay calculation is still a work in progress
        .delay(d => svg.selectAll('circle').size() * mapSettings.circleDelay)//(d, i) => i * mapSettings.circleDelay)
        .duration(1500)
        .ease(d3.easeBounce)
        .attr('r', mapSettings.circleSize+'px')
}
