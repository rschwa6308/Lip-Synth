const express = require('express')
const path = require('path')
const { get } = require('request')
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-js');
const { waitForDebugger } = require('inspector');

// initialize environment variables
dotenv.config();

// initialize the express app
const app = express()

// configure server
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// point server to static resources
app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, './samples')))

// listen on port 3000
app..listen(process.env.PORT || 5000)

// define url paths
app.get('/', (req, res) => res.sendFile(path.join(__dirname, "index.html")));




