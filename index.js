import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
// import userRoute from './src/api/routes/user.route.js'
import db from './src/config/db.config.js'
import { userModel } from './src/api/models/user.model.js';
dotenv.config()


const app = express();
app.use(express.json())

app.get('/',(req,res) => {
    res.send("Hey")
})



// app.get('/user',userRoute)
// app.get('/dbinfo',async(req,res) => {
//     let data = db.db.admin.
//     // // data.collection('Wallet1').find()
//     console.log(data)
//     res.send(data)
// })

app.get('/user',async(req,res) => {
    let user1 = await userModel.create({name: "Sufiyan", email: "abc@gmail.com"})
    console.log("user ", user1)
    user1.save()
    res.send(user1.toJSON())
})

app.get('/user')

app.post('/user',(req,res) => {

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.send("invalid request")
});
// app.get('/db',(req,res) => {
//     db.
// })

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`App listening to http://localhost:${PORT}`))