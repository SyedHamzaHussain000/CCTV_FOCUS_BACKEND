require('dotenv').config();

const express = require('express')
const cors = require('cors')
const Connect_DB = require('./Database/Connect_DB')
const route = require('./Routes')

const app = express()
Connect_DB()

app.use(cors())
app.use(express.json())

app.use('/api', route)



app.listen(process.env.PORT, ()=>{
    console.log("Server is running")
})