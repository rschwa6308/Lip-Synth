const song = '3Qm86XLflmIXVm1wcwkgDK';
var song_data = null;

var data_timestamps = [];
var data_durations = [];
var data_notes = [];

var spotifyApi = new SpotifyWebApi();

var client_id = 'CLIENT_ID';
var redirect_uri = 'http://localhost:8888/callback';

var state = generateRandomString(16);

localStorage.setItem(stateKey, state);
var scope = 'user-read-private user-read-email';

var url = 'https://accounts.spotify.com/authorize';
url += '?response_type=token';
url += '&client_id=' + encodeURIComponent(client_id);
url += '&scope=' + encodeURIComponent(scope);
url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
url += '&state=' + encodeURIComponent(state);

let button = document.createElement("button");
butt

// Retrieve an access token.
async function getAccessToken() {
    promise = spotifyApi.clientCredentialsGrant().then(
        function(data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
            console.log('Something went wrong when retrieving an access token', err);
        }
    );

    await promise;

    promise = spotifyApi.getAudioAnalysisForTrack(song).then(
    function(data) {
        song_data =  data;
    },
    function(err){
        console.log('Something went wrong!', err);
    }
    );

    await promise;

    for(let i = 0; i < song_data.body.segments.length; i++){
        let seg = song_data.body.segments[i];
        if(seg.confidence > 0.6){
            data_timestamps.push(seg.start);
            data_notes.push(seg.pitches);
            data_durations.push(seg.duration);
        }
    }

    console.log(data_timestamps);
}


getAccessToken();