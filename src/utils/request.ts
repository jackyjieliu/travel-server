import * as request from 'request';
import * as cache from './cache';
import * as _ from 'lodash';

function stringifyObject(obj: any) {
  return _.map(_.keys(obj), (key) => {
    let str;
    if (typeof obj[key] === 'object') {
      str = stringifyObject(obj[key]);
    }
    str = key + ':' + obj[key];
    return str;
  }).join('-');
}

function getKey(uri: string, qs: any, body: any) {
  const qsKey = stringifyObject(qs);
  const bodyKey = stringifyObject(body);

  return uri + ':qs:' + qsKey + ':body:' + bodyKey;
}

interface CacheKeyParams {
  uri: string;
  qs: any;
  body: any;
  rawResponse: boolean;
}

async function _checkCache({ uri, qs, body, rawResponse }: CacheKeyParams) {
  let key: string | Buffer = getKey(uri, qs, body);
  console.log('cache key', key);
  if (rawResponse) {
    key = new Buffer(key);
  }

  const cached = await cache.get(key as any);
  console.log('cached', cached);
  if (cached && rawResponse) {
    return {
      body: new Buffer(cached)
    };
  } else if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // no op
    }
  }

  return undefined;
}

function cacheResponse({ uri, qs, body, rawResponse }: CacheKeyParams, result: any) {
  const key = getKey(uri, qs, body);
  console.log('cache key', key);
  if (rawResponse) {
    cache.set(new Buffer(key) as any, result.body);
  } else {
    cache.set(key, JSON.stringify(result));
  }
}

export function raw(method: string, rawResponse: boolean, uri: string, qs?: any, body?: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const encoding = rawResponse ? null : undefined;

    const cacheResult = await _checkCache({ uri, qs, body, rawResponse });
    if (cacheResult) {
      console.log('returning from cache', { cached: cacheResult });
      resolve(cacheResult);
    } else {
      console.log('Making Request', { method, uri, qs, body, encoding });
      request({ method, uri, qs, body, encoding }, (e, res) => {
        if (e) {
          console.log('Request Error', { e });
          reject(e);
        } else {
          let j = res;
          if (!rawResponse) {
            j = res.body;
            try {
              j = JSON.parse(res.body);
            } catch (e) {
              // no op
            }
          }

          cacheResponse({ uri, qs, body, rawResponse }, j);
          if (rawResponse) {
            console.log('Request Success');
          } else {
            console.log('Request Success', {result: j});
          }
          resolve(j);
        }
      });
    }
  });
}

export function get(url: string, qs?: any) {
  return raw('GET', false, url, qs);
}
