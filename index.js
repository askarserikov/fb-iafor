'use strict';

// Imports dependencies and set up http server
const
  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server
  request = require('request');

// Sets server port and logs message on success
app.listen(process.env.PORT || 7000, () => console.log('webhook is listening'));



// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    console.log(PAGE_ACCESS_TOKEN);

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event.message);

      if (webhook_event.message) {
        console.log("It is indeed a message!");
        handleMessage(sender_psid, webhook_event.message);
      } else {
        console.log("It is not a message!");
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});



// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "rayonsan"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});



function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text) {
    console.log("I've received the following " + received_message.text);
    // Create the payload for a basic text message
    response = {
      "text": `Hello! Thank you for your interest!\n\nPlease contact us using the following email: info@iafor.com`
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}



function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}
