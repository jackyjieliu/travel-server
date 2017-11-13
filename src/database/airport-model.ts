import * as _ from 'lodash';
import * as mongodb from 'mongodb';

export function fromDb(dbRecord: DbRecord): Airport {
  return {
    id: dbRecord._id.toHexString(),
    coordinate: {
      lng: dbRecord.c[0],
      lat: dbRecord.c[1],
    },
    destinations: _.map(dbRecord.d, (d) => {
      return {
        symbol: d.s,
        count: d.n
      };
    }),
    passengerCount: dbRecord.p,
    symbol: dbRecord.s,
    name: dbRecord.n
  };
}

export function toDb(model: AirportInsert) {
  return {
    c: [model.coordinate.lng, model.coordinate.lat],
    d: _.map(model.destinations, (des) => {
      return {
        s: des.symbol,
        n: des.count
      };
    }),
    p: model.passengerCount,
    s: model.symbol,
    n: model.name,
  };
}

export interface Airport extends AirportInsert {
  id: string;
}

export interface AirportInsert {
  coordinate: {
    lat: number;
    lng: number;
  };
  destinations: Array<{ symbol: string; count: number; }>;
  passengerCount: number;
  symbol: string;
  name: string;
}

interface DbRecord {
  _id: mongodb.ObjectID;
  c: [number, number];
  d: Array<{s: string; n: number}>;
  p: number;
  s: string;
  n: string;
}

