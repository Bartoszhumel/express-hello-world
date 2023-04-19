const { google } = require('googleapis');
const express = require('express');
const OAuth2Data = require('./google_key.json')
const app = express();
const port = process.env.PORT || 3001;


const oauth2Client = new google.auth.OAuth2(
    OAuth2Data.web.client_id,
    OAuth2Data.web.client_secret,
    OAuth2Data.web.redirect_uris[0]
);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile'
];

const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    // If you only need one scope you can pass it as a string
    scope: scopes
});
var authed = false;

app.get('/', (req, res) => {
    if(!authed) {
        res.redirect(url);
    }else
    {
        var oauth2 = google.oauth2({auth: oauth2Client, version: 'v2'});
        oauth2.userinfo.v2.me.get(function(err, response) {
        if(err) {
            console.log(err);
            return;
        }else{
            loggedInUser = response.data.name;
            console.log(loggedInUser);
        }
        res.send('LOgged in: '.concat(loggedInUser));
        });
    }
})
app.get('/auth/google/callback', function (req, res) {
        oauth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oauth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/')
            }
        });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));