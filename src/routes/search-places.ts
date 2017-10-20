import * as express from 'express';
import * as _ from 'lodash';
import * as locationService from '../dataservice/location-service';
import * as geocodeService from '../dataservice/geocode-service';
import * as estimateDistance from '../utils/estimateDistance';
interface Params {
  query: string;
  days: number;
}

export const method = 'get';
export const path = '/places';

export async function handler(params: Params, res: express.Response) {
  const { query, days } = params;
  const radius = estimateDistance.driving(days);
  const min = estimateDistance.driving(1) / 8;
  const { lat, lng, place } = await geocodeService.geocoder(query);
  const locations = await locationService.geoWithin(lat, lng, radius, { min });

  // TODO: prefetch when cache is implemented.

  res.json({ locations, place });
}

export function inputValidation(req: express.Request): Params | undefined {
  const query = _.get(req, 'query.query');
  const days =  Number(_.get(req, 'query.days'));

  if (!query || !days) {
    return undefined;
  }
  return {
    query: String(query), days
  };
}
