// Delay collection of video element until after its been loaded
document.addEventListener("DOMContentLoaded", function(){
    videoElem = document.getElementById("videoElement");
    // console.log(videoElem)
    getMediaDevice(videoElem)
});

function getMediaDevice (applyTo) {
    // If media device is available
    if (navigator.mediaDevices.getUserMedia) {
        // Get media feed
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                // Apply video to video element
                applyTo.srcObject = stream;
            })
            .catch(function (err) {
                // Report an error if something went wrong
                console.log("Something went wrong!\n" + err)
            })
    }
}

function flipWebcam() {
    document.getElementById("videoElement").style.transform = "scaleX(-1)";
}