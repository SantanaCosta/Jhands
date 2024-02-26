const { GestureDescription, Finger, FingerCurl, FingerDirection } = window.fp;
  
const grabGesture = new GestureDescription('grab');
const closeGesture = new GestureDescription('close');
const openGesture = new GestureDescription('open');
const upIndexGesture = new GestureDescription('upIndex');

  
// Grab
// -----------------------------------------------------------------------------
  
grabGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
grabGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.6);
grabGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.6);

for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    grabGesture.addCurl(finger, FingerCurl.FullCurl, 0.5);
    grabGesture.addCurl(finger, FingerCurl.HalfCurl, 1.0);
    grabGesture.addCurl(finger, FingerCurl.NoCurl, 0.3);
}
grabGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 0.6);


// Close
// -----------------------------------------------------------------------------
  
for(let finger of Finger.all) {
    closeGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
}
closeGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
closeGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.1);


// Open
//------------------------------------------------------------------------------
  
for(let finger of Finger.all) {
    openGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
    openGesture.addCurl(finger, FingerCurl.HalfCurl, 0.3);
}

  
// upIndexGesture
// -----------------------------------------------------------------------------
upIndexGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
upIndexGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, 1.0);

upIndexGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
upIndexGesture.addDirection(Finger.Index, FingerDirection.VerticalUp, 1.0);

for(let finger of [Finger.Middle, Finger.Ring, Finger.Pinky]) {
    upIndexGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
    upIndexGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0);
}

const gestures = [
    grabGesture, closeGesture, openGesture, upIndexGesture
]

export {
    gestures
}
