import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { app as App, listen, close, server } from '../server';
import { errors } from '../constants';

const requester = supertest.agent('http://localhost:3030');

export {
    expect,
    supertest,
    mongoose,
    App,
    listen,
    close,
    server,
    errors,
    requester
};
