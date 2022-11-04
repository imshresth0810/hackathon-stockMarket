const express = require('express')
const app = express()

// !cookies and parsers
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json()) 

//! dotenv
const dotenv = require("dotenv");
dotenv.config();

//! cors
const cors = require('cors')
app.use(
  cors()
);

// !Routes
const CreateUser= require("./routes/User");
const TransDetails = require("./routes/TransDetails"); 
const Transactions = require('./routes/Transactions');
app.use("/user",  CreateUser);
app.use("/transDetails",  TransDetails);
app.use("/transaction", Transactions);
// !SERVER WORK
const connection =  require("./db/db")
connection();

//! start server 
const port = process.env.PORT || 5000;
app.listen(port, (err) => {
    console.log(`Server is running on port: ${port}`);
    if (err) console.log(err);
  });
  