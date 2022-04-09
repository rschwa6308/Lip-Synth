// Replaces a character in a string
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

// Keeps track of the previous state
var last_queried_timestamp = null;
var last_returned_timestamp_index = 0;

// Song to be analyzed
const song = '3Qm86XLflmIXVm1wcwkgDK';

// Variable will store the data returned by the Spotify API.
var song_data = null;

// Notes used for their index
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Will store the unwrapped data from the Spotify API.
var data_timestamps = [];
var data_durations = [];
var data_notes = [];


// Creates a SpotifyApi Object to interact with the Spotify API.
const spotifyApi = new SpotifyWebApi();

// Sets values used to authenticate user
const client_id = '23053cd4642e4b9ba14357dc630df7c1';
const redirect_uri = 'http://localhost:3000';
const state = "1111111111111111";
localStorage.setItem("stateKey", state);
const scope = 'user-read-private user-read-email';

// Url that will authenticate user
var url = 'https://accounts.spotify.com/authorize';
url += '?response_type=token';
url += '&client_id=' + encodeURIComponent(client_id);
url += '&scope=' + encodeURIComponent(scope);
url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
url += '&state=' + encodeURIComponent(state);

// Sets login button to have the appropriate URL
document.getElementById("spotify").onclick = function () {
    location.href = url;
};

// Retrieves the access token after the OAuth redirect
var queryString = window.location.hash;
queryString = queryString.replaceAt(0, '?');
const urlsearch = new URLSearchParams(queryString);
spotifyApi.setAccessToken(urlsearch.get('access_token'));

// Collects data from the Spotify API
async function getData() {
    // Sends official request and stores data
    promise = spotifyApi.getAudioAnalysisForTrack(song).then(
    function(data) {
        song_data =  data;
    },
    function(err){
        console.log('Something went wrong!', err);
    }
    );

    // Waits for the request to finish
    await promise;

    // Unwraps the data
    for(let i = 0; i < song_data.segments.length; i++){
        let seg = song_data.segments[i];
        // We  only keep segments with high confidence
        if(seg.confidence > 0.6){
            // We keep track of timestamps, notes, and durations
            data_timestamps.push(seg.start);
            
            let max_value = 0;
            let best_ind = 0;
            for(let node_ind = 0; node_ind < 12; node_ind++){
                if(seg.pitches[node_ind] > max_value){
                    max_value = seg.pitches[node_ind];
                    best_ind = node_ind;
                }
            }
            console.log(seg.pitches);
            console.log("");

            data_notes.push(notes[best_ind]);
            data_durations.push(seg.duration);
        }
    }

    console.log(data_notes);
}

getData();

// Will return the next note and duration to be played given a timestamp
async function get_note(value){
    if(value < last_queried_timestamp){
        last_returned_timestamp_index = 0;   
    }

    last_queried_timestamp = value;

    for(let i = last_returned_timestamp_index; i < data_timestamps.length; i++){
        if(data_timestamps[i] > value){
            last_returned_timestamp_index = i;
            return [data_notes[i], data_durations[i] - (value - data_timestamps[i])];
        }
    }
}

// Returns all notes and durations for the given song
async function get_all_notes(){
    return [data_notes, data_durations];
}