export function driving(days: number) { // in miles
  const milesPerDay = 180;

  // miles in radian
  // https://docs.mongodb.com/manual/tutorial/calculate-distances-using-spherical-geometry-with-2d-geospatial-indexes/
  return milesPerDay * days  / 3963.2 ;
}