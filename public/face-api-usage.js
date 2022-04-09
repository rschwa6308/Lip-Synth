


async function analyzeFrame() {
    const frame = document.getElementById("videoElement")
    // const frame = document.getElementById("testImg")
    // console.log("input:", frame)

    // const result = await faceapi.detectSingleFace(videoElement, options).withFaceLandmarks()
    const result = await faceapi.detectSingleFace(frame).withFaceLandmarks()
    // console.log("detectSingleFace result:", result)

    if (result) {
        const canvas = document.getElementById("overlay")
        const dims = faceapi.matchDimensions(canvas, frame, true)
        const resizedResult = faceapi.resizeResults(result, dims)

        faceapi.draw.drawDetections(canvas, resizedResult)
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult)
    } else {
        console.warn("face-api.js face detection failed!")
    }

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

