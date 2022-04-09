const express = require('express')
const path = require('path')
const { get } = require('request')

// initialize the express app
const app = express()

// configure server
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// point server to static resources
app.use(express.static(path.join(__dirname, './public')))

// define url paths
app.get('/', (req, res) => res.sendFile(path.join(__dirname, "index.html")))

// listen on port 3000
app.listen(3000, () => console.log('Listening on port 3000!'))

