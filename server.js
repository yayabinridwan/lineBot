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
const request1 = require('request'),
    cheerioTableparser = require('cheerio-tableparser');
const request = require('request-promise')
let cheerio = require('cheerio');
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

async function gempaScrape() {
  let gempapa = await axios.get(base_url)
  return gempapa;
}

async function getScrapeSchedule(message, replyToken, source) {
    const gempaScraped = await gempaScrape().then((response)=>{
      let $ = cheerio.load(response.data);
      let gempa = [];
      $('tr', '.table').each( (i, elm) => {
        gempa.push( {
          No: $(elm).children().first().text(),
          waktuGempa: {
            waktu: $(elm).children().eq(1).first().text(),
            lintangBujur: $(elm).children().eq(2).first().text()
          },
          kekuatan: {
            skala: $(elm).children().eq(3).first().text(),
            kedalaman: $(elm).children().eq(4).first().text()
          },
          tempat: {
            gempaDirasaakan: $(elm).children().eq(5).first().text(),
          }
        });
      });
      const waktuGempa = gempa[1].waktuGempa.waktu
      const tempatGempa = gempa[1].tempat.gempaDirasaakan
      const tempatGempaa = tempatGempa.substr(0, 50);
      const dataAKhir = [waktuGempa, tempatGempaa]
      return(dataAKhir);
    });
    const sec = 1000;
    const min = 60;
    const time = sec*min*60; 
    return replyText(replyToken, ['info gempa terkini', `telah terjadi gempa di ${gempaScraped[0]} pada ${gempaScraped[1]} `])
}




//handle search
async function getSearchmes(message, replyToken, source) {
  try {
    const query = message.text;
    const search = await  axios(`http://api.duckduckgo.com/?q=${query}&format=json&pretty=1`)
    const hasilSearch = search.data.Abstract;
    const hasilImg = search.data.Image;
    const url = "https://translate.google.com/translate_a/single"
    + "?client=at&dt=t&dt=ld&dt=qca&dt=rm&dt=bd&dj=1&hl=es-ES&ie=UTF-8"
    + "&oe=UTF-8&inputm=2&otf=2&iid=1dd3b944-fa62-4b55-b330-74909a99969e";
    const data = {
      'sl': 'en',
      'tl': 'id',
      'q': hasilSearch,
    };
    const opt = {
      method: 'POST',
      uri: url,
      encoding: 'UTF-8',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'User-Agent': 'AndroidTranslate/5.3.0.RC02.130475354-53000263 5.1 phone TRANSLATE_OPM5_TEST_1',
      },
      form: data,
      json: true,
    };
    const responseHasil = await request(opt);
    console.log(JSON.stringify(responseHasil));
    return replyText(replyToken, ['hasil yang kamu cari']);
  }
  catch(e) {
    console.error(e);
  }
}

//handel messgaeText
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
        };
     case 'gempa bumi':
        return getScrapeSchedule(message, replyToken, source)

     default:
         return getSearchmes(message, replyToken, source);
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

