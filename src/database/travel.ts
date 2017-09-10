import * as mongodb from 'mongodb';
const url = 'mongodb://localhost:27017/travel';

const mongoDbOptions = {
  poolSize: 10
};

const connectionPromise: Promise<mongodb.Db> = new Promise((resolve, reject) => {
  mongodb.MongoClient.connect(
    url,
    mongoDbOptions,
    (err, db) => {
      if (err) {
        console.error('mongodb connection error: ', { err });
        reject(err);
      } else {
        resolve(db);
      }
    }
  );
});

export default connectionPromise;
