import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { app as App, listen, close, server } from '../server';
import { errors, defaultAccessToken } from '../constants';
import { inspect } from '../utils/generic';

const requester = supertest.agent('http://localhost:' + App.get('port'));

export {
    expect,
    supertest,
    mongoose,
    App,
    listen,
    close,
    server,
    errors,
    defaultAccessToken,
    requester,
    inspect
};
