import { gestures } from "./gestures.js"

const config = {
    video: { width: window.innerWidth, height: window.innerHeight *0.75, fps: 30 }
}

async function createDetector() {
    return window.handPoseDetection.createDetector(
    window.handPoseDetection.SupportedModels.MediaPipeHands,
    {
        runtime: "mediapipe",
        modelType: "full",
        maxHands: 1,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,
    }
    )
}

async function main() {

    const video = document.querySelector("#pose-video")

    // configure gesture estimator
    // add "✌🏻" and "👍" as sample gestures
    const knownGestures = [
    ...gestures
    ]
    const GE = new fp.GestureEstimator(knownGestures)
    // load handpose model
    const detector = await createDetector()
    console.log("mediaPose model loaded")

    // main estimation loop
    const estimateHands = async () => {

    // get hand landmarks from video
    const hands = await detector.estimateHands(video, {
        flipHorizontal: true
    })
    var pos = null;
    for (const hand of hands) {
        for (const keypoint of hand.keypoints) {
        const name = keypoint.name.split('_')[0].toString().toLowerCase()

        if(name == 'wrist')
            pos = Matter.Vector.create(keypoint.x, keypoint.y);
        }
        const keypoints3D = hand.keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z])
        
        const est = GE.estimate(keypoints3D, 9)

        if (est.gestures.length > 0) {

        // find gesture with highest match score
        let result = est.gestures.reduce((p, c) => {
            return (p.score > c.score) ? p : c
        })
        const chosenHand = hand.handedness.toLowerCase()
        var action;
        

        switch(result.name){
            case 'grab':{
            action = 0;
            break;
            }
            case 'open':{
            action = 1;
            break;
            }
            case 'close':{
            action = 2;
            break;
            }
            case 'upIndex':{
            action = 3;
            break;
            }
            default:{
            action = -1;
            }
        }

        triggerAction(action, pos);
        }

    }
    // ...and so on
    setTimeout(() => { estimateHands() }, 1000 / config.video.fps)
    }

    estimateHands()
    console.log("Starting predictions")
}

async function initCamera(width, height, fps) {

    const constraints = {
    audio: false,
    video: {
        facingMode: "user",
        width: width,
        height: height,
        frameRate: { max: fps }
    }
    }

    const video = document.querySelector("#pose-video")
    video.width = width
    video.height = height

    // get video stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream

    return new Promise(resolve => {
    video.onloadedmetadata = () => { resolve(video) }
    })
}

window.addEventListener("DOMContentLoaded", () => {

    initCamera(
    config.video.width, config.video.height, config.video.fps
    ).then(video => {
    video.play()
    video.addEventListener("loadeddata", event => {
        console.log("Camera is ready")
        main()
    })
    })
});