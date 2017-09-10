export function fromDb(dbRecord: { _id: string, c: [number, number], n: string}): Place {
  return {
    id: dbRecord._id,
    coordinate: {
      lat: dbRecord.c[0],
      lng: dbRecord.c[1]
    },
    name: dbRecord.n
  };
}

export interface Place {
  id: string;
  coordinate: {
    lat: number;
    lng: number;
  };
  name: string;
}