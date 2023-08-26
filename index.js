const express = require("express");
const { STATUS_CODES } = require("http");
const app = express();
require("dotenv").config();
const querystring = require("querystring");
const axios = require("axios");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const stateKey = "spotify_auth_state";
const FRONT_END_URI = process.env.FRONT_END_URI;
const PORT = process.env.PORT || 3100;

const generateRandomString = (length) => {
  let text = "";

  const possibilities =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text =
      text +
      possibilities.charAt(Math.floor(Math.random() * possibilities.length));
  }
  return text;
};

// Testing Routes
app.get("/", (req, res) => {
  res.send("<h2>Spotifacts API v1. Built By<a href='https://github.com/jatinaroragit'> Jatin Arora </a><h2>");
});

app.get("/test", (req, res) => {
  let data = {
    name: "Test",
    status: "Success",
  };
  res.json(data);
});

// App Routes
app.get("/login", (req, res) => {
  const scope = ["user-read-private", "user-read-email", "user-top-read"].join(" ");
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
  });

  res.redirect("https://accounts.spotify.com/authorize?" + queryParams);
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        const { access_token, refresh_token, expires_in } = response.data;
        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
          expires_in,
        });

        res.redirect((FRONT_END_URI)+ "?" + queryParams);
      } else {
        res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`);
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/refresh_token", (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: "post",
    url: "https://accounts.spotify.com/api/token",
    data: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${new Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.send(error);
    });
});

module.exports = app;

app.listen(PORT, () => {
  console.log("Connected at http://localhost:" + PORT);
});

