module.exports.fiturCari = async function getSearchmes(message, replyToken, source) {
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
      const responseHasil = await request1(opt);
      console.log(JSON.stringify(responseHasil));
      const terjemahan = responseHasil.sentences[0].trans
      return replyText(replyToken, ['hasil yang kamu cari', `${terjemahan}`]);
    }
    catch(e) {
      console.error(e);
    }
  }
  