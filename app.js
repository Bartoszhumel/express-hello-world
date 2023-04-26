const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')
const https = require('https');
const app = express()
const axios = require('axios')

const CLIENT_ID = OAuth2Data.client.id;
const CLIENT_SECRET = OAuth2Data.client.secret;
const REDIRECT_URL = OAuth2Data.client.redirect

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;
let loggedInUser = '';
let profilePic = '';
function revokeToken(){
    let postData = "token=" + oAuth2Client.access_token;

    let postOptions = {
        host: 'oauth2.googleapis.com',
        port: '443',
        path: '/revoke',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const postReq = https.request(postOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', d => {
            console.log('Response: ' + d);
        });
    });

    postReq.on('error', error => {
        console.log(error)
    });

// Post the request with data
    postReq.write(postData);
    postReq.end();
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.get('/login', (req, res) => {
    if (!authed) {
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        console.log(url)
        res.redirect(url);
    } else {
        var oauth2 = google.oauth2({auth: oAuth2Client, version: 'v2'});
        oauth2.userinfo.v2.me.get(function(err, response) {
        if(err) {
            console.log(err);
        } else {
            console.log(response.data);
            loggedInUser = response.data.name;
            profilePic = response.data.picture;
            res.send(loggedInUser + '<img src="'+ profilePic +'"height="23" width="23">'+ '<br>' + '<a href="/logout">Logout</a>');
        }
        });
    }
})
app.get('/logout', (req, res) => {
    authed = false;
    res.sendFile(__dirname + '/logout.html');
});
app.get('/gitlogout', (req, res) => {
    authed = false;
    res.redirect('/')
});
app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/login')
            }
        });
    }
});

app.set('view engine', 'ejs');
const clientID = '3f6b31177b7273d28e45'
const clientSecret = '1371431f0f22c8776f897e4d1477c93419610e6d'
app.get('/github/callback', function (req, res) {
    // The req.query object has the query params that were sent to this route.
    const requestToken = req.query.code
    if(!authed) {
    axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}&prompt=consent`,
        // Set the content type header, so that we get the response in JSON
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        access_token = response.data.access_token
        res.redirect('/success');
    })
    }else
    {
        res.redirect('/success');
    }
})
app.get('/success', function(req, res) {
    authed = true;
    axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
            Authorization: 'token ' + access_token
        }
    }).then((response) => {
        res.render('githubSucess',{ userData: response.data });
    })
});

const port = process.env.port || 5000
app.listen(port, () => console.log(`Server running at ${port}`));