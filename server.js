var bodyParser = require('body-parser');
var chalk = require('chalk');
var cookieParser = require('cookie-parser');
var express = require('express');
var logger = require('morgan');
var path = require('path');

var app = express();
var config = require('./config');

app.set('jwtSecret', config.jwtSecret);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || config.port ||  3000);

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