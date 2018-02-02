module.exports.gempa = async function gempaScrape() {
    let gempaScraping = await axios.get(base_url).then((response)=>{
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
      const kekuatanGempa = gempa[1].kekuatan.skala
      const kedalamaan = gempa[1].kekuatan.kedalaman
      const tempatGempaa = tempatGempa.substr(0, 50);
      const dataAKhir = [waktuGempa, tempatGempaa, kekuatanGempa, kedalamaan]
      return(dataAKhir);
    })
    return gempaScraping;
  }