import * as request from 'request';

export function raw(method: string, rawResponse: boolean, uri: string, qs?: any, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const encoding = rawResponse ? null : undefined;
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

        console.log('Request Success', {result: j});
        resolve(j);
      }
    });
  });
}

export function get(url: string, qs?: any) {
  return raw('GET', false, url, qs);
}
