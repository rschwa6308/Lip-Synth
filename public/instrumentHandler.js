// Global Variables
instruments = [] // Keeps track of currently loaded instruments
currentScale = null;
currentScaleOffset = null;
inst = null

document.addEventListener("DOMContentLoaded", function(){
    reloadInst()
    reloadKey()
    // Note Change Action
    document.getElementById('noteIn').onchange = function() {
        noteInt = document.getElementById("noteIn").value
        console.log("Note Changed to "+intToNote(noteInt, currentScale, currentScaleOffset))
        inst.playNote(intToNote(noteInt, currentScale, currentScaleOffset), 1)
    }
    // Stop Note Action
    document.getElementById('stopNote').onclick = function() {
        console.log("Stopping Note")
        inst.stopNote()
    }
    // Change Scale Action
    document.getElementById('scaleRoot').onclick = reloadKey
    document.getElementById('scaleType').onclick = reloadKey
    // Change Instrument
    document.getElementById('instrument').onclick = reloadInst
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

