export function driving(days: number) { // in miles
  // const milesPerDay = 180;
  // const metersPerDay = 400 * 1000;
  const metersPerDay = 300 * 1000;

  // miles in radian
  // https://docs.mongodb.com/manual/tutorial/calculate-distances-using-spherical-geometry-with-2d-geospatial-indexes/
  // return (milesPerDay * days)  / 3963.2 ;
  return metersPerDay * (days / 2);
}