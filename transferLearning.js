// --------------------------- var declare ---------------------------
const video = document.querySelector('#webcam');
const screen1 = document.querySelector('#screen1');
const screen2 = document.querySelector('#screen2');
const screen3 = document.querySelector('#screen3');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const clf = knnClassifier.create();
const classes = ['kelly', 'jerry', 'C'];
let clicks = {0:0, 1:0, 2:0};

/*  -------------------------- enableCam -------------------------------- */
function enableCam(event) {
  
  event.target.disabled = true; // disable this button once clicked
  disableWebcamButton.disabled = false; // show the disable webcam button once clicked.
  document.querySelector("#liveView").style.display = "block";   // show the video and canvas elements

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.play();
    video.addEventListener('loadeddata', predictCam);
  })
  .catch(function(err) {
    console.error('Error accessing media devices.' + err );
  });

} // enableCam()

/*  -------------------- disableCam() -------------------- */
/*  trun off the webcam and clean up*/
function disableCam(event) {
  event.target.disabled = true; 
  enableWebcamButton.disabled = false;
  /* stop streaming */
  video.srcObject.getTracks().forEach(track => {
    track.stop();
  })
  /* clean up. some of these statements should be placed in predictCam() */
  video.srcObject = null;
  video.removeEventListener('loadeddata', predictCam);
  document.querySelector("#liveView").style.display = "none";
} // disableCam()


/*  -------------------- predictCam() -------------------- */
function predictCam() {
  if (clf.getNumClasses() > 0) {
    // Get the activation from mobilenet from the webcam.
    const activation = model.infer(video, true);
    // Get the most likely class and confidence from the classifier module.
    clf.predictClass(activation).then((result)=>{
        document.querySelector("#result").innerHTML = 
        `prediction: ${classes[result.label]}, probability: ${result.confidences[result.label]}`;
    });
  }
  window.requestAnimationFrame(predictCam);
}

/*  -------------------- addExample() -------------------- */
function addExample(event, classId) {

  clicks[classId] += 1;

  switch (classId) {
    case 0:
      event.target.innerHTML = `Add A(${clicks[classId]})`;
      const canvas1 = document.createElement('canvas') ;
      canvas1.width = 80 ;
      canvas1.height = 60 ;
      screen1.appendChild(canvas1) ;
      var context = canvas1.getContext('2d');
      context.drawImage(video, 0, 0, 80, 60);
      const embedding1 = model.infer(video, true);
      clf.addExample(embedding1, classId);
      break;
    case 1:
      event.target.innerHTML = `Add B(${clicks[classId]})`;
      const canvas2 = document.createElement('canvas') ;
      canvas2.width = 80 ;
      canvas2.height = 60 ;
      screen2.appendChild(canvas2) ;
      var context = canvas2.getContext('2d');
      context.drawImage(video, 0, 0, 80, 60);
      const embedding2 = model.infer(video, true);
      clf.addExample(embedding2, classId);
      break;
    case 2:
      event.target.innerHTML = `Add C(${clicks[classId]})`;
      const canvas3 = document.createElement('canvas') ;
      canvas3.width = 80 ;
      canvas3.height = 60 ;
      screen3.appendChild(canvas3) ;
      var context = canvas3.getContext('2d');
      context.drawImage(video, 0, 0, 80, 60);
      const embedding3 = model.infer(video, true);
      clf.addExample(embedding3, classId);
      break;
    case 3:
      for( var i = 0 ; i < 3; i++ ) 
        clicks[i] = 0 ;
      document.getElementById('class-a').innerHTML = `Add A(${clicks[0]})`;
      document.getElementById('class-b').innerHTML = `Add B(${clicks[0]})`;
      document.getElementById('class-c').innerHTML = `Add C(${clicks[0]})`;
      clf.clearAllClasses();
      while (screen1.firstChild) 
        screen1.removeChild(screen1.firstChild);
      while (screen2.firstChild) 
        screen2.removeChild(screen2.firstChild);
      while (screen3.firstChild) 
        screen3.removeChild(screen3.firstChild);
      break;
    default:
  }

}

/*  -------------------- getUserMediaSupported -------------------- */
function getUserMediaSupported() {
  /* 檢查可不可以支不支援這個browser */
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); 
} // getUserMediaSupported()

/*  -------------------- Main Function -------------------- */
mobilenet.load().then((loadedModel)=>{
  model = loadedModel;
  document.querySelector("#status").innerHTML = "model is loaded.";
  if (getUserMediaSupported()) { // 如果user可以用webcam
    enableWebcamButton.addEventListener('click', enableCam);
    disableWebcamButton.addEventListener('click', disableCam);
    document.getElementById('class-a').addEventListener('click', (e) => addExample(e, 0));
    document.getElementById('class-b').addEventListener('click', (e) => addExample(e, 1));
    document.getElementById('class-c').addEventListener('click', (e) => addExample(e, 2));
    document.getElementById('reset').addEventListener('click', (e) => addExample(e, 3));
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  } 
});

enableWebcamButton.disabled = false ;
