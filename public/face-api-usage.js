function notifyFaceChanged(mouthHeight) {
    const event = new CustomEvent("faceChanged", {
        detail: mouthHeight
    })
    document.body.dispatchEvent(event)
}


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
        

        // compute relevant face metrics
        faceHeight = result.detection.box.height
        // console.log(`faceHeight: ${faceHeight}`)

        mouth = result.landmarks.getMouth()
        // console.log("mouth:", mouth)

        bottomLip = mouth.slice(1, 6)
        topLip = mouth.slice(7, 12)

        mouthHeight = Math.max(...topLip.map(p => p.y)) - Math.min(...bottomLip.map(p => p.y))
        // console.log(`mouthHeight: ${mouthHeight}`)

        mouthHeightNormalized = mouthHeight / faceHeight
        console.log(`mouthHeightNormalized: ${mouthHeightNormalized}`)
        
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

