import * as locationService from '../dataservice/location-service';
import * as express from 'express';
import * as _ from 'lodash';
import * as estimateDistance from '../utils/estimateDistance';

interface Params {
  lat: number;
  lng: number;
  days?: number;
}

export const method = 'get';
export const path = '/around';

export async function handler(params: Params, res: express.Response) {
  const { lat, lng, days } = params;
  const radius = estimateDistance.driving(days || 2) / 2;
  const locations = await locationService.geoWithin(lat, lng, radius);
  res.json({ locations, lat, lng, days });
}

export function inputValidation(req: express.Request): Params | undefined {
  const lat = Number(_.get(req, 'query.lat'));
  const lng = Number(_.get(req, 'query.lng'));
  const days = Number(_.get(req, 'query.days', 0));

  if (lat && lng) {
    return {
      lat, lng, days
    };
  }
}