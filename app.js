const express = require('express')
require('dotenv').config()
const app = express()
var morgan = require("morgan")
const cookieparser = require('cookie-parser')
const fileUpload = require('express-fileupload')


//for swagger documentaion
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve), swaggerUi.setup(swaggerDocument);




//cookie and file middleware
app.use(cookieparser())
app.use(fileUpload({
   useTempFiles : true,
   tempFileDir : "/tmp/" 
}))

//temp check
app.set("view engine", "ejs")

//regular middleware
app.use(express.json())
app.use(express.urlencoded({encoded : true}))


//morgan middleware
app.use(morgan('tiny'));

//import all routes here
const home = require('./routes/home')
const user = require('./routes/user')
const product  = require('./routes/product')

//router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use("/api/v1",product);



app.get("/signuptest",(req,res) =>{
    res.render("signuptest.ejs")
})

//export app js
module.exports = app;