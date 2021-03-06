import * as locationDetailService from '../dataservice/location-detail-service';
import * as flickrPhotoService from '../dataservice/flickr-photo-service';
import * as express from 'express';
import * as _ from 'lodash';

interface Params {
  places: string[];
}

export const method = 'get';
export const path = '/places/details';

export async function handler(params: Params, res: express.Response) {
  const { places } = params;
  const locations = [];

  // TOOD: Improve this. make more requests in parallel. order of locations array does not matter
  for (const place of places) {
      const thingsToDoP = locationDetailService.getThingsToDo(place);
      const detailsP = locationDetailService.getLocationDetail(place);

      const thingsToDo = await thingsToDoP;
      const details = await detailsP;

      const coord = details.geometry.location;
      const photos = await flickrPhotoService.getPhoto(coord.lat, coord.lng);

      locations.push({
        name: place,
        pointsOfInterest: thingsToDo,
        details,
        photos
      });
  }

  res.json({ locations });
}

export function inputValidation(req: express.Request): Params | undefined {
  let places = _.get(req, 'query.places');

  if (_.isString(places)) {
    places = [places];
  }

  if (_.isArray(places) && places.length > 0) {
    return {
      places
    };
  }
}