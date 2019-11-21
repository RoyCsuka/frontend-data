import { geoPath } from 'd3'
import { feature } from 'topojson'

export function drawMap(container, projection){
    const pathGenerator = geoPath().projection(projection)
    setupMap(container, pathGenerator)
    drawContinents(container, pathGenerator)
}

function setupMap(container, pathGenerator){
  container
    .append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({ type: 'Sphere' }))
}

function drawContinents(container, pathGenerator) {
  d3.json('https://piwodlaiwo.github.io/topojson//world-continents.json').then(data => {
    const countries = feature(data, data.objects.continent);
    container
      .append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr("class", function(data,i) {
            data.properties.continent = data.properties.continent.toLowerCase().replace(/\s/g, '-');
            return data.properties.continent;
          })
          .attr('d', pathGenerator)
  })
}
