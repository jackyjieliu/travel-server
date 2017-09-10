import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as routes from './routes';

const port = 3001;
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

routes.bindRoutes(router);

app.use('/', router);

app.listen(port, () => {
  console.log('App listening on port ' + port);
});

process.on('unhandledRejection', (error: any) => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error);
});