# Tech-track - Frontend Data
## De opdracht
Deze twee weken heb ik mij bezig gehouden met het verder uitwerken van het [concept van afgelopen twee weken](https://github.com/RoyCsuka/functional-programming). Deze twee weken staan in het teken van de interactie verwerken in je concept die in deze readme te vinden is. De visualisatie bevat de data van de [organisatie wereldculturen](http://collectie.wereldculturen.nl/). De data bestaat uit objecten van vier museums in Nederland.

# Leerdoelen
- In D3 werken en een interactieve datavisualisatie maken
- Met .update(), .enter() en .exit() werken
- Een visualisatie maken die op zich zelf al duidelijk is

Lees [hier meer](https://github.com/RoyCsuka/frontend-data/wiki) over mijn begrip en toepassing op .update(), .enter() en .exit()

# Concept
Mijn concept focust zich op het aantal items laten zien op basis van herkomst in combinatie met tijd. Als visuele uitwerking heb ik gekozen voor een map (zie afbeeldingen hieronder).

![Concept uitwerking scherm 1](https://github.com/RoyCsuka/assets/blob/master/concept-maps-v2_3.jpg)

![Concept uitwerking scherm 2](https://github.com/RoyCsuka/assets/blob/master/concept-maps-v2_4.jpg)

# Eind resultaat op donderdag 28 november 2019 - 16:00
Het resultaat van de afgelopen twee weken is hieronder te zien en het proces is te volgen in mijn [wiki](https://github.com/RoyCsuka/frontend-data/wiki)
![Resultaat](https://i.gyazo.com/fb77f61a4fc58dff346a9786d4f3547d.gif)

# Data
## Endpoint resultaten
Als ik mijn SPARQL query inlaad via mijn endpoint (mijn gebruikte endpoint): 
```https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-14/sparql```

en deze data in de console.log() zette kreeg ik de volgende resultaten te zien:
![Image of raw data](https://i.gyazo.com/7c48f2b9bcbb2aa7a2ad6277d9c3dbe6.png)

## Schoonmaken van data
Daarna heb ik mijn cleanData() functie gerund. Deze functie maakt de jaartallen schoon en gooit onnodige data weg.
<details><summary>de volgende resultaten te zien:</summary>

![Image of cleaned data](https://i.gyazo.com/b1f6450b51d5a8bf8e87d1475501a397.png)
</details>

## Data transformeren
Vervolgens heb ik de data een niveau hoger gebracht met de volgende code:

```
//This function gets the nested value out of the object in each property
// in our data
function cleanData(row){
   let result = {}
    Object.entries(row)
        .forEach(([key, propValue]) => {
            // console.log(result[key] = propValue.value)
		    result[key] = propValue.value
  	})
    return result
}
```
<details><summary>resultaat:</summary>
	
![Cleand data](https://i.gyazo.com/6b44f33eb4f58b33949f5d130ae737b5.png)
</details>

## Data nesten
En als laatste stap heb ik de data genest met D3 op de volgende manier:

<details><summary>Wat ik gebruikt heb van Laurens zijn code:</summary>
	
```
function transformData(source){
   let transformed =  d3.nest()
	.key(d => d.preference)
	   .rollup(d => {
		return {
		   amount: d.length,
		   brothersTotal: d3.sum(d.map(correspondent => correspondent.brothers))
		}
	   })
	.entries(source);
   return transformed
}
```

</details>

<details><summary>Wat mijn code is geworden:</summary>
Ten opzichte van laurens zijn code heb ik het anders genest door ```.key(d => d.continentLabel)``` te gebruiken.
	    
```
function calculateAndGroup(source){
    let transformed =  d3.nest()
    .key(d => d.date).sortKeys(d3.descending)
        .key(d => d.continentLabel)
            .rollup(d => {
                return {
                    amountOfCountryItems: Number(d3.sum(d.map(itemsPerCountry => itemsPerCountry.choCount))),
                    contLat: d[0].contLat,
                    contLong: d[0].contLong,
                    country: d[0].landLabel,
                    countryLat: d[0].countryLat,
                    countryLong: d[0].countryLong,
                    continent: d[0].continentLabel,
                    date: d[0].date
                }
            })
        .entries(source);
    return transformed
}
```

</details>

En hieronder is het resultaat te zien:
![Getransformeerde data](https://i.gyazo.com/11316e6de779cec27c4bda24fade90a7.png)

## Een functie die functies runt om de data op te schonen. (Deze funtie expoteert naar app.js)
Om de data extern in te laden heb ik rollup gebruikt en hoef ik alleen maar de functies te runnen met de data erin. 
<details><summary>De functie:</summary>
	
```
// local aanroepen
const jsonResults = config.results.bindings

// export functie zorgt voor een clean array van de resultaten in de app.js
export async function cleanedArr(endpoint, query){
    //Load the data and return a promise which resolves with said data
	let data = await loadData(endpoint, query)
    console.log("raw data: ", data)

    data = data.filter(entry => filterData(entry, "continentLabel"))

    // Cleaning of year, number of items and continent
    data = cleanAllData()
    console.log("cleaned data of items: ", data)

	data = data.map(cleanData)
    console.log("cleanedData: ", data)

    data = calculateAndGroup(data)
    console.log("End of cleanData", data)

    return data
}
```
</details>

## Taken
Hieronder een lijstje van wat ik stap voor stap gefixt heb.
- [x] Data opschonen per eeuw
- [x] Externe database vinden van gebeurtenissen per eeuw
- [x] Externe database opschonen
- [x] Alle landen groeperen als super-continent (Afrika, Amerika, Eurazië en Oceanië)
- [x] Alles wat dezelfde locatie en jaartal heeft samenvoegen (het aantal items wel bij elkaar optellen)
- [x] Alles per eeuw laten zien

## Opschonen met JavaScript
In mijn vorige [Wiki leg ik stap voor stap uit](https://github.com/RoyCsuka/functional-programming/wiki/Data-cleaning) hoe ik mijn data heb schoongemaakt. I.v.m. tijdsnood heb ik de "v.chr", "n.chr", "bc" en "ad" data waardes en niet schoon kunnen maken. Daarom heb ik ervoor gekozen om deze if statement nog te defineren voordat ik de data terug geef aan mijn main functie.

```
if (item.date.value.toString().length === 4 && item.date.value <= 2019 && item.date.value >= 0) {
    // console.log(item.date.value)
    return item
}
```

Hierdoor is de data niet 100% compleet maar heb ik wel het functionele gedeelte gedaan en begrepen.

## Externe database
Online heb ik gezocht naar een database met historische gebeurtenissen in de wereld met [dit bestand als begin](https://slidex.tips/download/major-events-in-world-history). Uiteindelijk heb ik de data uit dit PDF'je gehaald en in Excel verwerkt. De data heb ik opgeschoond in Excel en heb ik geexpoteerd als CSV en omgezet naar JSON. Hieronder een regel uit de database:
![Externe database](https://github.com/RoyCsuka/assets/blob/master/external-database.png)

# D3
Met D3 heb ik de [code van Laurens](https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3) gepakt en maar twee zinnen van veranderd waardoor de groepering en counting van de arrays anders is gegaan. Met als eindresultaat:
![Gif van eindresultaat](https://gyazo.com/fb77f61a4fc58dff346a9786d4f3547d)

## Het proces
Om het te kunnen fixen in D3 heb ik eerst wat tutorial video's gekeken 

# Bronnenlijst
- D3 opschoon functie en opzet van de kaart: https://beta.vizhub.com/RoyCsuka/93aa46388dc6456581c22a3ea07af0be?edit=files&file=prepareData.js
- Opzet van de modules en de code. https://beta.vizhub.com/RoyCsuka/41ed839f714c4767bec2c53fe51f1713?edit=files&file=prepareData.js
- .on('change', functie) gebruikt: https://beta.vizhub.com/Razpudding/0e37e2146acf4a8db9a55f6f3509f090?edit=files&file=prepareData.js
- Om de minimale en maximale waarde te krijgen van een array: https://stackoverflow.com/questions/11488194/how-to-use-d3-min-and-d3-max-within-a-d3-json-command/24744689
- Stukje geschreven door kris om mijn array "flat" te maken
```
const flattened = arrOfSelectedData.values.reduce((newArray, countries) => {
    newArray.push(countries.value)
    return newArray.flat()
}, [])
```
- Om het witte vlak mee te laten bewegen on click: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
