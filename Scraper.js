var fs = require('fs');
var http = require('http');
var _ = require('lodash')
var path = require('path');
var request = require('request');
var string = require('lodash/string')
var escapeRegExp = require('lodash/string/escapeRegExp')
var cheerio = require('cheerio');
var squel = require('squel');
var pg = require('pg');
var constring = "postgres://nodejs:nodejs@localhost/webscraper";
var options = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
}
var subreddit = "worldnews"
squelPostgres = squel.useFlavour('postgres');
console.log("Requesting!");



    function sendtoDatabase(querytoSend){
	pg.connect(constring, function (err,client,done) {
		if(err) {
	    	return console.error('Error connecting to database',err);
		};
		client.query(querytoSend, function(err, result) {
			if (err) {
				console.log(querytoSend)
				return console.error('error running query', err);
			}
			done();
		});
	})
	};


	request('http://www.reddit.com/r/' + subreddit, function(error, response, html) {
		if (!error && response.statusCode == 200) {

			var $ = cheerio.load(html)
			$('.thing').each(function(i, element) {
				var rank = $(this).children('span.rank')
				var title = $(this).children('div.entry.unvoted').children('p.title').children('a.title.may-blank').text();
					cleantitle=title.replace("'","@@").replace("'","@@").replace("'","@@");
				var upVotes = $(this).children('div.midcol.unvoted').children('div.score.likes').text();
					cleanupvotes = upVotes.replace("•","not_available")
				var downVotes = $(this).children('div.midcol.unvoted').children('div.score.dislikes').text();
					cleandownvotes = downVotes.replace("•","not_available")
				var linktoContent = encodeURI($(this).children('div.entry.unvoted').children('p.title').children('a.title.may-blank').attr('href'));
				var domainLink = encodeURI($(this).children('div.entry.unvoted').children('p.title').children('span.domain'));
				var commentLink = encodeURI($(this).children('div.entry.unvoted').children('ul.flat-list.buttons').children('li.first').children('a.comments.may-blank').attr('href'));

				var query =             squelPostgres.insert()
											.into(subreddit)
											.set('title', cleantitle,{singleQuoteReplacement:"@@"},{replaceSingleQuotes:true},{
												dontQuote:true})
											.set('upVotes',cleanupvotes)
											.set('downVotes',cleandownvotes)
											.set('domainLink',domainLink)
											.set('commentLink',commentLink)
											.toString();	


				sendtoDatabase(query);
			});

		}

	});


