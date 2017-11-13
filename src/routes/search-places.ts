import * as express from 'express';
import * as _ from 'lodash';
import * as geoSearch from '../algo/geo-search';
import * as geocodeService from '../dataservice/geocode-service';

interface Params {
  query?: string;
  lat?: number;
  lng?: number;
  days: number;
}

export const method = 'get';
export const path = '/places';

export async function handler(params: Params, res: express.Response) {
  const { query, days } = params;
  let { lat, lng } = params;
  let place = 'your current location';
  if (query) {
    const decoded = await geocodeService.geocoder(query);
    lat = decoded.lat;
    lng = decoded.lng;
    place = decoded.place;
  }

  const locations = await geoSearch.search(lat, lng, days);

  // TODO: prefetch when cache is implemented.
  res.json({ locations: locations.slice(0, 10), place });
}

export function inputValidation(req: express.Request): Params | undefined {
  const query = String(_.get(req, 'query.query', ''));
  const days =  Number(_.get(req, 'query.days'));
  const lat =  Number(_.get(req, 'query.lat'));
  const lng =  Number(_.get(req, 'query.lng'));

  if (!days) {
    return undefined;
  }

  if (!query && (!lat || !lng)) {
    return undefined;
  }

  return {
    query,
    days,
    lat,
    lng
  };
}
