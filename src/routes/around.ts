import * as locationService from '../dataservice/location-service';
import * as express from 'express';
import * as _ from 'lodash';
import * as estimateDistance from '../utils/estimateDistance';

interface Params {
  lat: number;
  lng: number;
  id: string;
  days?: number;
}

export const method = 'get';
export const path = '/around';

export async function handler(params: Params, res: express.Response) {
  const { lat, lng, days, id } = params;
  const radius = estimateDistance.driving(days || 2) / 8;
  const locations = await locationService.geoWithin(lat, lng, radius, { id });
  res.json({ locations, lat, lng, days });
}

export function inputValidation(req: express.Request): Params | undefined {
  const lat = Number(_.get(req, 'query.lat'));
  const lng = Number(_.get(req, 'query.lng'));
  const id = String(_.get(req, 'query.id'));
  const days = Number(_.get(req, 'query.days', 0));

  if (lat && lng) {
    return {
      lat, lng, days, id
    };
  }
}