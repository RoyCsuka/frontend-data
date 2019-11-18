import config from './queryResults.json'

const jsonResults = config.results.bindings

// Dezen functie cleaned alle data
function cleanAllData() {
    // https://stackoverflow.com/questions/11385438/return-multiple-functions
    let cleanYear = convertToYear(jsonResults);
    let makeValueNumber = numberOfItemsPerYearAndCountry(jsonResults);
    return cleanYear && makeValueNumber
}

// Tweede functie van cleanAllData()
function numberOfItemsPerYearAndCountry(item) {
    item.map(el => {
        el.choCount.value = parseInt(el.choCount.value)
    })
    return item
}

// cleanAllData(data)

// Eerste functie van cleanAllData() die loopt over de items in de array
function convertToYear(item) {
    item.forEach(el => {
        // Roept functie aan om alle gekke karakters schoon te maken
        var callCleanAll = cleanAllCharactersOfYear(el.date)

        // Roept splitStringCalcAverage functie aan als de data 1999-2000 is bijv.
        if(callCleanAll.value.includes("-") && callCleanAll.value.length >= 9) {
            callCleanAll.value = splitStringCalcAverage(callCleanAll.value)
        }

        // Checkt of de tekst eeuw bevat en vchr
        if(callCleanAll.eeuw === true && callCleanAll.vchr === false) {
            if(callCleanAll.value.length === 1) {
                callCleanAll.value.replace("-", "")
                callCleanAll.value + "00";
            } else if(callCleanAll.value.length >= 5 && !callCleanAll.value.includes("-")) {
                callCleanAll.value.slice(-4)
            } else {
                callCleanAll.value = splitStringEeuw(callCleanAll.value)
            }
        }

        // Maakt van alle waardes een eeuw door de eerste twee cijfers te selecteren en er twee nullen achter te plakken.
        callCleanAll.value = callCleanAll.value[0] + callCleanAll.value[1] + "00"
        // Maak van alle waardes cijfers
        callCleanAll.value = parseInt(callCleanAll.value)
    })

    let filterdData = item;
    let finalArray = deleteUnformattedData(filterdData)
    return finalArray;
}

// functie die alle gekke tekens en karakters schoonmaakt
function cleanAllCharactersOfYear(theData) {
    // Alles naar lowercase ivm verschillen in strings "ca" en  "Ca"
    theData.value = theData.value.toLowerCase();

    // Voor de zekerheid checken of de waarde een string is (zekeren voor het onzekeren)
    if(theData.value && typeof theData.value === "string") {
        // array van de tekens die ik als eerst wil vervangen
        var replaceSymbolsArr = [/\(/, /\)/, , /\?/, /\./, /\,/, /\s/, /\'/, /\:/, /\;/]
        // regix tekens vervangen met niks met for loop
        replaceSymbolsArr.forEach(value =>
            theData.value = theData.value
            .replace(
                new RegExp(value, "g"), ""
            )
        )

        theData.value = theData.value.replace("eeeuw", "eeuw")

        // Props: Wiebe en Stackoverflow (zie hieronder)
        // https://stackoverflow.com/questions/25095789/return-an-object-key-only-if-value-is-true
        // Stackoverflow heeft mij duidelijk gemaakt dat je een nieuwe key aan je object kan meegeven die de waarde true kan hebben.
        if(theData.value.includes("bc")) {
            theData.bc = true
            theData.value = theData.value.replace("bc", "");
            if (theData.value.includes("ad")) {
                theData.adValue = true
                theData.value = theData.value.replace("ad", "");
            } else {
                theData.adValue = false
            }
        } else {
            theData.bc = false
        }

        if(theData.value.includes("vchr")) {
            theData.vchr = true
            theData.vchr = theData.value.replace("vchr", "")
        } else {
            theData.vchr = false
        }

        if(theData.value.includes("eeuw")) {
            theData.eeuw = true
            theData.value = theData.value.replace("eeuw", "")
        } else {
            theData.eeuw = false
        }

        // Props: Wiebe
        var replaceCharacterssArr = ["a","b","c","d","e","f","g","h","i","j","k","l","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
        replaceCharacterssArr.forEach(el =>
            theData.value = theData.value
            .replace(
                new RegExp(el, "g"), ""
            )
        )

        if (theData.value.includes("/")) {
            theData.value = theData.value.replace('/', "-");
        }
    }

    return theData
}

// Props: Wiebe
function splitStringCalcAverage(data) {
    var splitString = data.split("-")

    if (splitString.length === 2) {
        // bereken het gemiddelde met een andere functie van de waarde 1997-1998
        return averageTwoYearsValue(splitString[0], splitString[1])
    } else {
        // return van 01-01-1998 alleen de waarde 1998
        return splitString[2]
    }
}

// Props: Wiebe
function averageTwoYearsValue(firstValue, secondValue) {
    return Math.round((firstValue*1 + secondValue*1) / 2);
}

// Functie die de eeuwen split
function splitStringEeuw(data) {
    var splitEeuw = data.toString().split("-")

    if(splitEeuw[0].length === 2) {
        return splitEeuw[0]
    } else if(splitEeuw[0].length === 3) {
        // stackoverflow: https://stackoverflow.com/questions/35486533/how-can-i-replace-first-two-characters-of-a-string-in-javascript
        // Hier heb ik alleen een geneste array omdat ik de lengte van het eerste object wil weten
        return splitEeuw[0][1] + splitEeuw[0][2] + "00"
    } else if(splitEeuw.length === 1) {
        return data
    } else {
        if(splitEeuw[1].length <= 2) {
            return splitEeuw[1] + "00"
        } else {
            return splitEeuw[1]
        }
    }
}

// Props: Coen
function deleteUnformattedData(array) {
    const finalArray = array.filter(item => {
        if (item.date.value.toString().length === 4 && item.date.value <= 2019 && item.date.value >= 0) {
            return item
        }
    })
 return finalArray
}

// einde opschonen van data



// Laurens zijn code!
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

// Eigen endpoint
const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-14/sparql"

makeVisualization()

// Our cleanAllData function which runs other function to make a visualization
async function makeVisualization(){
    //Wait for the promise to resolve with the data
    let data = await loadData(endpoint, query)
    console.log("rawData: ", data)

    // deze roept de cleanAllData functie aan die de jaartallen schoon maakt
    data = cleanAllData(data)
    console.log("cleanedData of dataset: ", data)

    data = data.map(cleanData)
    console.log("cleanedData: ", data)

	data = transformData(data)
    console.log("transformedData: ", data)
}

//Load the data and return a promise which resolves with said data
function loadData(url, query){
  return d3.json(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.results.bindings)
}

//Nest the data per country
function transformData(source){
  let transformed =  d3.nest()
        // Op landLabel heb ik gegroepeerd in de transformed.forEach method. Dit is allemaal geschreven door Laurens
		.key(function(d) {
            return d.date;
        })
        .key(function(d) {
            return d.landLabel;
        })
        // Dit is een rollup functie die door de array waardes van elke groep heen loopt. De waarde is weer gebaseerd op die array.
        // Geeft de lengte terug van de date
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d.amount;
            });
         })
        // Dit is de array van de data
		.object(source);
  return transformed
}

//This function gets the nested value out of the object in each property
// in our data
function cleanData(row){
   let result = {}
    Object.entries(row)
        .forEach(([key, propValue]) => {
            result[key] = propValue.value
  	})
   return result
}
