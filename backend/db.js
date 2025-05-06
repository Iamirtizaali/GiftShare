const mongoose = require('mongoose');
require("dotenv").config({ path: ".env" });
mongoose.connect(process.env.MONGO_URL)
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));
