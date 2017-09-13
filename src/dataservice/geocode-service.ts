// https://www.npmjs.com/package/node-geocoder
// openstreetmap
// locationiq

import * as NodeGeocoder from 'node-geocoder';
import * as _ from 'lodash';
import * as cache from '../utils/cache';

const openStreetMapOptions = {
  provider: 'openstreetmap'
};

const openStreetMapGeocoder = NodeGeocoder(openStreetMapOptions);

export async function geocoder(q: string): Promise<{ lat: number; lng: number; place: string; }> {
  const key = 'geocode:' + q + ', US';
  const cached = await cache.get(key);

  if (cached) {
    try {
      console.log('Return from cache', { key, cached });
      return JSON.parse(cached);
    } catch (e) {
      // no op
    }
  }

  const results = await openStreetMapGeocoder.geocode(q + ', US');
  const result = _findResult(results);
  if (!result) {
    throw new Error('Error geocoding');
  }
  const lat = _.get(results, '[0].latitude');
  const lng = _.get(results, '[0].longitude');

  console.log('geocode for ' + q + ' is lat: ' + lat + ', lng: ' + lng);

  const r = {
    lat: Number(lat),
    lng: Number(lng),
    place: result.city + ',' + result.state + ',' + result.country
  };

  cache.set(key, JSON.stringify(r));

  return r;
}

interface Geocode {
  country: string; state: string; city: string; latitude: number; longitude: number;
}

function _findResult(results: any[]): undefined | Geocode {
  return _.find(results, (result) => {
    return result &&
      (result.country === 'US' || result.country === 'United States of America' || result.countryCode === 'US') &&
      !!result.state &&
      !!result.city &&
      !!result.latitude &&
      !!result.longitude;
  });
}