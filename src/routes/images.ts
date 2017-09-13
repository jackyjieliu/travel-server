import * as locationDetailService from '../dataservice/location-detail-service';
import * as express from 'express';
import * as _ from 'lodash';

interface Params {
  photoReference: string;
}

export const method = 'get';
export const path = '/images/:photoReference';

export async function handler(params: Params, res: express.Response) {
  const { photoReference } = params;

  const pictureResult = await locationDetailService.getPicture(photoReference, 300);

  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  res.end(new Buffer(pictureResult.body));
  // res.send({});
}

export function inputValidation(req: express.Request): Params | undefined {
  const photoReference = _.get(req, 'params.photoReference');

  if (photoReference) {
    return {
      photoReference: String(photoReference)
    };
  }
}