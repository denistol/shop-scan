const fs = require('fs');
const axios = require('axios')
const cheerio = require('cheerio')
const isEqual = require('lodash').isEqual

let scan = new Promise( (resolve,reject)=>{
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
        .then(items=>resolve(items))
    })
});

setInterval( ()=>{
    scan.then(results=>{
        let responseResult = [].concat(...results)
        if(!fs.existsSync('log.json')){
            fs.writeFileSync('log.json',JSON.stringify(responseResult,null,4)) ;
        }
        let fileResult = JSON.parse(fs.readFileSync('log.json'));
        if(!isEqual( fileResult,responseResult )){
            console.log("[ + ] CHANGES")
        }
        else{
            console.log("[ + ] IS EQUAL")
        }
        fs.writeFileSync('log.json',JSON.stringify(responseResult,null,4)) ;
    })
   
},500);

