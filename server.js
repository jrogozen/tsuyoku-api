import bodyParser from 'body-parser';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path from 'path';

import config from './config';
import userRoutes from './routes/user';

let app = express();

app.set('jwtSecret', config.jwtSecret);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || config.port ||  3030);

// use routes
app.use('/users', userRoutes);

/*
*   export express app, listen (start), and close (end)
*/

module.exports.app = app;

module.exports.listen = function(options) {
    var nodeEnv = process.env.NODE_ENV || 'development';

    return new Promise((resolve) => {
        this.server = app.listen(app.get('port'), () => {
            if (nodeEnv === 'test') {
                console.log(chalk.cyan('Express test server started'));
            } else if (nodeEnv === 'development') {
                console.log(chalk.green('Express dev server listening on port ' + this.server.address().port));
            } else {
                console.log(chalk.red('Express production server listening on port ' + this.server.address().port));
            }


            // todo: seed db for dev & tests
            resolve();
        });
    });
};

module.exports.close = function(callback) {
    this.server.close(callback);
};