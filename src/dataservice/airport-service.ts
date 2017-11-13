import getConnection from '../database/travel';
import * as airportModel from '../database/airport-model';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';

export async function geoWithin(
  lat: number, lng: number, radius: number,
  otherParams: { min?: number; collection?: string; id?: string; limit?: number; symbols?: string[] } = {}
): Promise<airportModel.Airport[]> {
  const { min, collection, id, limit, symbols } = otherParams;
  const db = await getConnection();
  return new Promise<airportModel.Airport[]>((resolve, reject) => {
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

    if (symbols) {
      query.s = {
        $in: symbols
      };
    }

    console.log('near: ' + JSON.stringify(query));

    let findQuery = db.collection(collection || 'airports').find(query);

    if (limit) {
      findQuery = findQuery.limit(limit);
    }

    findQuery.toArray((err, docs) => {
      if (err) {
        reject(err);
      } else {
        const models = _.map(docs, (doc) => airportModel.fromDb(doc));
        resolve(models);
      }
    });
  });
}

export async function insertGeo(model: airportModel.AirportInsert, collection: string) {
  const dbModel = airportModel.toDb(model);
  const db = await getConnection();
  return db.collection(collection).insert(dbModel);
}

export async function byId(id: string): Promise<airportModel.Airport> {
  const db = await getConnection();

  return new Promise<airportModel.Airport>((resolve, reject) => {
    const query = {
      _id: new ObjectId(id)
    };

    console.log('byId: ' + JSON.stringify(query));
    db.collection('airports').find(query).toArray((err, docs) => {
      if (err || docs.length === 0) {
        reject(err || 'No results found');
      } else {
        resolve(airportModel.fromDb(docs[0]));
      }
    });
  });
}

export async function bySymbol(symbol: string): Promise<airportModel.Airport> {
  const db = await getConnection();

  return new Promise<airportModel.Airport>((resolve, reject) => {
    const query = {
      s: { $eq: symbol }
    };

    console.log('bySymbol: ' + JSON.stringify(query));
    db.collection('airports').find(query).toArray((err, docs) => {
      if (err || docs.length === 0) {
        reject(err || 'No results found');
      } else {
        console.log('docs:' + symbol, docs);
        resolve(airportModel.fromDb(docs[0]));
      }
    });
  });
}