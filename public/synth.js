// General Classes and Functions
noteLetters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
intToNote = (val, scale, offsets) => {
    len = scale.length
    note = scale[((val%len)+len)%len]
    return note + (3 + Math.floor((val)/len) + offsets[((val%len)+len)%len])
}

function getMusicalKey(startNote, isMajor) {
    steps = isMajor ? [2,2,1,2,2,2] : [2,1,2,2,1,2]
    index = noteLetters.findIndex((elem) => elem == startNote)
    notes = [startNote]
    offsets = [0]
    steps.forEach(step => {
        index += step
        notes.push(noteLetters[index % noteLetters.length])
        offsets.push(Math.floor(index/noteLetters.length))
    });
    return [notes, offsets]
}

class Instrument {
    isReady = false
    isPlaying = false
    inst = null
    currentNote = null
    constructor(instName, onload) {
        this.inst = SampleLibrary.load({
            instruments: instName,
            ext: ".[wav|mp3|ogg]",
            onload: () => {
                console.log("Loaded")
                this.isReady = true
                this.inst.toDestination()
                this.inst.attack = 1
                this.inst.release = 1
                if (onload) onload()
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
            this.inst.triggerRelease(this.currentNote)
            this.currentNote = note
            if (!this.isPlaying) {
                this.startNote(note)
            } else {
                if (this.inst.setNote) {
                    this.inst.setNote(note)
                } else {
                    this.inst.triggerAttack(note)
                }
            }
        }
    }

    stopNote() {
        if (this.isReady) {
            this.inst.triggerRelease(this.currentNote)
            this.currentNote = null
            this.isPlaying = false
        }
    }
}