var keys = require("./keys.js");
var twitter = require('twitter');
var spotify = require('node-spotify-api');
var request = require('request');
/*
console.log("twitter keys: ");
console.log(keys.twitterKeys);
console.log("spotify keys: ");
console.log(keys.spotifyKeys);*/

var keysTwitterArr = [];
var i=0;
for (var key in keys.twitterKeys) {
  //console.log( key + "  is " + keys.twitterKeys[key] + ".");
  keysTwitterArr[i] = keys.twitterKeys[key];
  //console.log(keysTwitterArr[i]);
  i++;
}
var keysSpotifyArr = [];
var j=0;
for (var key in keys.spotifyKeys){
	//console.log(key + " is " + keys.spotifyKeys[key] + ".");
	keysSpotifyArr[j] = keys.spotifyKeys[key];
	j++;
}


var twitterClient = new twitter({
	consumer_key: keysTwitterArr[0].trim(),
	consumer_secret: keysTwitterArr[1].trim(),
	access_token_key: keysTwitterArr[2].trim(),
	access_token_secret: keysTwitterArr[3].trim()
})

var spotifyClient = new spotify({
	id: keysSpotifyArr[0].trim(),
	secret: keysSpotifyArr[1].trim()
})

var command = process.argv[2];
var item = process.argv[3];

function tweetsStuff(command, item){
	var params = {count: 20};
	twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (!error) {
			console.log("tweet here");
			for(var i =0; i<tweets.length; i++){
				//console.log("Screen name: " + tweets[i].user.name);
				console.log("Text: " + tweets[i].text);
			}
			//console.log(JSON.parse(tweets.user));
		//console.log(tweets.user.name);
		//console.log(tweets.text);

		}else{
			console.log(error);
		}
	});
}

function spotifyStuff(command, item){
	if(!item){
		item = "The Sign";
	}
	//https://beta.developer.spotify.com/documentation/web-api/reference/object-model/
	console.log("spotify here!");
	var params = {type: 'track', query: item.trim(), limit: 2 };
	spotifyClient.search(params, function(err, data) {
		if (err) {
			return console.log('Error occurred: ' + err);
		}
		//console.log(data.tracks.items);
		console.log("Name : " + item);
		for(var i=0; i<data.tracks.items.length; i++){
			console.log("item " + i );
			//console.log(data.tracks.items[i]);
			console.log("Album Type: " + data.tracks.items[i].album.album_type);
			console.log("Album External URL: " + data.tracks.items[i].album.external_urls.spotify);
			console.log("Album Name: " + data.tracks.items[i].album.name);
			console.log("Popularity: " + data.tracks.items[i].popularity);
			for(var x=0; x<data.tracks.items[i].artists.length; x++){
				console.log("Artists Name: " + data.tracks.items[i].artists[x].name);
			}
		}
		/*console.log(data.album.name);
		console.log(data.album.artists);
		console.log(data.artists);
		console.log(data.popularity);
		console.log(data.preview_url);*/

	});
}

function movieStuff(command, item){
	if(!item){
		item = "Mr. Nobody"
	}
	var queryUrl = "http://www.omdbapi.com/?t=" + item + "&y=&plot=short&apikey=trilogy";

	request(queryUrl, function(error, response, body){
		//console.log(response.statusCode);

		if(!error){
			console.log("* Title of the movie : " + JSON.parse(body).Title);
			for(var i=0; i< JSON.parse(body).Ratings.length; i++){
				if(JSON.parse(body).Ratings[i].Source === "Internet Movie Database"){
					console.log("* IMDB Rating of the movie : " + JSON.parse(body).Ratings[i].Value);
				}else if(JSON.parse(body).Ratings[i].Source === "Rotten Tomatoes"){
					console.log("* Rotten Tomatoes Rating of the movie : " + JSON.parse(body).Ratings[i].Value);
				}
			}
			console.log("* Country where the movie was produced : " + JSON.parse(body).Country);
			console.log("* Language of the movie : " + JSON.parse(body).Language);
			console.log("* Plot of the movie : " + JSON.parse(body).Plot);
			console.log("* Actors in the movie : " + JSON.parse(body).Actors);
			console.log("Movie Release Year: " + JSON.parse(body).Year);
		}else{
			console.log(error);
		}
	})
}

if(command){
	if(command.toLowerCase().trim() === "my-tweets"){
		console.log("my tweets!");
		tweetsStuff(command, item);		
	}

	if(command.toLowerCase().trim() === "spotify-this-song"){
		spotifyStuff(command, item);
	}

	if(command.toLowerCase().trim() === "movie-this"){
		console.log("movie-this!");
		movieStuff(command, item);
	}

	if(command.toLowerCase().trim() === "do-what-it-says"){
		console.log("do-what-it-says!");
		var fs = require("fs");

		 // We will read the existing bank file
		fs.readFile("random.txt", "utf8", function(err, data) {
			if (err) {
			return console.log(err);
			}
			
			var dataArr = [];
			dataArr = data.split(",");
			for (var i = 0; i < dataArr.length; i++) {
				dataArr[i] = dataArr[i].trim().replace(/"/g, "");
				console.log(dataArr[i]);
			}

			var j =0;
			for(j; j < dataArr.length; j++){
				console.log("command is " + dataArr[j]);
				if(dataArr[j] === 'my-tweets'){
					console.log("item number : " + j);
					tweetsStuff(dataArr[j]);
				}else if(dataArr[j] === 'spotify-this-song'){
					console.log("item number : " + j);
					spotifyStuff(dataArr[j], dataArr[j+1]);
					j++;
					console.log("item number : " + j);
				}else if(dataArr[j] === 'movie-this'){
					console.log("item number : " + j);
					movieStuff(dataArr[j], dataArr[j+1]);
					j++;
					console.log("item number : " + j);

				}
			}

			/*if(dataArr[i][0] === 'my-tweets'){
				tweetsStuff(dataArr[i]);
			}else if(dataArr[i] === 'spotify-this-song'){
				spotifyStuff(dataArr[i], dataArr[i+1].replace("\"", ''));
				i++;
			}else if(dataArr[i][0] === 'movie-this'){
				movieStuff(dataArr[i], dataArr[i+1].replace("\"", ''));
				i++;
			}*/

		});

	}	
}
