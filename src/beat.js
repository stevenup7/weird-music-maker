class Beat {

  constructor (bpm, beatsPerBar, audioContext) {
    this.bpm = bpm;
    this.beatsPerBar = beatsPerBar;
    this.quartersPerBar = this.beatsPerBar * 4;
    this.audioContext = audioContext;
    this.secondsPerBeat = 60 / bpm;
    this.secondsPerQuarter = 60 / (bpm * 4);
    this.secondsPerBar = (60 / bpm) * beatsPerBar;
    this.currentBarStartTime = 0; // the audio context time the current bar started at
    this.position = 0; // current position through the bar in seconds
    this.to = null;
    this.barStartTime = null;
    this.reset();
    this.quarters = [];
    for (var i = 0; i < this.quartersPerBar; i ++) {
      this.quarters[i] = {};
    }
  }

  addSound (id, when) {
    when.forEach((i) => {
      this.quarters[i][id] = {};
    });
  }

  makePlayBuffer(id) {
    var source = this.audioContext.createBufferSource();
    source.buffer = this.instrumentBuffers[id];
    // connect the source to the context's destination (the speakers)
    source.connect(this.audioContext.destination);
    return source;
  }

  reset () {
    this.lastScheduledQuarter = -1;
    this.position = 0;
  }

  start () {
    this.stop();
    this.time = this.audioContext.currentTime;
    this.barStartTime = this.time - this.position;
    this.to = setTimeout(this.tick.bind(this), 10);
  }

  stop () {
    clearTimeout(this.to);
  }

  lookAhead () {
    // so this is confusing when we wrap around;
    this.currentQuarter = Math.floor(this.position / this.secondsPerQuarter);
    var lookAheadQuarter = this.currentQuarter + 1;
    this.scheduleQuarter = lookAheadQuarter % this.quartersPerBar;

    if (this.currentQuarter != this.lastQuarter) {

      Object.keys(this.quarters[this.scheduleQuarter]).forEach((instrument) => {
        console.log(instrument);
        let i = this.makePlayBuffer(instrument);
        this.quarters[this.scheduleQuarter][instrument] = i;
        i.start(this.barStartTime + lookAheadQuarter * this.secondsPerQuarter);
      });

      this.lastQuarter = this.currentQuarter;
    }
  }

  // called by the global timer
  tick () {
    this.lookAhead();
    // here we need to look ahead a small ? amount of time and schedule the next few sounds
    this.time = this.audioContext.currentTime;
    this.position = this.time - this.barStartTime;
    if (this.position > this.secondsPerBar) {
      // start a new bar
      this.position = this.position - this.secondsPerBar;
      this.barStartTime = this.time - this.position;
    }
    //console.log(this.time, this.position, this.secondsPerBar);
    this.to = setTimeout(this.tick.bind(this), 10);
  }

  setInstrumentBuffers (buffers) {
    this.instrumentBuffers = buffers;
  }

  playSound(buffer, time) {
    source.start(time);
  }


}

class BeatVisualization {

  constructor (drawing, beat) {
    this.beat = beat;
    this.drawing = drawing;
    this.center = new math2d.Point(200, 200);

    this.baseShape = this.makeCircle(150, {
      fill: '#f06'
    }).move(this.center.x, this.center.y);

    this.pointer = this.makeCircle(40, {
      fill: '#fff',
      strokeWidth: '4px',
      stroke: '#f06'
    }).move(this.center.x, this.center.y);

  }

  tick () {
    var t = this.beat.position / this.beat.secondsPerBar * 360;
    var location  = this.center.pointAtAngleDeg( t, 150);
    this.pointer.move(location.x, location.y);

  }

  makeCircle (r, attrs) {
    return this.drawing.circle(r).attr(attrs).transform({ x: -r/2, y: -r/2 });
  }
}

class InstrumentVisualization {
  constructor (beatvisualization) {


  }
}
