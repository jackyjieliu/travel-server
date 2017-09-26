import * as express from 'express';
import * as searchPlaces from './search-places';
import * as placesDetails from './places-details';
import * as images from './images';
import * as place from './place';
import * as around from './around';

interface Route {
  method: string;
  path: string;
  handler: (req: express.Request, res: express.Response) => void | Promise<any>;
  inputValidation?: (req: express.Request) => boolean;
}

const helloWorldRoute: Route = {
  method: 'get',
  path: '/ping',
  handler: (req, res) => {
    res.json({
      message: 'Hello World!'
    });
  }
};

const routes = [helloWorldRoute, searchPlaces, placesDetails, images, place, around] as Route[];

export function bindRoutes(router: express.Router) {
  routes.forEach((route) => {
    router[route.method]('/api' + route.path, (req: express.Request, res: express.Response) => {
      let params;
      if (route.inputValidation) {
        params = route.inputValidation(req);
        if (!params) {
          res.status(500).json({ error: 'INVALID_PARAMS' });
          return;
        }
      }

      const promise = route.handler(params, res);

      // Catch error if it is a promise
      if (promise && promise.catch) {
        promise.catch((e) => {
          res.status(500).send({ error: e });
        });
      }
    });
  });
}