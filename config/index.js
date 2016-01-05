let dev;

if (process.env.BUILD === 'local' ) {
    dev = require('./dev');
} else {
    dev = {};
}

let nodeEnv = process.env.NODE_ENV || dev.nodeEnv || 'development';
let jwtSecret = process.env.JWT_SECRET || dev.jwtSecret || 'mysecret';
let port = process.env.PORT || dev.port || '3030';
let db = {
    test: process.env.TEST_DB || dev.testDb || 'mongodb://localhost:27017/tsuyoku-api-test',
    production: process.env.PRODUCTION_DB || dev.productionDb || 'mongodb://localhost:27017/tsuyoku-api-production',
    development: process.env.DEVELOPMENT_DB || dev.developmentDb || 'mongodb://localhost:27017/tsuyoku-api-development'
};

module.exports = {
    nodeEnv,
    jwtSecret,
    port,
    db
};