import config from './queryResults.json'

const jsonResults = config.results.bindings

export async function cleanedArr(endpoint, query){
  //Load the data and return a promise which resolves with said data
	let data = await loadData(endpoint, query)
    // console.log("raw data: ", data)
    // Cleaning of year, number of items and continent
    data = cleanAllData()
    // console.log("cleaned data of items: ", data)

	data = data.map(cleanData)
    console.log("cleanedData: ", data)

	data = transformData(data)
    console.log("transformedData: ", data)

    let test = numberOfItemsPerCountry(data[0].values)

    // function kaaseten(jaartal, datadieikmeegeef) {
    //     datadieikmeegeef.values
    //
    //     if value.date === jaartal
    //
    // }

    data = data.map(country => {
        let objectCountTotal = numberOfItemsPerCountry(country.values)
        return {
            countryLat: country.values[0].lat,
            countryLong: country.values[0].long,
            objectData: country.values[0].date,
            objectCountTotal: objectCountTotal,
            countryName: country.key
        }
    })

    console.log(data)

    return data
}

// Haal data op en zet om in JSON
function loadData(url, query){
  return d3.json(url +"?query="+ encodeURIComponent(query) + "&format=json")
    .then(data => data.results.bindings)
}

// Dezen functie cleaned alle data
function cleanAllData() {
    // https://stackoverflow.com/questions/11385438/return-multiple-functions
    return convertToYear(jsonResults);
}

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

// Tweede functie van cleanAllData()
function numberOfItemsPerCountry(country) {
    let totalObjectCount = 0;
    country.forEach(el => {
        el.choCount = Number(el.choCount)
        totalObjectCount = totalObjectCount + el.choCount;
    })
    return totalObjectCount
}


//Nest the data per country
function transformData(source){
  let transformed =  d3.nest()
		.key(function(d) { return d.landLabel; })
		.entries(source);
  transformed.forEach(country => {
    country.amount = country.values.length
  })
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
