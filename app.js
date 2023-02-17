import express from 'express'
import dotenv from 'dotenv'

import db from './src/config/db.config.js'
import { userModel } from './src/api/models/user.model.js';
import { signin, signup } from './src/api/routes/user.route.js'
dotenv.config()

const app = express();
app.use(express.json())

app.get('/',(req,res) => {
    res.send("Hey")
})

app.get('/dbinfo',(req,res) => {
    let name = db.name
    res.send(name)
})

app.get('/collections',(req,res) => {
    let collections = db.collections
    console.log(collections.users.name)
    res.send(collections.users.name)
})

app.post('/signin/:name',signin)

app.post('/signup/:name',signup)

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`App listening to http://localhost:${PORT}`))