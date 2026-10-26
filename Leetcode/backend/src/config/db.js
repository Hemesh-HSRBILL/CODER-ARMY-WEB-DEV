const mongoose = require("mongoose")
const path = require("path")
require('dotenv').config({ path: path.join(__dirname, "..", "..", ".env") });

async function main() {
    await mongoose.connect(process.env.DB_string)
}


module.exports = main;