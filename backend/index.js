require("./db");
require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors"); // Add this line
const app = express();
const { createServer } = require("http");
const fs = require("fs");
const morgan = require("morgan");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cookieParser = require('cookie-parser');
const stripe = require('stripe')("sk_test_51PdoPmRsi25iz5JVRePIfmgFPa9Xg6zZka6DCLBQVKbc2HQI0Ni9EKuVJuZDsNU1wiB5Vjp5rhcKa8NXustJz6SC00G5ww7IUZ");
// Add CORS middleware
app.use(cors({ origin: "*" })); // Configure CORS with options dfsd
app.use(fileUpload());
const ejs = require("ejs");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"..","frontend" ,"views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.static(path.join(__dirname, "..", "frontend", "views")));
app.use(express.static(path.join(__dirname, "..", "frontend", "css")));
app.use(express.static(path.join(__dirname, "..", "frontend", "js")));
app.use(express.static(path.join(__dirname, "..", "frontend", "Images")));
app.use(express.static(path.join(__dirname, "..", "frontend", "kachra")));
//app.use( express.static("D:/SE study material 3rd semester/SE Semester Project/GiftShare/frontend/html"));
//console.log(path.join(__dirname, "..", "frontend")); 
const server = createServer(app); 
//console.log(__dirname, "..\frontend"); 
console.log(path.join(__dirname,"..","frontend" ,"views"));
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8, 
}); 
 
const authRouter=require('./api/controllers/auth/router');
const donorRouter=require('./api/controllers/donor/router');
const recipientRouter=require('./api/controllers/recipient/router');
const categoryRouter=require('./api/controllers/category/router');
const adminRouter=require('./api/controllers/admin/router');
app.use('/api/auth', authRouter);
app.use('/api/donor', donorRouter); 
app.use('/api/recipient', recipientRouter);
app.use('/api/category', categoryRouter);
app.use('/api/admin', adminRouter);

 
// app.use("/admin", express.static(path.join(__dirname, "Builds/admin")));
 
// // If a user accesses /admin (or any subpath under /admin), serve the index.html from the admin build
// app.get("/admin/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "Builds/admin", "index.html"));
// });

app.use('/', express.static(path.join(__dirname, "..", "frontend", "html")));
  
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "html", "index.html"));
}); 

// //If a user accesses /admin (or any subpath under /admin), serve the index.html from the admin build
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "Builds/user", "index.html"));
// });

 
server.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT : ${process.env.PORT} .`);
  }); 


  