var keys = require('./keys.js')
var twitter = require('twitter')
var spotify = require('node-spotify-api')
var request = require('request')
var fs = require('fs')

var keysTwitterArr = []
var i = 0
for (var key in keys.twitterKeys) {
  keysTwitterArr[i] = keys.twitterKeys[key]
  i++
}
var keysSpotifyArr = []
var j = 0
for (var key in keys.spotifyKeys) {
  keysSpotifyArr[j] = keys.spotifyKeys[key]
  j++
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

var command = process.argv[2]
var item = ''

for (var i = 3; i < process.argv.length; i++) {
  if (process.argv[i].trim()) {
    process.argv[i].trim().replace(/"/g, '').replace(/'/g, '')
    item += process.argv[i].trim() + ' '
  }
}

if (process.argv.length == 2) {
  console.log('-------------------------- Hi! My name is LIRI!! Your Bash Best Friend!! ------------------------')
  console.log('I can recognize these commands ')
  console.log('')
  console.log('   * my-tweets ')
  console.log('         - read you tweets posted by me!')
  console.log('')
  console.log('   * spotify-this-song <song name>')
  console.log('         - look for song of your desire in spotify!')
  console.log('')
  console.log('   * movie-this <movie name>')
  console.log('         - look for movie of your desire in OMDB!')
  console.log('')
  console.log('   * do-what-it-says')
  console.log('         - do any of the three commands from a text file! (random.txt)')
  console.log('')
  console.log('--------------------------------------------------------------------------------------------------')
}

function tweetsStuff (command, item) {
  var params = {count: 20}
  twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (!error) {
      var message = ''
      // console.log("tweet here")
      // console.log(JSON.stringify(tweets,null, 2))
      message += '------------------ TWITTER -------------------\r\n';
      console.log('------------------ TWITTER -------------------');
      /*message += JSON.parse(tweets.user.name + "\r\n")
      console.log(JSON.parse(tweets.user.name));*/
      message += 'User name : ' + tweets[0].user.screen_name + '\r\n';
      console.log('User name : ' + tweets[0].user.screen_name);
      for (var i = 0; i < tweets.length; i++) {
        // console.log("Screen name: " + tweets[i].user.name)
        console.log('Tweet at : ' + tweets[i].created_at)
        console.log('Tweet: ' + tweets[i].text)
        message += 'Tweet at : ' + tweets[i].created_at + '\r\n'
        message += 'Tweet : ' + tweets[i].text + '\r\n'
      }
      message += '------------------ END OF TWITTER -------------------\r\n'
      console.log('------------------ END OF TWITTER -----------------')
      fs.appendFile('log.txt', message, (err) => {
        if (err) throw err
        console.log('The file has been saved in log.txt file!')
      })
      // console.log(JSON.parse(tweets.user))
      // console.log(tweets.user.name)
      // console.log(tweets.text)

    }else {
      console.log(error)
    }
  })
}

function spotifyStuff (command, item) {
  if (!item) {
    item = 'The Sign'
  }
  // https://beta.developer.spotify.com/documentation/web-api/reference/object-model/
  // console.log("spotify here!")
  var params = {type: 'track', query: item.trim(), limit: 5 }
  var message = ''
  spotifyClient.search(params, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err)
    }

    // console.log(JSON.stringify(data,null, 2))
    // console.log(JSON.parse(spotify.data.items.name))
    console.log('------------------ SPOTIFY -----------------')
    message += '------------------ SPOTIFY ----------------- \r\n'
    console.log('Results for... ' + item)
    message += 'Results for... ' + item + '\r\n'

    for (var i = 0; i < data.tracks.items.length; i++) {
      var artists = ''
      var number = i + 1
      // console.log("item " + number )
      message += 'Search result ' + parseInt(number) + ' out of ' + data.tracks.total + '\r\n'
      console.log('Search result ' + parseInt(number) + ' out of ' + data.tracks.total)
      console.log('      * Album Name : ' + data.tracks.items[i].album.name)
      message += '      * Album Name : ' + data.tracks.items[i].album.name + '\r\n'
      for (var x = 0; x < data.tracks.items[i].artists.length; x++) {
        console.log('      * Artists Name: ' + data.tracks.items[i].artists[x].name)
        artists += data.tracks.items[i].artists[x].name
        if (x === data.tracks.items[i].artists.length - 1) {}else {artists += ' | '}
      }
      message += '      * Artist Name : ' + artists + '\r\n'
      console.log('      * Duration (ms) : ' + data.tracks.items[i].duration_ms)
      message += '      * Duration (ms) : ' + data.tracks.items[i].duration_ms + '\r\n'
      console.log('      * Explicit : ' + data.tracks.items[i].explicit)
      message += '      * Explicit : ' + data.tracks.items[i].explicit + '\r\n'
      console.log('      * External URL: ' + data.tracks.items[i].external_urls.spotify)
      message += '      * External URL: ' + data.tracks.items[i].external_urls.spotify + '\r\n'
      console.log('      * Song Name : ' + data.tracks.items[i].name)
      message += '      * Song Name : ' + data.tracks.items[i].name + '\r\n'
      console.log('      * Popularity : ' + data.tracks.items[i].popularity)
      message += '      * Popularity : ' + data.tracks.items[i].popularity + '\r\n'
      console.log('      * Track Number : ' + data.tracks.items[i].track_number)
      message += '      * Track Number : ' + data.tracks.items[i].track_number + '\r\n'
    }
    message += '------------------ END OF SPOTIFY ----------------- \r\n'
    console.log('------------------ END OF SPOTIFY -----------------')
    fs.appendFile('log.txt', message, (err) => {
      if (err) throw err
      console.log('The file has been saved in log.txt file!')
    })
  })
}

