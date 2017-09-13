import * as redis from 'redis';
let client;
getClient();
function getClient() {
  if (client) {
    return client;
  }
  // client = redis.createClient({ port: 6379, host: 'http://localhost' });
  client = redis.createClient({ url: 'redis://localhost:6379', detect_buffers: true });

  client.on('end', () => {
    console.log('Redis connection lost');

    client = undefined;
    setTimeout(
      () => {
        getClient();
      },
      1000
    );
  });

  client.on('error', (err) => {
    console.log('Redis error', { err });
  });

  client.on('connect', () => {
    console.log('Connected to Redis');

    // flush();
  });
  return client;
}

export function set(key: string, data: any) {
  getClient().set(key, data);
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
