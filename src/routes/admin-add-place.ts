
import * as express from 'express';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as locationService from '../dataservice/location-service';

interface Params {
  place: {
    name: string;
    lat: number;
    lng: number;
    photos: string[];
  };
}

export const method = 'get';
export const path = '/admin/add-place';

export async function handler(params: Params, res: express.Response) {
  const place = params.place;
  console.log('add-palce', params.place);
  const result = await locationService.insertGeo(
    {
      name: place.name,
      coordinate: {
        lat: place.lat,
        lng: place.lng,
      },
      photos: place.photos,
    },
    'test'
  );
  if (result.insertedCount !== 1) {
    console.log(result);
    res.status(500).json({ good: false, message: 'insertion failed' });
    return;
  }
  fs.appendFileSync('./to-add.json', JSON.stringify(params.place) + ',' + '\n');
  res.json({ good: true });
}

export function inputValidation(req: express.Request): Params | undefined {
  let place = _.get(req, 'query.place') as any;

  if (place) {
    try {
      place = JSON.parse(place);
    } catch (e) {
      console.log('invalid json');
      place = {};
    }

    if (place.name &&
      place.lat && Number(place.lat) &&
      place.lng && Number(place.lng) &&
      _.isArray(place.photos) && place.photos.length >= 3) {

      return {
        place: {
          ...place,
          name: place.name.split(', ').join(','),
          lat: Number(place.lat),
          lng: Number(place.lng)
        }
      };
    } else {
      console.log('invalid args', [
        typeof place,
        !!place.name,
        !!place.lat ,
        !!Number(place.lat),
        !!place.lng,
        !!Number(place.lng),
        !!_.isArray(place.photos),
        _.isArray(place.photos) && (place.photos.length >= 3)
      ]);

    }

  }

  console.log('INVALID_PARAM', place);
}