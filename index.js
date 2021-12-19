const express = require('express');
const { STATUS_CODES } = require('http');
const app = express();
require('dotenv').config();
const port = 3100;
const querystring = require('querystring');
const axios = require('axios');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const stateKey = 'spotify_auth_state';

const generateRandomString = (length) => {
  let text = "";

  const possibilities = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text = text + possibilities.charAt(Math.floor(Math.random() * possibilities.length));
  }
  return text;
}

// Testing Routes 
app.get('/', (req, res) => {
  res.send('Hello Spots');
});

app.get('/test', (req, res) => {
  let data = {
    name: "Test"
    , city: "Toronto"
  }
  res.json(data);
})

// App Routes
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
  })
  res.redirect('https://accounts.spotify.com/authorize?' + queryParams);
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {
      if (response.status === 200) {

        const { access_token, token_type } = response.data;

      } else {
        res.send(response);
      }
    })
    .catch(error => {
      res.send(error);
    });

});

app.listen(port, () => {
  console.log('Connected at http://localhost:' + port);
})

