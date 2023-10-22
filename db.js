const {Client} = require('pg');

const pool =  new Client({
    host: 'localhost',
    user: 'postgres',
    database: 'XYZ',
    password: 'dheerajprasad',
})

module.exports = pool;