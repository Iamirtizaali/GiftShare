const mongoose = require('mongoose');
require("dotenv").config({ path: ".env" });
//mongoose.connect('mongodb+srv://aliirtiza859:Irtizaali859.@irtizacluster.l7kp5.mongodb.net/');
mongoose.connect("mongodb://localhost:27017/GiftShare")
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to MongoDB'));
