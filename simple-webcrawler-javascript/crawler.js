var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');

var START_URL = "https://www.casanur.com.br";
var SEARCH_WORD = "PORCELANATO RETIFICADO ACETINADO TOCANTINS FREIJO - 25X103CM - EXTRA - LANZI - M²";
var MAX_PAGES_TO_VISIT = 2000;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Número máximo de páginas visitadas.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    crawl();
  } else {
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  pagesVisited[url] = true;
  numPagesVisited++;

  console.log("Visitando página " + url);
  request(url, function(error, response, body) {

    console.log("Status code: " + response.statusCode);

    if(response.statusCode !== 200) {
      callback();
      return;
    }
    var $ = cheerio.load(body);

    var isWordFound = searchForWord($, SEARCH_WORD);
    if(isWordFound) {
      console.log('Produto ' + SEARCH_WORD + ' encontrado na página ' + url);
    } else {
      collectInternalLinks($);
      callback();
    }

  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
  var relativeLinks = $("a[href^='/']");
  console.log("Found " + relativeLinks.length + " relative links on page");
  relativeLinks.each(function() {
    pagesToVisit.push(baseUrl + $(this).attr('href'));
  });
}