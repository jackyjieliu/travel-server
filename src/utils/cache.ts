import * as redis from 'redis';
let client: redis.RedisClient;
getClient();
function getClient() {
  if (client) {
    return client;
  }
  // client = redis.createClient({ port: 6379, host: 'http://localhost' });
  client = redis.createClient({ url: 'redis://localhost:6379', detect_buffers: true });

  const errorListener = (err) => {
    console.log('Redis error', { err });
  };
  client.on('error', errorListener);

  const connectListener = () => {
    console.log('Connected to Redis');
    // flush();
  };
  client.on('connect', connectListener);

  const endListener = () => {
    console.log('Redis connection lost');

    // TODO: this does not work
    // client.removeListener('error', errorListener);
    // client.removeListener('connect', connectListener);

    client = undefined;
    setTimeout(
      () => {
        getClient();
      },
      1000
    );
  };
  client.once('end', endListener);

  return client;
}

export function set(key: string, data: any, expirationInSeconds?: number) {
  if (expirationInSeconds === undefined) {
    expirationInSeconds = EXPIRATION.TWENTY_FIVE_DAYS;
  }
  getClient().set(key, data, 'EX', expirationInSeconds);
}

export function get(key: string): void | any {

  return new Promise((resolve, reject) => {
    getClient().get(key, (err, reply) => {
      if (err) {
        resolve('');
      } else {
        resolve(reply);
      }
      return;
    });
  });
}

export function flush() {
  client.flushdb((err, succeeded) => {
    console.log('redis cache flushed', { succeeded: !!succeeded });
  });
}

export const EXPIRATION = {
  TWENTY_FIVE_DAYS: 25 * 86400 // twenty five days in seconds.
};
