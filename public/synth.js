// setInterval(() => {
//     const now = Tone.now()
//     synth.triggerAttack("C4", now)
//     synth.triggerRelease(now + 1)
// }, 5000)

var inst
document.addEventListener("DOMContentLoaded", function(){
    inst = new Instrument('violin', () => {inst.startNote("C3")})
    document.getElementById('noteIn').onchange = function() {
        console.log("Note Changed")
        noteInt = document.getElementById("noteIn").value
        inst.playNote(intToNote(noteInt), 1)
    }
});

letters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'B#']
intToNote = (val) => letters[((val%12)+12)%12] + (3 + Math.floor(val/12))

// synth.setNote("F#6", "+4n");

// function playNote(note, time) {
//     console.log("Play Note " + note)
//     instName = document.getElementById("instIn").value
//     inst = SampleLibrary.load({
//         instruments: instName,
//         ext: ".[wav|mp3|ogg]",
//         onload: () => {
//             // Play instrument
//             // NOTE: Later instruments should be loaded once then replayed later
//             console.log("Playing Now")
//             console.log(inst)
//             inst.toDestination();
//             inst.triggerAttack(note);
//             inst.triggerAttackRelease(note, "500ms")
//             }
//         });
// }

class Instrument {
    isReady = false
    isPlaying = false
    inst = null
    constructor(instName, onload) {
        this.inst = SampleLibrary.load({
            instruments: instName,
            ext: ".[wav|mp3|ogg]",
            onload: () => {
                this.isReady = true
                this.inst.toDestination()
                this.inst.attack = 0
                this.inst.release = 0
                onload()
        }})
    }

    startNote(note) {
        if (this.isReady) {
            this.inst.triggerAttack(note)
            this.isPlaying = true
        }
    }

    playNote(note) {
        if (this.isReady) {
            if (!this.isPlaying) {
                this.startNote(note)
            } else {
                console.log(inst)
                this.inst.triggerAttack(note)
            }
        }
    }

    stopNote() {
        if (this.isReady) {
            this.inst.triggerRelease()
            this.isPlaying = false
        }
    }
}