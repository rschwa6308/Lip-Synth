// Global Variables
instruments = [] // Keeps track of currently loaded instruments
currentScale = null; reloadKey()
inst = null

document.addEventListener("DOMContentLoaded", function(){
    reloadInst()
    // Note Change Action
    document.getElementById('noteIn').onchange = function() {
        noteInt = document.getElementById("noteIn").value
        console.log("Note Changed to "+intToNote(noteInt, currentScale))
        inst.playNote(intToNote(noteInt, currentScale), 1)
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
    currentScale = getMusicalKey(root, Boolean(type))
}

function reloadInst() {
    instName = document.getElementById('instrument').value
    inst = new Instrument(instName)
}

