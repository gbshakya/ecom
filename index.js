const app  =  require('./app');
const connectwithDb = require('./db');
require('dotenv').config()

const cloudinary = require('cloudinary')


//connection with db
connectwithDb()

//cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})



app.listen(process.env.PORT, () =>{
    console.log(`Server is running at pot ${process.env.PORT}`);
})