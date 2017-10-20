export function fromDb(dbRecord: { _id: string, c: [number, number], n: string}): Place {
  return {
    id: dbRecord._id,
    coordinate: {
      lng: dbRecord.c[0],
      lat: dbRecord.c[1],
    },
    photos: [],
    name: dbRecord.n
  };
}

export function toDb(model: PlaceInsert) {
  return {
    c: [model.coordinate.lng, model.coordinate.lat],
    n: model.name,
    p: model.photos
  };
}

export interface Place extends PlaceInsert {
  id: string;
}
export interface PlaceInsert {
  coordinate: {
    lat: number;
    lng: number;
  };
  name: string;
  photos: string[];
}