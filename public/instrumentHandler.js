// Global Variables
instruments = [] // Keeps track of currently loaded instruments
currentScale = null;
currentScaleOffset = null;
inst = null
audioPause = false

document.addEventListener("DOMContentLoaded", function(){
    reloadInst()
    reloadKey()
    // Note Change Action
    // document.getElementById('noteIn').onchange = function() {
    //     noteInt = document.getElementById("noteIn").value
    //     console.log("Note Changed to "+intToNote(noteInt, currentScale, currentScaleOffset))
    //     inst.playNote(intToNote(noteInt, currentScale, currentScaleOffset))
    // }
    // Stop Note Action
    // document.getElementById('stopNote').onclick = function() {
    //     console.log("Stopping Note")
    //     inst.stopNote()
    // }
    // Change Scale Action
    document.getElementById('scaleRoot').onchange = reloadKey
    document.getElementById('scaleType').onchange = reloadKey
    // Change Instrument
    document.getElementById('instrument').onchange = reloadInst
    document.body.addEventListener("faceChanged", (obj) => {
        if (!audioPause) {
            val = obj.detail
            // console.log(val)
            note = intToNote(Math.floor(8*val), currentScale, currentScaleOffset)
            if (val != null && val < 0.1) {
                inst.stopNote()
            } else {
                if (note != inst.currentNote) inst.playNote(note)
            }
        }
    })
    
    document.getElementById('pauseSelect').onchange = function() {
        audioPause = document.getElementById('pauseSelect').value != "play"
    }
});

function reloadKey() {
    root = document.getElementById('scaleRoot').value
    type = document.getElementById('scaleType').value == "major"
    result = getMusicalKey(root, type)
    currentScale = result[0]
    currentScaleOffset = result[1]
}

function reloadInst() {
    instName = document.getElementById('instrument').value
    inst = new Instrument(instName)
}

