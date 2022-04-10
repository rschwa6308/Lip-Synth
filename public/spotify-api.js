// Replaces a character in a string
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

// Keeps track of the previous state
var last_queried_timestamp = null;
var last_returned_timestamp_index = 0;

// Keeps track of current note
var note_index = -1;

// Variable will store the data returned by the Spotify API.
var song_data = null;

var song_id = null;

// Notes used for their index
const spot_notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const spot_scales = [["C", "D", "E", "F", "G", "A", "B"],
                ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
                ["D", "E", "F#", "G", "A", "B", "C#"], 
                ["D#", "E#", "G", "G#", "A#", "B#", "D"],
                ["E", "F#", "G#", "A", "B", "C#", "D#"], 
                ["F", "G", "A", "A#", "C", "D", "E"],
                ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
                ["G", "A", "B", "C", "D", "E", "F#"],
                ["G#", "A#", "B#", "C#", "D#", "E#", "G"], 
                ["A", "B", "C#", "D", "E", "F#", "G#"], 
                ["#A", "#B", "D", "D#", "E#", "G", "A"], 
                ["B", "C#", "D#", "E", "F#", "G#", "A#"]];

// Will store the unwrapped data from the Spotify API.
var data_timestamps = [];
var data_durations = [];
var data_notes = [];


// Creates a SpotifyApi Object to interact with the Spotify API.
const spotifyApi = new SpotifyWebApi();

// Sets values used to authenticate user
const client_id = '23053cd4642e4b9ba14357dc630df7c1';
const redirect_uri = 'https://www.lipsynth.com';
const state = "1111111111111111";
localStorage.setItem("stateKey", state);
const scope = 'user-read-private user-read-email app-remote-control streaming user-modify-playback-state';

// Url that will authenticate user
var url = 'https://accounts.spotify.com/authorize';
url += '?response_type=token';
url += '&client_id=' + encodeURIComponent(client_id);
url += '&scope=' + encodeURIComponent(scope);
url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
url += '&state=' + encodeURIComponent(state);

console.log(url);

// Sets login button to have the appropriate URL
document.getElementById("spotify").onclick = function () {
    location.href = url;
};

// Retrieves the access token after the OAuth redirect
var queryString = window.location.hash;
queryString = queryString.replaceAt(0, '?');
const urlsearch = new URLSearchParams(queryString);
spotifyApi.setAccessToken(urlsearch.get('access_token'));

console.log(spotifyApi.getAccessToken());

if(spotifyApi.getAccessToken() != null){
    document.getElementById("spotify").innerHTML = "Re-Login";
}

async function GetSongId(song_name){
    var id = null;
    promise = spotifyApi.searchTracks(song_name, {limit: 5}).then(
        function(data){
            id = data.tracks.items[0].id;
            song_id = id;
        },
        function(err){
            console.log('Something went wrong!', err);
        }
    );

    await promise
    promise = new Promise(resolve => getData(id));
    await promise

}

// Collects data from the Spotify API
async function getData(song) {
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
        let max_value = 0;
        let best_ind = 0;
        for(let node_ind = 0; node_ind < 12; node_ind++){
            if(seg.pitches[node_ind] > max_value){
                max_value = seg.pitches[node_ind];
                best_ind = node_ind;
            }
        }

        let cur_note = spot_notes[best_ind];
        if(seg.confidence > 0.8 && spot_scales[song_data.track.key].includes(cur_note)){
            // We keep track of timestamps, notes, and durations
            data_timestamps.push(seg.start);
            data_notes.push(cur_note)
            
           
            data_durations.push(seg.duration);
        }
    }
    return song_id
}

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

function get_filtered_notes(time_diff){
    var filtered_notes = [data_notes[0]];
    var filtered_timestamps = [data_timestamps[0]];

    for(let i = 0; i < data_timestamps.length; i++){
        if(data_timestamps[i] - time_diff > filtered_timestamps[filtered_timestamps.length-1]){
            filtered_notes.push(data_notes[i]);
            filtered_timestamps.push(data_timestamps[i]);
        }
    }
    return [filtered_notes, filtered_timestamps];
}

async function update_note(){
    var bruh = get_filtered_notes(0.5);
    var new_notes = bruh[0];
    var new_timestamps = bruh[1];

    for(let i = 0; i < new_timestamps.length-1; i++){
        var cur_duration = (new_timestamps[i+1] - new_timestamps[i]) ;
        document.getElementById("cur_note").innerHTML = new_notes[i];
        noteToIndicate = new_notes[i];
        document.getElementById("next_note").innerHTML = new_notes[i+1];
        nextNoteToIndicate = new_notes[i+1];
        while(cur_duration > 0){
            p = new Promise(resolve => setTimeout(resolve, 10));
            await p;
            cur_duration -= .01;
            cur_duration = Math.round(cur_duration * 100) / 100;
            document.getElementById("duration").innerHTML = cur_duration;
        }
    }
}

async function get_key(){
    if(song_data != null){
        return song_data.track.key;
    }
    return null;
}

document.getElementById("playSong").onclick = async function () {
    const song_name = document.getElementById("songName").value;
    GetSongId(song_name);
    p = new Promise(resolve => setTimeout(resolve, 1000));
    await p

    if(song_data == null){
        alert("Please enter a song name or try re-logging in.");
        return;
    }

    document.getElementById("scaleRoot").selectedIndex = song_data.track.key;
    document.getElementById("scaleRoot").onchange();

    // spotifyApi.queue("spotify:track:" + song_id );
    // var right_song = false;
    // while(!right_song){
    //     promise = spotifyApi.skipToNext();

    //     await promise;

    //     promise = spotifyApi.getMyCurrentPlayingTrack().then(
    //         function(data) {
    //             if(data.item.id == song_id){
    //                 right_song = true;
    //             }
    //         }
    //     );
    //     await promise;
    // }
    
    // spotifyApi.play();
    update_note();
}