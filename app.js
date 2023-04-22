const { google } = require('googleapis');
const express = require('express');
const OAuth2Data = require('./google_key.json')
const app = express();
const port = process.env.PORT || 3002;


const oauth2Client = new google.auth.OAuth2(
    OAuth2Data.web.client_id,
    OAuth2Data.web.client_secret,
    OAuth2Data.web.redirect_uris[0]
);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile'
];

var authed = false;

app.get('/', (req, res) => {
    if(!authed) {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        res.redirect(url);
    }else
    {
        console.log("zalogowany")
        var oauth2 = google.oauth2({auth: oauth2Client, version: 'v2'});
        oauth2.userinfo.v2.me.get(function(err, response) {
        if(err) {
            console.log(err);
            return;
        }else{
            loggedInUser = response.data.name;
            console.log(loggedInUser);
        }
        html='<p>Logged in as: '+loggedInUser+'</p>' +
            '<a href="/logout">Logout</a>';
        res.send(html);
        });
    }
});
app.get('/logout', function (req, res) {
    console.log("wylogowanie")
    var auth2 = google.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        res.redirect('/')
    });
    alert("googleLogout done.");
    authed = false;
});

app.get('/auth/google/callback', function (req, res) {
    console.log("przekierowano")
    const code = req.query.code
    if (code) {
        console.log("po otrzymaniu kodu")
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
    }else{
        console.log("nie ma kodu")
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));