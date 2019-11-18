# Tech-track - Frontend Data
## De opdracht
Deze twee weken heb ik mij bezig gehouden met het verder uitwerken van het [concept van afgelopen twee weken](https://github.com/RoyCsuka/functional-programming). Deze twee weken staan in het teken van de interactie verwerken in je concept die in deze readme te vinden is.

# Concept
Mijn concept focust zich op het aantal items laten zien op basis van herkomst in combinatie met tijd. Als visuele uitwerking heb ik gekozen voor een map (zie afbeeldingen hieronder).

![Concept uitwerking scherm 1](https://github.com/RoyCsuka/assets/blob/master/concept-maps-v2_1.jpg)
Het concept laat het aantal items per continent zien op basis van een tijdsperiode.

![Concept uitwerking scherm 2](https://github.com/RoyCsuka/assets/blob/master/concept-maps-v2_1.jpg)
Het concept laat het aantal items per land zien op basis van een tijdsperiode met hierbij een historische gebeurtenis.

# Data
- [x] Data opschonen per eeuw
- [x] Externe database vinden van gebeurtenissen per eeuw
- [ ] Externe database opschonen
- [ ] Alle landen groeperen als super-continent
- [ ] Alles wat dezelfde locatie en jaartal heeft samenvoegen (het aantal items wel bij elkaar optellen)
- [ ] Alles per eeuw laten zien

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
![Externe database](https://github.com/RoyCsuka/assets/blob/master/externe-database.png) De resultaten van de externe database

## Data transformeren met D3
Met D3 heb ik de [code van Laurens](https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3) gepakt en maar twee zinnen van veranderd waardoor de groepering en counting van de arrays anders is gegaan. Met als eindresultaat:

## Technische specificaties
- Persoon X heeft mij geholpen met mijn opgeschoonde data om te zetten naar pure code.
