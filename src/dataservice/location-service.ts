import getConnection from '../database/travel';
import * as placesModel from '../database/places-model';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';

export async function geoWithin(
  lat: number, lng: number, radius: number,
  otherParams: { min?: number; collection?: string; id?: string } = {}
): Promise<placesModel.Place[]> {
  const { min, collection, id } = otherParams;
  const db = await getConnection();
  return new Promise<placesModel.Place[]>((resolve, reject) => {
    const query: any = {
      c: {
        $near: {
          $geometry: {
              type: 'Point' ,
              coordinates: [lng, lat]
          },
          $maxDistance: radius,
        }
      }
    };

    if (min) {
      query.c.$near.$minDistance = min;
    }

    if (id) {
      query._id = {
          $ne: new ObjectId(id)
      };
    }

    console.log('near: ' + JSON.stringify(query));

    // const query: any = {
    //   c: {
    //     $geoWithin: {
    //       $centerSphere: [
    //         [lng, lat], radius
    //       ],
    //     }
    //   }
    // };

    // console.log('geoWithin: ' + JSON.stringify(query));
    db.collection(collection || 'places').find(query).toArray((err, docs) => {
      if (err) {
        reject(err);
      } else {
        const models = _.map(docs, (doc) => placesModel.fromDb(doc));
        resolve(models);
      }
    });
  });
}
export async function insertGeo(model: placesModel.PlaceInsert, collection: string) {
  const dbModel = placesModel.toDb(model);
  const db = await getConnection();
  return db.collection(collection).insert(dbModel);
}

export async function byId(id: string): Promise<placesModel.Place> {
  const db = await getConnection();

  return new Promise<placesModel.Place>((resolve, reject) => {
    const query = {
      _id: new ObjectId(id)
    };

    console.log('byId: ' + JSON.stringify(query));
    db.collection('places').find(query).toArray((err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(placesModel.fromDb(docs[0]));
      }
    });
  });
}