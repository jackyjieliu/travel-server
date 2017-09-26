import * as locationService from '../dataservice/location-service';
import * as express from 'express';
import * as _ from 'lodash';

interface Params {
  id: string;
}

export const method = 'get';
export const path = '/place/:id';

export async function handler(params: Params, res: express.Response) {
  const { id } = params;
  const place = await locationService.byId(id);

  res.json({ location: place });
}

export function inputValidation(req: express.Request): Params | undefined {
  const id = _.get(req, 'params.id');

  if (id) {
    return {
      id: String(id)
    };
  }
}