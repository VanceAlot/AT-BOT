// NOT WORKING AS EXPECTED AND NOT READY FOR DEPLOYMENT
// BUT ON TECHNICAL LEVEL, EVERYHTING WORKS NOW

const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same    
const readFile = util.promisify(fs.readFile);

const manitParser = () => {
    var options = {
        'method': 'GET',
        'url': 'http://www.manit.ac.in/',
    };

    var list = {
        innerText: [],
        links: []
    };

    return new Promise(
        (resolve, reject) => {
            request(options, function (err, res) {
                if (err) throw new Error(err);
                if (err) reject(error);
                const $ = cheerio.load(res.body);
                $('div[class="modal-body quick"]').find('div > p > a').each(function (index, element) {
                    list.innerText.push($(element).text());
                    list.links.push($(element).attr('href'));
                });
                resolve(list);
            });
        }
    )
}

// this function is meant to be exported and called every 5 minutes by main.js
// meant to return link if there is something new
// otherwise null
// all this is supposed to be returned in promises
async function checkAndReturn(pathOfDump) {
    // flow of function
    // fetch updates
    // check for each link if it exists in the last recent JSON dump
    // is no ->
    // send for the new ones
    // dump the new JSOn in last recent JSON file
    // is yes -> 
    // don't do anything
    // return null;
    return new Promise(
        async (resolve, reject) => {
            var list = await manitParser();
            var out = {
                innerText: [],
                links: []
            };
            var empty_out = out;
            await readFile(pathOfDump, "utf8").then((data) => {
                fileContent = JSON.parse(data);
                for (let i = 0; i < Math.min(list.links.length, fileContent.links.length); i++) {
                    if (list.links[i] != fileContent.links[i]) {
                        out.innerText.push(list.innerText[i]);
                        out.links.push(list.links[i]);
                    }
                }
            })
            console.log('I am empty out:', out);
            // console.log(out);
            // now if out is not empty then reply that, otherwise nothing
            if (empty_out != out) {
                await fs.promises.writeFile(pathOfDump, JSON.stringify(list));
                resolve(out);
            } else {
                resolve(0);
            }
        }
    )
}
module.exports = {
    checkAndReturn
}
