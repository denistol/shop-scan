const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')
const sendMessage = require('./sendMessage')
const conf = require('./config')

let scanTehnoskarb = new Promise( (resolve,reject)=>{
    const parsedUrl = 'https://tehnoskarb.ua/igrovye-pristavki/c72?page=';
    axios.get(parsedUrl+1)
    .then(res=>{
        let $ = cheerio.load(res.data)
        try{
            return parseInt($('span.cur_page>span').text().match(/\d/)[0])
        }catch{
            return 1;
        }
    })
    .then(pages=>{
        let promises = []
        for(var i=0;i<pages;i++){
            promises.push(axios.get(parsedUrl+i))
        }
        Promise.all(promises).then(pages=>{
            return pages.map(page=>{
                let $ = cheerio.load(page.data);
                return $('div.products>ul>li').map( (i,el)=>{
                    let title = $(el).children('h4').children('a').attr('title');
                    let link = $(el).children('h4').children('a').attr('href');
                    let count = $(el).children('p').text().toString();
                    if(title && link && count){
                        return {title,link,count:parseInt(count.match(/\d/)[0])}
                    }
                    
                }).toArray()
            })
        })
        .then(items=>resolve( {tehnoskarb:[].concat(...items)} ))
    })
});

let scanTehnostock = new Promise( (resolve,reject)=>{
    axios.get('https://technostock.com.ua/catalog/noutbuki-kompjutery-planshety/igrovye-konsoli?mode=list')
    .then(data=>{
        let $ = cheerio.load(data.data);
        let links = $('ul.products-list>li>div.item-inner>div.product-image-wrapper>a').toArray();
        let result = links.map(el=>{
            return{
                link:$(el).attr('href'),
                title:$(el).attr('title')
            }
        })
        resolve({tehnostock:result})
    })
});
let compare = (inc)=>{
    console.log(inc)
}
Promise.all([scanTehnostock,scanTehnoskarb])
.then(res=>{
    let incomingData = JSON.stringify(res,null,4);
    console.log(incomingData)
})

