// Necessary Variables
lastHeights = [0, 0]
noteToIndicate = null

function notifyFaceChanged(mouthHeight) {
    const event = new CustomEvent("faceChanged", {
        detail: {value: mouthHeight, change: mouthHeight - lastHeights[0]}
    })
    document.body.dispatchEvent(event)
    lastHeights.shift()
    lastHeights.push(mouthHeight)
}

function drawNote(canvas, note, face, faceUnnorm) {
    ctx = canvas.getContext("2d")

    pts = face.landmarks.getMouth()
    
    // ctx.beginPath()
    // ctx.moveTo(pts[3].x, pts[3].y)
    // ctx.lineTo(pts[9].x, pts[9].y)
    // ctx.strokeStyle = 'green'
    // ctx.lineWidth=3
    // ctx.closePath()
    // ctx.stroke()

    midPt = {x: pts[18].x - (pts[18].x - pts[14].x)/2, y: pts[18].y - (pts[18].y - pts[14].y)/2}
    angle = Math.atan((pts[9].y - pts[3].y)/(pts[9].x - pts[3].x))
    mouthWidth = Math.sqrt((pts[16].y - pts[0].y)**2 + (pts[16].x - pts[0].x)**2)/2
    mouthHeight = Math.sqrt((pts[18].y - pts[14].y)**2 + (pts[18].x - pts[14].x)**2)/2
    if (note && noteToNorm(note, currentScale)) {
        faceHeight = face.detection.box.height
        noteHeight = noteToNorm(note, currentScale) * MAX_MOUTH_HEIGHT * faceHeight

        ctx.beginPath()
        ctx.ellipse(midPt.x, midPt.y, noteHeight/2, mouthWidth, angle, 0, 2*Math.PI)
        ctx.strokeStyle = 'green'
        ctx.lineWidth=3
        ctx.closePath()
        ctx.stroke()
    }
}

const MAX_MOUTH_HEIGHT = 0.20       // 20% of face height seems to be maximum

async function analyzeFrame() {
    const frame = document.getElementById("videoElement")
    // console.log("input frame:", frame)

    const result = await faceapi.detectSingleFace(frame).withFaceLandmarks()
    // console.log("detectSingleFace result:", result)

    if (result) {
        const canvas = document.getElementById("overlay")
        const dims = faceapi.matchDimensions(canvas, frame, true)
        const resizedResult = faceapi.resizeResults(result, dims)

        // mirror canvas
        var context = canvas.getContext('2d');
        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        // draw detections onto canvas
        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult)
        drawNote(canvas, noteToIndicate, resizedResult)
        

        // compute relevant face metrics
        faceHeight = result.detection.box.height
        // console.log(`faceHeight: ${faceHeight}`)

        mouth = result.landmarks.getMouth()
        // console.log("mouth:", mouth)

        bottomLipBottom = mouth.slice(1, 6)
        bottomLipTop = mouth.slice(14, 17)
        topLipTop = mouth.slice(7, 12)
        topLipBottom = mouth.slice(17, 20)

        mouthHeight = Math.max(...topLipBottom.map(p => p.y)) - Math.min(...bottomLipTop.map(p => p.y))
        mouthHeight = Math.abs(mouthHeight)
        // console.log(`mouthHeight: ${mouthHeight}`)

        mouthHeightNormalized = (mouthHeight / faceHeight) / MAX_MOUTH_HEIGHT
        mouthHeightNormalized = Math.min(mouthHeightNormalized, 1.0)    // clamp to [0, 1]
        // console.log(`mouthHeightNormalized: ${mouthHeightNormalized}`)
        
        notifyFaceChanged(mouthHeightNormalized)

        // additional methods of `results.landmarks`:
        // getJawOutline()
        // getLeftEyeBrow()
        // getRightEyeBrow()
        // getNose()
        // getLeftEye()
        // getRightEye()
        // getMouth()
    } else {
        console.warn("face-api.js face detection failed!")
    }

    // you spin me round right round ...
    setTimeout(() => analyzeFrame())
}



async function load_and_run() {
    // attach stream to webcam object
    // TODO: this seems redundant with webcam.js ??? (but it doesn't work without it)
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    const videoElement = document.getElementById("videoElement")
    videoElement.srcObject = stream
    videoElement.msHorizontalMirror = true;

    // load models
    await faceapi.loadFaceLandmarkModel('/models')
    await faceapi.loadFaceRecognitionModel('/models')
    await faceapi.loadSsdMobilenetv1Model('/models')
    console.log("faceapi models successfully loaded: ", faceapi.nets)
    
    analyzeFrame()
}



// Delay until DOM has been loaded
document.addEventListener("DOMContentLoaded", function(){
    load_and_run()
});

