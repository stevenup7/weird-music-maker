var drumsTypes  = ['clap', 'hat', 'kick', 'snare'];
var soundBuffers = [];
var context;

function init() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();

    Promise.all([
      loadSound(context, 'sounds/clap.wav', 'clap'),
      loadSound(context, 'sounds/hat.wav', 'hat'),
      loadSound(context, 'sounds/kick.wav', 'kick'),
      loadSound(context, 'sounds/snare.wav', 'snare')
    ]).then(() => {
      console.log('loaded all sounds');
      var drawing = SVG('drawing').size(500, 500);
      var b = new Beat (120, 4, context);

      b.setInstrumentBuffers(soundBuffers);

      var v = new BeatVisualization(drawing, b);
      b.addSound('kick', [0, 4, 8, 12]);
      b.addSound('hat', [2, 4, 10]);
      b.addSound('clap', [8, 9, 11, 12]);
      b.addSound('snare', [0]);
      b.start();

      function testStep() {
        v.tick();
        window.requestAnimationFrame(testStep);
      }

      document.getElementById("stop").addEventListener("click", () => {
        console.log('stop');
        b.stop();
      }, false);

      document.getElementById("start").addEventListener("click", () => {
        console.log('start');
        b.start();
      }, false);


      document.getElementById("reset").addEventListener("click", () => {
        b.reset();
      }, false);

      window.requestAnimationFrame(testStep);
    });




  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }
}





function loadSound(context, url, name) {
  var request = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = function() {
      context.decodeAudioData(request.response, function(buffer) {
        soundBuffers[name] = buffer;
        resolve();
      }, reject);
    };
    request.send();
  });
}

window.addEventListener('load', init, false);
