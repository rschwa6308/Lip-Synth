const express = require('express')
const path = require('path')
const { get } = require('request')
const dotenv = require('dotenv');
const SpotifyWebApi = require('spotify-web-api-js');
const { waitForDebugger } = require('inspector');

// initialize environment variables
dotenv.config();
const Tone = require('Tone')

// initialize the express app
const app = express()

// configure server
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// point server to static resources
app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, './samples')))

// listen on port 3000
app.listen(3000, () => console.log('Listening on port 3000!'))

// define url paths
app.get('/', (req, res) => res.sendFile(path.join(__dirname, "index.html")));




