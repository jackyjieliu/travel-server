import * as locationService from '../dataservice/location-service';
import * as express from 'express';
import * as _ from 'lodash';
import * as estimateDistance from '../utils/estimateDistance';
import * as request from '../utils/request';
import * as flickrPhotoService from '../dataservice/flickr-photo-service';
import * as locationDetailService from '../dataservice/location-detail-service';

interface Params {
  name: string;
}

export const method = 'get';
export const path = '/admin/add/:name';

function _findName(formattedAddress: any, addressComponents: any, origName: string) {
  const country = (_.find(addressComponents, (a: { types: string[] }) => {
    return a.types.indexOf('country') > -1;
  }) || {} as any).short_name;

  const state = (_.find(addressComponents, (a: { types: string[] }) => {
    return a.types.indexOf('administrative_area_level_1') > -1;
  }) || {} as any).short_name;

  const city = (_.find(addressComponents, (a: { types: string[] }) => {
    return a.types.indexOf('locality') > -1;
  }) || {} as any).short_name;

  const ar = [city, state, country].filter((a) => !!a).join(', ');

  if (ar.toLowerCase().indexOf(origName.toLowerCase()) > -1) {
    return ar;
  } else if (formattedAddress && formattedAddress.toLowerCase().indexOf(origName.toLowerCase()) > -1) {
    return formattedAddress;
  }
  return ar;
}

function _findGeoData(r: any, origName: string) {
  console.log(r);
  const latitude = r.geometry.location.lat;
  const longitude = r.geometry.location.lng;
  const fullAddress = r.formatted_address;
  // address_components: [ { short_name: 'New York',
  //      types: [Object],
  //      long_name: 'New York' },
  //    { short_name: 'NY', types: [Object], long_name: 'NY' },
  //    { short_name: 'US', types: [Object], long_name: 'United States' } ]
  const lngName = _findName(r.formatted_address, r.address_components, origName);
  const types = r.types;
  const googlePlaceId = r.place_id;

  // const country = _findCountry(addressParts);
  // const state = _findState(addressParts);
  // const city = _findCity(r);
  return { latitude, longitude, fullAddress: lngName || fullAddress,
    // city, state, country,
    types, googlePlaceId };
}

export async function handler(params: Params, res: express.Response) {
  const { name } = params;

  const latlngResponse = await request
    .get(`http://www.datasciencetoolkit.org/maps/api/geocode/json`, { address: name });
  const { latitude, longitude, fullAddress } = _findGeoData(latlngResponse.results[0], name);

  const detailsP = locationDetailService.getLocationDetail(name);
  const details = await detailsP;

  const coord = details.geometry.location;

  const lng = longitude;
  const lat = latitude;

  const radius = 1000;
  const locations = await locationService.geoWithin(lat, lng, radius, { min:  0, collection: 'test' });
  // const locations = [];

  const photos = await flickrPhotoService.getPhoto(coord.lat, coord.lng, 500);

  res.json({
    lat,
    lng,
    name: fullAddress,
    closeBy: locations.map((a) => a.name),
    photos
  });
}

export function inputValidation(req: express.Request): Params | undefined {
  const name = String(_.get(req, 'params.name'));

  if (name) {
    return {
      name
    };
  }
}