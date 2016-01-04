// pretty hacky solution, conditional imports are not allowed in es6
if (process.env.BUILD === 'local' ) {
    const dev = require('./dev');

    module.exports = dev;
} else {
    module.exports = {
        jwtSecret: process.env.JWT_SECRET,
        port: process.env.PORT,
        db: {
            test: process.env.TEST_DB,
            production: process.env.PRODUCTION_DB
        }
    }
}