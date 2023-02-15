import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

const app = express();

app.get('/',(req,res) => {
    res.send("Hey")
})

const PORT = process.env.PORT || 5000

app.listen(PORT,() => console.log(`Server started on port ${PORT}`))