const { google } = require('googleapis');
const express = require('express');
const OAuth2Data = require('./google_key.json')
const app = express();
const port = process.env.PORT || 3001;

const CLIENT_ID = OAuth2Data.client.id;
const CLIENT_SECRET = OAuth2Data.client.secret;
const REDIRECT_URL = OAuth2Data.client.redirect;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;

// app.get("/", (req, res) => res.type('html').send(html));
const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile'
});

app.get('/', (req, res) => {
    var outh2 = google.oauth2({auth: oAuth2Client,version:'v2'});
    outh2.userinfo.v2.me.get(function (err, result) {
        if (err) {
            console.log(err);
        } else {
            loggedUser = result.data.name;
            console.log(loggedUser);
            res.send('Logged in:'.concat(loggedUser,'<img src="',result.data.picture,'"height="23" width="23">'))
        }
    });

})

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
                res.redirect('/')
            }
        });
    }
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));


const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello world!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello World!
    </section>
  </body>
</html>
`
