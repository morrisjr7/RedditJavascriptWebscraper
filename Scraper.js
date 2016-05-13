var fs = require('fs');
var http = require('http');
var _ = require('lodash')
var path = require('path');
var request = require('request');
var string = require('lodash/string')
var cheerio = require('cheerio');
var mod_dns = require('dns');
var pg = require('pg');

var subreddit = "worldnews"
var redditStructure = {}
var topSubredditList = [];
redditStructure["topSubredditList"] = topSubredditList;
var submissionsList  = [];
var mod_vasync = require('vasync');
var mod_util = require('util');
var async = require('async');


	function requestPages (subreddit,callback){
			request("http://www.reddit.com"+subreddit+"/top/?sort=top&t=all", function (error, response, body) {
				if (!error && response.statusCode == 200){
					$ = cheerio.load(body);
					$('a.title.may-blank').each(function(i,element){
					submissionsList.push($(this).attr('href'))
					})
					callback(null,subreddit);
				}
				else{
					if (response.statusCode == 500) {
						console.log("Server Down")

					}
					console.log(error);
					callback(error);
				}
				
			})

	};
	function requestCommentsPages (subreddit,callback){
		request($(this).attr('href'),function (error,response,body){
			console.log(body)
			callback(null,response)
		})
	}

	function loadSubredditArray(callback){
		console.log("Loading Subreddits");
		request('http://redditmetrics.com/top', function (error, response, body) {
  			if (!error && response.statusCode == 200) {
    		
    		$ = cheerio.load(body);

    		$('td.tod').children('a').each(function (i,element){
    		redditStructure.topSubredditList.push($(this).attr('href'));
    		});
    		console.log("Top Subreddits Loaded");
    		console.log("Top Subreddit List Length: "+redditStructure.topSubredditList.length)
    		callback(null,redditStructure.topSubredditList.length)
  			}else if(response.statusCode == 500){
  				console.log("Website Down: "+response.statusCode);
  				callback(response.statusCode);
  			}
  			else{

  				callback(response);
  			}
		})
	}	
	function loadTopPages (callback){
		console.log("Start Load Top Pages");
        mod_vasync.forEachPipeline({
    	'func': requestPages,
    	'inputs': redditStructure.topSubredditList
			}, function (err, results) {
			console.log("Load Top Pages Completed")
    		console.log('error: %s', err);
    		console.log('results: %s', mod_util.inspect(results, null, 3));
    		callback(null,results);
	    	})
	 };
	 function loadCommentsPages(callback){
	 	console.log( mod_vasync.forEachPipeline({
    	'func': requestCommentsPages,
    	'inputs': submissionsList
			}, function (err, results) {
    		console.log('error: %s', err);
    		console.log('results: %s', mod_util.inspect(results, null, 3));
	    	}))
	 };
 	 
		

	async.series([
		loadSubredditArray,
		loadTopPages
		]);
	



	
