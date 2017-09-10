import * as request from '../utils/request';
// TODO

const TOKEN = 'AIzaSyAqge5KEFVZIWoM7NrpJZWWf-ATtvKPwBA';
export async function getThingsToDo(place: string) {
  const URI = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

  // const query = place + '+things+to+do';
  const query = place.split(',').join(', ') + '+top+sights';
  const language = 'en';

  const ret = await request.get(URI, { query, language, key: TOKEN });
  // https://maps.googleapis.com/maps/api/place/textsearch/json?
  // query=${place}+things+to+do&
  // language=en&
  // key=AIzaSyAqge5KEFVZIWoM7NrpJZWWf-ATtvKPwBA

  return ret.results;
}

export async function getLocationDetail(place: string) {
  const URI = 'https://maps.googleapis.com/maps/api/geocode/json';
  const qs = {
    address: place.split(',').join(', '),
    key: TOKEN
  };

  const ret = await request.get(URI, qs);
  // https://maps.googleapis.com/maps/api/geocode/json?
  // address=${place}&
  // key=AIzaSyBvggl3bJWafeerhoEAF3mmRSJtr48KrmU

  if (ret && ret.results && ret.results.length > 0) {
    return ret.results[0];
  }

  throw new Error('No Results');
}

export function getPicture(photoReference: string, maxwidth: number) {
  const URI = 'https://maps.googleapis.com/maps/api/place/photo';
  // https://maps.googleapis.com/maps/api/place/photo?
  // maxwidth=400&
  // photoreference=${photoreference}&
  // key=AIzaSyBvggl3bJWafeerhoEAF3mmRSJtr48KrmU

  const qs = {
    maxwidth: maxwidth || 400,
    photoreference: photoReference,
    key: TOKEN
  };

  return request.raw('GET', true, URI, qs);
}