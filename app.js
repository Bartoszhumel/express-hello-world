const { google } = require('googleapis');
const express = require('express')
const app = express()
const axios = require('axios')

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;
let loggedInUser = '';
let profilePic = '';

const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
let data = [];
const connectDb = async () => {
    try {
        const pool = new Pool({
            user: process.env.POST_DATABASE_USER,
            host: process.env.POST_DATABASE_HOST,
            database: process.env.POST_DATABASE,
            password: process.env.POST_DATABASE_PASSWORD,
            port: process.env.POST_DATABASE_PORT,
            ssl:true
        });

        await pool.connect()
        data = await pool.query('SELECT * FROM users')
        await pool.end()
    } catch (error) {
        console.log(error)
    }
}
const updateuser = async (nazwa) => {
    console.log("Connecting to database");
    console.log(nazwa)
    try {
        const pool = new Pool({
            user: process.env.POST_DATABASE_USER,
            host: process.env.POST_DATABASE_HOST,
            database: process.env.POST_DATABASE,
            password: process.env.POST_DATABASE_PASSWORD,
            port: process.env.POST_DATABASE_PORT,
            ssl:true
        });
        await pool.connect()
        const today = new Date();
        const res = await pool.query("UPDATE users SET lastvisit = $1,counter = counter + 1 WHERE name = $2", [today,nazwa]);
        await pool.end()
    } catch (error) {
        console.log(error)
    }
}
const insertuser = async (nazwa) => {
    console.log("Connecting to database");
    console.log(nazwa)
    try {
        const pool = new Pool({
            user: process.env.POST_DATABASE_USER,
            host: process.env.POST_DATABASE_HOST,
            database: process.env.POST_DATABASE,
            password: process.env.POST_DATABASE_PASSWORD,
            port: process.env.POST_DATABASE_PORT,
            ssl: true
        });
        await pool.connect()
        await pool.connect()
        const today = new Date();
        const res = await pool.query("INSERT INTO users (name, joined, lastvisit, counter) VALUES ($1, $2, $3, $4)", [nazwa, today, today, 0]);
        console.log(res)
        await pool.end()
    } catch (error) {
        console.log(error)
    }

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
            connectDb().then();
            console.log(data);
            let array=[];
            let flag = false;
            for(var o in data.rows) {
                array.push(Object.values(data.rows[o]));
                if(array[o][1] === loggedInUser){
                    flag = true;
                }
            }
            if(flag === false){
                insertuser(loggedInUser).then();
            }else{
                updateuser(loggedInUser).then();
            }
            res.render('googleSucess',{ loggedInUser:loggedInUser,profilePic:profilePic, users: array});
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
const clientID = process.env.GIT_CLIENT_ID
const clientSecret = process.env.GIT_CLIENT_SECRET
app.get('/github/callback', function (req, res) {
    const requestToken = req.query.code
    if(!authed) {
    axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}&prompt=consent`,
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
        connectDb().then();
        console.log(data);
        let array=[];
        let flag = false;
        const loggedInUser = response.data.login;
        for(var o in data.rows) {
            array.push(Object.values(data.rows[o]));
            if(array[o][1] === loggedInUser){
                flag = true;
            }
        }
        if(flag === false){
            insertuser(loggedInUser).then();
        }else{
            updateuser(loggedInUser).then();
        }

        res.render('githubSucess',{ userData: response.data , users: array});
    })
});

const port = process.env.port || 5000
app.listen(port, () => console.log(`Server running at ${port}`));