const {createClient} = require('redis');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const redisclient = createClient({
    username: 'default',
    password: process.env.Redis_key,
    socket: {
        host: 'collaborative-whistle-cub-16881.db.redis.io',
        port: 19883
    }
});

module.exports = redisclient


