const { google } = require('googleapis');
const express = require('express');
const OAuth2Data = require('./google_key.json')
const app = express();
const port = process.env.PORT || 3002;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/auth/google/callback', function (req, res) {
    res.sendFile(__dirname + '/profile.html');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));