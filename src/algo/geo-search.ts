import * as _ from 'lodash';
import * as locationService from '../dataservice/location-service';
import * as airportService from '../dataservice/airport-service';
import * as geocodeService from '../dataservice/geocode-service';
import * as estimateDistance from '../utils/estimateDistance';
import * as PlacesModel from '../database/places-model';
import * as AirportModel from '../database/airport-model';
export async function search(lat: number, lng: number, days: number) {
  if (days < 3) {
    return byLand(lat, lng, days);
  } else {
    const landP = byLand(lat, lng, days);
    const airP = byAir(lat, lng, days);

    const land = await landP;
    const air = await airP;

    const airNotInLand = _.differenceBy(air, land, (p) => {
      return p.id;
    });

    console.log(airNotInLand);

    const combined = land.concat(airNotInLand);
    return _.shuffle(combined);
  }
  // return byAir(lat, lng, days);
  // return byLand(lat, lng, days);
}

async function byLand(lat: number, lng: number, days: number) {
  const radius = estimateDistance.driving(days);
  const min = estimateDistance.driving(1) / 8;
  const locations = await locationService.geoWithin(lat, lng, radius, { min });
  return locations;
}

async function byAir(lat: number, lng: number, days: number) {
  const radius = 200 * 1000; // 200 km
  const airports = await airportService.geoWithin(lat, lng, radius, { limit: 2 });
  // console.log('airports', airports);
  const destAirports = _.flatMap(airports, (airport) => {
    return airport.destinations;
  });

  const destAirportsCodes = _.uniq(_.map(destAirports, (airport) => {
    return airport.symbol;
  }));

  if (destAirportsCodes.length <= 3) {
    // TODO: Consider connecting flights.
  }

  // Pick random destintaions:
  const count = (destAirportsCodes.length > 10) ? 10 : destAirportsCodes.length;
  const shuffledCodes = _.shuffle(destAirportsCodes);
  const dests = shuffledCodes.splice(0, count);

  let finalDestintations: PlacesModel.Place[] = [];
  // 4828032
  const metersPerDay = 5000000 / 4;

  const destinationAirports = await airportService.geoWithin(lat, lng, metersPerDay * days, {
    symbols: dests,
    min: 200 * 1000 // 200 km
  });

  for (const airport of destinationAirports) {
    const destFromAirport = await byLand(airport.coordinate.lat, airport.coordinate.lng, days - 2);

    // TODO: improve speed
    // Find airports that fly to this destination with more flights.
    const fromAirports = _(airports)
      .map((a: AirportModel.Airport) => {
        const des = a.destinations.find((d) => {
          return d.symbol === airport.symbol;
        });
        return {
          air: a,
          count: des ? des.count : 0
        };
      })
      .filter((r) => {
        return r.count > 0;
      })
      .sortBy((r) => {
        return r.count * -1;
      })
      .value();

    let fromAirport;
    if (fromAirports.length > 0) {
      fromAirport = fromAirports[0].air.symbol;
    }

    const destFromAirportWithAirport = destFromAirport.map((destination) => {
      return {
        ...destination,
        toAirport: airport.symbol,
        fromAirport
      };
    });
    finalDestintations = finalDestintations.concat(destFromAirportWithAirport);
  }

  // for (const dest of dests) {
  //   const airport = await airportService.bySymbol(dest);
  //   const destFromAirport = await byLand(airport.coordinate.lat, airport.coordinate.lng, days - 2);
  //   finalDestintations = finalDestintations.concat(destFromAirport);
  // }

  // console.log('finalDestintations', finalDestintations.length);
  const uniqPlaces = _.uniqBy(finalDestintations, (des) => {
    return des.id;
  });
  // console.log('uniqPlaces', uniqPlaces.length);
  return uniqPlaces;
}