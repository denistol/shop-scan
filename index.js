
const fs = require('fs');
const axios = require('axios')
const cheerio = require('cheerio')
let pages;
let data = [];
let parsed = 0;
const parsedUrl = 'https://tehnoskarb.ua/veb-kamery/c242?page=';

let parsePage = async ()=>{
    if(pages && parsed >= pages) return;
    let body = await axios.get(parsedUrl+parsed).then(data=>data.data);
    let $ = cheerio.load(body);
    if(!pages){
        pages = parseInt($('span.cur_page').children('span').text().match(/\d/)[0]);
    }
    let results = $('div.products>ul>li').map((i,el)=>{
        return {
            index:  i,
            content:$(el).children('h4').find('a').attr('title'),
            link:   $(el).children('h4').find('a').attr('href'),
            count:parseInt($(el).children('p').text().match(/\d+/)),
        }
    }).toArray().filter(el=>el.content && el.link && el.count);
    parsed++;
    data = [...data,...results];
    await parsePage();
};
let main = async ()=>{
    await parsePage();
    fs.writeFileSync('log.txt',JSON.stringify(data,null,4));
}
main();
