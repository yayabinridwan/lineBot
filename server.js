'use strict';

//module

const line = require('@line/bot-sdk');
const express = require('express');
const axios = require('axios');
const cp = require('child-process-promise');
const config = {
  channelAccessToken: "bP51u0Q7bORxv5Eh4Z3kP4SoDLEqP+ysPnqxCRy9oZwjsSoQHTviSLk7BVbapb0PFXhkniJpz9wAqGpDp+4J2MhuZmrmZWCizhSBXllUKuonnx81ESGGkB8CDJiwqIk64DK4E1V6+nqePqEQSWpRagdB04t89/1O/w1cDnyilFU=" ,
  channelSecret: "056b3f3a932f10d7f86011989907f0ac",
};
const request = require('request'),
    cheerioTableparser = require('cheerio-tableparser');
const request1 = require('request-promise');
const cheerio = require('cheerio');
const scrape = require('./lib/scrape.js');
const cari = require('./lib/fiturCari.js')
// create LINE SDK client

const client = new line.Client(config);

//create express serve
const app = express();

//url scrape
const base_url = 'http://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg';

 
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    console.log(JSON.stringify(req.body))
 
});


//replyMessage
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

async function gempaScraping(message, replyToken, source) {
    const gempaScraped = await scrape.gempa();
    return replyText(replyToken, ['info gempa terkini', `telah terjadi gempa di ${gempaScraped[1]} pada ${gempaScraped[0]} dengan kekuatan gempa sebessar ${gempaScraped[2]} Skala Richter pada kedalaman ${gempaScraped[3]}`, 'sumber: bmkg.go.id'])
}

//handel messgaeText
function handleText(message, replyToken, source) {
  const pesan = message.text.toLowerCase()
  switch (pesan) {
     case 'hi':
      if (source.userId) {
        return client.getProfile(source.userId)
          .then((profile) => replyText(
            replyToken,
            [
              `Halo ${profile.displayName}, ada yang bisa dibantu sob??`,
              `gw bisa cariin kamu info mini ensiklopedia dengan ketik apa yang mau dicari, contoh: Raisa Andriana `,
              'gw bisa cariin kamu info gempa dengan ketik: info gempa bumi',
              'kalo mau tau info tentng gw bisa ketik: info bot'
            ]
          ));
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID');    
        };
     case 'info bot':
        return replyText(replyToken, 'gw bot yang bisa ngasih lo info tentang mini ensiklopedia & info gempa',
      'bot created by: Ankaboet Creative'); 

     case 'info gempa bumi':
        return gempaScraping(message, replyToken, source)

     default:
         return cari.fiturCari(message, replyToken, source);
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

