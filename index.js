
const cheerio = require('cheerio')
const axios = require('axios')
const fs = require('fs');
const parsedUrl = 'https://github.com/denistol'
async function main(){
    let body = await axios.get(parsedUrl).then(data=>data.data);
    let $ = cheerio.load(body);
    $('a').map((i,el)=>{
        console.log(i,el.attribs['href'])
    });
}
main();