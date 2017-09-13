import * as mongodb from 'mongodb';
const url = 'mongodb://localhost:27017/travel';

const mongoDbOptions = {
  poolSize: 10
};

let connectionPromise: Promise<mongodb.Db> | undefined;

function getConnection() {
  if (!connectionPromise) {
    connectionPromise = new Promise((resolve, reject) => {
      mongodb.MongoClient.connect(
        url,
        mongoDbOptions,
        (err, db) => {
          if (err) {
            console.log('mongodb connection error: ', { err });
            reject(err);
          } else {
            console.log('Connected to mongodb');
            resolve(db);
          }
        }
      );
    });

    connectionPromise.catch(() => {
      connectionPromise = undefined;
      setTimeout(
          () => {
            getConnection();
          },
          2000
        );
    });

    connectionPromise.then((db) => {
      db.on('close', () => {
        console.log('Disconnected from mongodb');
        connectionPromise = undefined;
        setTimeout(
          () => {
            getConnection();
          },
          2000
        );
      });
    });
  }

  return connectionPromise;
}

getConnection();

export default getConnection;
