var fs = require('fs');
var _ = require('lodash')
var path = require('path');
var request = require('request');
var string = require('lodash/string')
var escapeRegExp = require('lodash/string/escapeRegExp')
var cheerio = require('cheerio');
var squel = require('squel');
var pg = require('pg');
var constring = "postgres://postgres:scanner1@localhost/redditscrape";
var options = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
}
var subreddit = "worldnews"
console.log("Requesting!");



	function insertrow(query) {

		client.query(query.escape, function(err, result) {
			if (err) {
				return console.error('error running query', err);
			}
			console.log(query);
			done();
		});
	};


	request('http://www.reddit.com/r/' + subreddit, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html)
			$('.thing').each(function(i, element) {
				var rank = $(this).children('span.rank')
				var title = $(this).children('div.entry.unvoted').children('p.title').children('a.title.may-blank').text();
				var upVotes = $(this).children('div.midcol.unvoted').children('div.score.likes').text();
				var downVotes = $(this).children('div.midcol.unvoted').children('div.score.dislikes').text();
				var linktoContent = encodeURI($(this).children('div.entry.unvoted').children('p.title').children('a.title.may-blank').attr('href'));
				var domainLink = encodeURI($(this).children('div.entry.unvoted').children('p.title').children('span.domain'));
				var commentLink = encodeURI($(this).children('div.entry.unvoted').children('ul.flat-list.buttons').children('li.first').children('a.comments.may-blank').attr('href'));

				var query =
											squel.insert()
											.into('link')
											.set('title', title , {
												dontQuote:true
											})
											.set('linktoContent',linktoContent)
											.set('upVotes',upVotes)
											.set('downVotes',downVotes)
											.set('domainLink',domainLink)
											.set('commentLink',commentLink)
											.toParam()	

				console.log(query);
			});

		}

	});
