import * as _ from 'lodash';
import * as reqeust from '../utils/request';

const API_KEY = 'a2313cf0aeea2b7a745016476b833768';

// https://www.flickr.com/services/api/misc.urls.html
function _makeFlickrRequest(params: { [key: string]: any }) {
  const url = 'https://api.flickr.com/services/rest';
  const qs = _.defaults(params, {
    api_key: API_KEY,
    format: 'json',
    nojsoncallback: 1
  });
  return reqeust.get(url, qs);
}

async function _searchGeo(lat: number, lng: number, count: number = 5): Promise<any> {
  const params = {
    method: 'flickr.photos.search',
    privacy_filter: 1,
    // accuracy: 10,
    accuracy: 6,
    lat,
    lon: lng,
    // tags: 'landscape,nature,city,beach,water,scenery',
    // tags: ['monument', '-people'].join(','),
    // tags: ['scenery', '-people'].join(','),
    tags: ['landschaft', 'landscape', 'scenery'].join(','),
    // tags: ['landschaft', 'scenery', '-people'].join(','),

    // tag_mode: 'all',
    // sort: 'relevance',
    // sort: 'interestingness-asc',
    // sort: 'interestingness-desc',
    per_page: count
  };
  const response = await _makeFlickrRequest(params);
  return _.get(response, 'photos.photo');
}

export async function getPhoto(lat: number, lng: number, count: number = 5) {
  const PHOTO_URL_TEMPLATE = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg';
  const photos = await _searchGeo(lat, lng, count);
  const photoUrls = _.map(photos, (photo: any) => {
    return PHOTO_URL_TEMPLATE
      .replace('{farm-id}', photo.farm)
      .replace('{server-id}', photo.server)
      .replace('{id}', photo.id)
      .replace('{secret}', photo.secret);
  });

  return photoUrls;
}