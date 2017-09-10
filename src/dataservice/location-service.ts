import mongoDbPromise from '../database/travel';
import * as placesModel from '../database/places-model';
import * as _ from 'lodash';

export async function geoWithin(lat: number, lng: number, radius: number): Promise<placesModel.Place[]> {
  const db = await mongoDbPromise;

  return new Promise<placesModel.Place[]>((resolve, reject) => {
    const query = {
      c: {
        $geoWithin: {
          $centerSphere: [
            [lng, lat], radius
          ]
        }
      }
    };

    console.log('geoWithin: ' + JSON.stringify(query));
    db.collection('places').find(query).toArray((err, docs) => {
      if (err) {
        reject(err);
      } else {
        const models = _.map(docs, (doc) => placesModel.fromDb(doc));
        resolve(models);
      }
    });
  });
}