function movieStuff (command, item) {
  if (!item) {
    item = 'Mr. Nobody'
  }
  var queryUrl = 'http://www.omdbapi.com/?t=' + item + '&y=&plot=short&apikey=trilogy'
  var message = ''

  request(queryUrl, function (error, response, body) {
    // console.log(response.statusCode)

    if (!error) {
      // console.log(JSON.stringify(body,null, 2))
      console.log('--------------------------- OMDB --------------------------')
      message += '--------------------------- OMDB -------------------------- \r\n'
      console.log('Results for... ' + item)
      message += 'Results for... ' + item + '\r\n'
      // console.log("...")
      // console.log("...")
      console.log('* Title of the movie : ' + JSON.parse(body).Title)
      for (var i = 0; i < JSON.parse(body).Ratings.length; i++) {
        if (JSON.parse(body).Ratings[i].Source === 'Internet Movie Database') {
          console.log('* IMDB Rating of the movie : ' + JSON.parse(body).Ratings[i].Value)
          message += '* IMDB Rating of the movie : ' + JSON.parse(body).Ratings[i].Value + '\r\n'
        }else if (JSON.parse(body).Ratings[i].Source === 'Rotten Tomatoes') {
          console.log('* Rotten Tomatoes Rating of the movie : ' + JSON.parse(body).Ratings[i].Value)
          message += '* Rotten Tomatoes Rating of the movie : ' + JSON.parse(body).Ratings[i].Value + '\r\n'
        }
      }
      console.log('* Country where the movie was produced : ' + JSON.parse(body).Country)
      message += '      * Country where the movie was produced : ' + JSON.parse(body).Country + '\r\n'
      console.log('* Language of the movie : ' + JSON.parse(body).Language)
      message += '      * Language of the movie : ' + JSON.parse(body).Language + '\r\n'
      console.log('* Plot of the movie : ' + JSON.parse(body).Plot)
      message += '      * Plot of the movie : ' + JSON.parse(body).Plot + '\r\n'
      console.log('* Actors in the movie : ' + JSON.parse(body).Actors)
      message += '      * Actors in the movie : ' + JSON.parse(body).Actors + '\r\n'
      console.log('Movie Release Year: ' + JSON.parse(body).Year)
      message += '      * Movie Release Year: ' + JSON.parse(body).Year + '\r\n'
    }else {
      console.log(error)
    }
    message += '------------------ END OF OMDB ----------------- \r\n'
    console.log('------------------ END OF OMDB -----------------')
    // console.log(message)

    fs.appendFile('log.txt', message, (err) => {
      if (err) throw err
      console.log('The file has been saved in log.txt file!')
    })
  })
}

if (command) {
  if (command.toLowerCase().trim() === 'my-tweets') {
    tweetsStuff(command, item)
  }
  else if (command.toLowerCase().trim() === 'spotify-this-song') {
    spotifyStuff(command, item)
  }
  else if (command.toLowerCase().trim() === 'movie-this') {
    movieStuff(command, item)
  }
  else if (command.toLowerCase().trim() === 'do-what-it-says') {
    var fs = require('fs')
    // We will read the existing bank file
    fs.readFile('random.txt', 'utf8', function (err, data) {
      if (err) {
        return console.log(err)
      }
      var dataArr = []
      dataArr = data.split(',')
      for (var i = 0; i < dataArr.length; i++) {
        dataArr[i] = dataArr[i].trim().replace(/"/g, '')
      }
      var j = 0
      for (j; j < dataArr.length; j++) {
        console.log('command is ' + dataArr[j])
        if (dataArr[j] === 'my-tweets') {
          tweetsStuff(dataArr[j])
        }else if (dataArr[j] === 'spotify-this-song') {
          // if  the next item is greater than the length of the array, or the next item is one of the commands, skip, otherwise, perform 
          if (j + 1 >= dataArr.length || dataArr[j + 1] === 'spotify-this-song' || dataArr[j + 1] === 'movie-this' || dataArr[j + 1] === 'my-tweets' || dataArr[j + 1] === 'do-what-it-says') {
          }else {
            spotifyStuff(dataArr[j], dataArr[j + 1])
          }
          j++
        }else if (dataArr[j] === 'movie-this') {
          if (j + 1 >= dataArr.length || dataArr[j + 1] === 'spotify-this-song' || dataArr[j + 1] === 'movie-this' || dataArr[j + 1] === 'my-tweets' || dataArr[j + 1] === 'do-what-it-says') {}else {
            movieStuff(dataArr[j], dataArr[j + 1])
          }
          j++
        }
      }
    })
  }
}
