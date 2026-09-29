const express = require('express')

const app = express()

const PORT = process.env.PORT

app.get('/',(req,res)=>{
    res.end("Hello from server");
})

module.exports = app