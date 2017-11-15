import * as locationService from '../dataservice/location-service';
import * as express from 'express';
import * as _ from 'lodash';
import * as request from '../utils/request';

interface Params {
  email: string;
  message: string;
  type: 'feedback' | 'suggestion';
}

export const method = 'post';
export const path = '/feedback';

export async function handler(params: Params, res: express.Response) {
  const { email, message, type } = params;

  const data =[
    'entry.1103048787=' + type,
    'entry.808878862=' + message,
    'entry.1826518903=' + email,
  ].join('&');

  const url = 'https://docs.google.com/forms/d/e/1FAIpQLSewaBXwIQ6t670NiyCxicw0jkLzXrw0dFOTnOrJoeTuhRvLqw/formResponse';
  const headers = {
    'Accept': 'application/xml, text/xml, */*; q=0.01',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };

  try {
    await request.post(url, data, headers, true);
  } catch (e) {
    console.log('error submitting form', e);
  }

  res.json({ success: true });
}

export function inputValidation(req: express.Request): Params | undefined {
  const email = _.get(req, 'body.email', '');
  const message = _.get(req, 'body.message', '');
  const type = _.get(req, 'body.type');

  if (type === 'feedback' || type === 'suggestion') {
    return {
      email: String(email),
      message: String(message),
      type: type as 'feedback' | 'suggestion'
    };
  }
}