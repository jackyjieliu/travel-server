import * as geolib from 'geolib';

interface Coord {
  lat: number;
  lng: number;
}

export function distanceBetween(coord1: Coord, coord2: Coord) {
  // return geolib.getDistance(
  //   { latitude: coord1.lat, longitude: coord2.lng },
  //   { latitude: coord2.lat, longitude: coord2.lng }
  // );
  return geolib.getDistanceSimple(
    { latitude: coord1.lat, longitude: coord2.lng },
    { latitude: coord2.lat, longitude: coord2.lng }
  );
}
