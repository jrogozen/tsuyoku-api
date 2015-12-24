import bodyParser from 'body-parser';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import path from 'path';

import config from './config';
import userRoutes from './routes/user';

let app = express();
let server = null;
let nodeEnv = process.env.NODE_ENV || 'development';

app.set('jwtSecret', config.jwtSecret);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('port', process.env.PORT || config.port ||  3030);

// connect to db
mongoose.connect(config.db[nodeEnv]);

// use routes
app.use('/users', userRoutes);

let listen = function() {
    return new Promise((resolve) => {
        server = app.listen(app.get('port'), () => {
            if (nodeEnv === 'test') {
                console.log(chalk.cyan('Express test server started'));
            } else if (nodeEnv === 'development') {
                console.log(chalk.green('Express dev server listening on port ' + server.address().port));
            } else {
                console.log(chalk.red('Express production server listening on port ' + server.address().port));
            }

            // todo: seed db for dev & tests
            resolve();
        });
    });
};

let close = function(callback) {
    if (server) {
        server.close(callback);
    }
};

export { app, listen, close };