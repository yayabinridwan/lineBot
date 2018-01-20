'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const axios = require('axios');
const cp = require('child-process-promise');
const config = {
  channelAccessToken: "bP51u0Q7bORxv5Eh4Z3kP4SoDLEqP+ysPnqxCRy9oZwjsSoQHTviSLk7BVbapb0PFXhkniJpz9wAqGpDp+4J2MhuZmrmZWCizhSBXllUKuonnx81ESGGkB8CDJiwqIk64DK4E1V6+nqePqEQSWpRagdB04t89/1O/w1cDnyilFU=" ,
  channelSecret: "056b3f3a932f10d7f86011989907f0ac",
};

const ddg = require('ddg');

const options = {
		"useragent": "My duckduckgo app",
		"no_redirects": "1",
        "no_html": "0",
        "format": "json"
};

// create LINE SDK client
const client = new line.Client(config);



// need raw buffer for signature validation

// init with auth

const app = express();
 
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    console.log(JSON.stringify(req.body))
 
});

const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

function handleText(message, replyToken, source) {
  
  switch (message.text) {
    case 'hai':
      if (source.userId) {
        return client.getProfile(source.userId)
          .then((profile) => replyText(
            replyToken,
            [
              `Halo kak ${profile.displayName}`,
              `gimana kabarnya?`,
            ]
          ));
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID');    
        }
      default:
        function handleSearch() {
          const search = message.text
          axios
            .get(`http://api.duckduckgo.com/?q=${search}&format=json&pretty=1`)
            .then(response => {
              const hasilSearch = response.data.Abstract;
              const hasilImg = response.Image
              const hasilImg1 = response.Image
  
              switch (true) {
                case hasilSearch.length < 1:
                  return replyText(replyToken, 'maaf aku ga nemuin');
                default:
                  return [
                    client.replyMessage(replyToken, { type: 'image',  originalContentUrl: hasilImg,
                    previewImageUrl: hasilImg}), 
                    replyText(replyToken, ['hasil pencarian kamu adalah', '' + hasilSearch])
                  ]
              }
            })
           .catch(err => console.log(err)) 
        }
        return handleSearch();
  }
}
// listen on port
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}


const port = 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);

    });
