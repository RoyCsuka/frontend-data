// Voor local doeleinde
import config from './queryResults.json'

// local aanroepen
const jsonResults = config.results.bindings

// export functie zorgt voor database resultaten
export async function cleanedArr(endpoint, query){
  //Load the data and return a promise which resolves with said data
	let data = await loadData(endpoint, query)
    // console.log("raw data: ", data)

    data = data.filter(entry => filterData(entry, "continentLabel"))

    // Cleaning of year, number of items and continent
    data = cleanAllData()
    console.log("cleaned data of items: ", data)

	data = data.map(cleanData)
    // console.log("cleanedData: ", data)

    data = calculateAndGroup(data)
    console.log("End of cleanData", data)

    return data
}


// Haal data op en zet om in JSON met D3
function loadData(url, query){
  return d3.json(url +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.results.bindings)
}

//Returns true for each row that has something filled in for the given property
function filterData(row, property){
    return (row[property] != "" && row[property] != undefined)
}


// Dezen functie cleaned alle data
function cleanAllData() {
    let addContinentLatAndLong = addLatLongContinent(jsonResults);
    let convertYears = convertToYear(jsonResults);
    return addContinentLatAndLong && convertYears
}

// Eerste functie
function addLatLongContinent(obj) {
    obj.forEach(continent => {
        var continentObj = continent.continentLabel
        let contLat = "contLat";
        let contLong = "contLong";

        if(continentObj.value === "Azië") {
            continent.contLat = {value: 34.047900};
            continent.contLong = {value: -100.619700};
        }
        if(continentObj.value === "Afrika") {
            continent[contLat] = {value: 8.390759};
            continent[contLong] = {value: 20.316978};
        }
        if(continentObj.value === "Amerika") {
            continent[contLat] = {value: 14.355760};
            continent[contLong] = {value: -87.059610};
        }
        if(continentObj.value === "Eurazië") {
            continent[contLat] = {value: 45.450700};
            continent[contLong] = {value: 68.831900};
        }
        if(continentObj.value === "Antarctica") {
            continent[contLat] = {value: -82.862800};
            continent[contLong] = {value: 135.000000};
        }
        if(continentObj.value === "Oceanië") {
            continent[contLat] = {value: -23.555147};
            continent[contLong] = {value: 134.876390};
        }

    })
    let newLatLongCont = obj;
    return newLatLongCont
}

// Tweede functie van cleanAllData() die loopt over de items in de array
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


//Nest the data per preference (this will be our x-axis value
//Rollup data so we get averages and totals for each variable
//Note: this could also be done when visualizing the values
//    and we could make this pattern more functional by creating a mean and total function
function calculateAndGroup(source){
    let transformed =  d3.nest()
    .key(d => d.date).sortKeys(d3.descending)
        .key(d => d.continentLabel)
            .rollup(d => {
                return {
                    amountOfContinentItems: Number(d3.sum(d.map(itemsPerCountry => itemsPerCountry.choCount))),
                    contLat: d[0].contLat,
                    contLong: d[0].contLong,
                    country: d[0].landLabel,
                    countryLat: d[0].countryLat,
                    countryLong: d[0].countryLong,
                    continent: d[0].continentLabel
                }
            })
        .entries(source);
    return transformed
}
