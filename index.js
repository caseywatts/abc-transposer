// Utility
const selectors = {
  instrumentKeyDropdown: '#instrumentKey',
  octaveDropdown: '#octaveChange',
  flash: '#flash-message'
}

function el(name) {
  return document.querySelector(selectors[name]);
}


// Transposing UI
const TRANSPOSE_MAP = {
  "Ab": -4,
  "A": -3,
  "Bb": -2,
  "B": -1,
  "C": 0,
  "C#": 1,
  "D": 2,
  "Eb": 3,
  "E": 4,
  "F": 5,
  "F#": 6,
  "G": -5
};

const OCTAVE_MAP = {
  "+3": 36,
  "+2": 24,
  "+1": 12,
  "same": 0,
  "-1": -12,
  "-2": -24,
  "-3": -36
}

function setupInstrumentKeyDropdown() {
  // populate dropdown options
  Object.keys(TRANSPOSE_MAP).forEach(key => {
    value = TRANSPOSE_MAP[key];
    var option = document.createElement('option')
    option.text = key
    option.value = value
    el('instrumentKeyDropdown').appendChild(option);
  })

  // set default from LocalStorage
  var storedValue = window.localStorage.getItem('instrumentKey')
  if (storedValue) {
    el('instrumentKeyDropdown').value = storedValue;
  } else {
    el('instrumentKeyDropdown').value = 0;
  }
}

function setupOctaveDropdown() {
  // populate dropdown options
  Object.keys(OCTAVE_MAP).forEach(key => {
    value = OCTAVE_MAP[key];
    var option = document.createElement('option')
    option.text = key
    option.value = value
    el('octaveDropdown').appendChild(option);
  })

  // set default from LocalStorage
  var storedValue = window.localStorage.getItem('octaveChange')
  if (storedValue) {
    el('octaveDropdown').value = storedValue;
  } else {
    el('octaveDropdown').value = 0;
  }
}

function instrumentKeyChanged() {
  window.localStorage.setItem('instrumentKey', el('instrumentKeyDropdown').value);
  renderCurrentTune();
}

function octaveChanged() {
  window.localStorage.setItem('octaveChange', el('octaveDropdown').value);
  renderCurrentTune();
}

function transposeAmount() {
  var instrumentKeyTransposeAmount = parseInt(el('instrumentKeyDropdown').value);
  var octaveChangeTransposeAmount = parseInt(el('octaveDropdown').value);
  return instrumentKeyTransposeAmount + octaveChangeTransposeAmount;
}

function insertAudio(destinationSelector, abc, abcOptions, audioParams) {
  if (ABCJS.synth.supportsAudio()) {
    var synthControl = new ABCJS.synth.SynthController();
    synthControl.load(destinationSelector,
      null,
      {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
        displayWarp: true
      }
    );

    var visualObj = ABCJS.renderAbc("paper",
      abc, abcOptions);
    var createSynth = new ABCJS.synth.CreateSynth();
    createSynth.init({ visualObj: visualObj[0] }).then(function () {
      synthControl.setTune(visualObj[0], false, audioParams).then(function () {
        console.log("Audio successfully loaded.")
      }).catch(function (error) {
        console.warn("Audio problem:", error);
      });
    }).catch(function (error) {
      console.warn("Audio problem:", error);
    });
  } else {
    document.querySelector("#audio").innerHTML =
      "Audio is not supported in this browser.";
  }
}

function renderCurrentTuneVisual() {
  let abc = currentTune;
  let abcOptions = {
    visualTranspose: transposeAmount(),
    responsive: "resize"
  };
  ABCJS.renderAbc('paper', abc, abcOptions);
}

function renderCurrentTuneAudio() {
  let abc = currentTune;
  let abcOptions = {
    visualTranspose: transposeAmount(),
    responsive: "resize"
  };
  insertAudio("#midi-full", abc, abcOptions, {});
  insertAudio("#midi-melody", abc, abcOptions, { chordsOff: true });
  insertAudio("#midi-accompaniment", abc, abcOptions, { voicesOff: true });
}


// Tune Storage in URL
function updateUrlToCurrentTune() {
  window.location.search = `?tune=${encodeURIComponent(currentTune)}`;
}

function renderFromURL() {
  const params = (new URL(document.location)).searchParams;
  const tuneString = params.get('tune');

  if (tuneString) {
    currentTune = tuneString
    renderCurrentTuneVisual();
    renderCurrentTuneAudio();
    toast("tune read from URL", "goodColor");
  } else {
    renderExample();
    toast("showing example tune", "goodColor");
  }
}

// function readyForAudio() {
// renderCurrentTuneAudio();
// document.getElementById('audio').style.display = "block";
// document.getElementById('show-audio').style.display = "none";
// }


// clipboard
function renderFromClipboard() {
  navigator.clipboard.readText().then((text) => {
    currentTune = text;
    renderCurrentTune()
    updateUrlToCurrentTune();
    toast("tune read from clipboard, URL updated", "goodColor");
  }).catch(() => {
    renderExample()
    toast("no tune in clipboard, showing example tune", "badColor");
  })
}

function copyToClipboard() {
  navigator.clipboard.writeText(currentTune).then(function () {
    toast("abc copied to clipboard", "goodColor");
  }).catch(() => {
    toast("could not copy abc to clipboard", "badColor");
  })
}



// toast
function toast(text, className) {
  el('flash').textContent = text;
  el('flash').classList.remove('display-none');
  el('flash').classList.add("quickFlash")
  el('flash').classList.add(className)

  setTimeout(function () {
    el('flash').classList.add('display-none');
  }, 3000);
}


// exampleTune
function renderExample() {
  var exampleTune = `T:St. Anne's Reel
Z:Casey Watts, modified from http://www.folktunefinder.com/tunes/117039
M:4/4
L:1/8
R:Reel
K:D
de|:"D"f2 fg fedB|"D"A2FA DAFA|"G"B2 GB DBGB|"D"ABAG FAde|
"D"f2 fg fedB|"D"(3ABA FA DAFA|"G"BGBd "A"cAce|1"D"d2f2d2de:|2 "D"d2f2d2ag
|:"D"fdfa fdfa|"G"aggf g2 gf|"A"edcB ABce|"E"baa^g "A"a2a=g|
|"D"fdfa fdfa|"G"aggf g2 gf|"A"edcB Aceg|1"D"fd "A"ec "D"d2 ag:|2 "D"fd "A"ec "D"d2 |]`;

  currentTune = exampleTune

  renderCurrentTune()
  updateUrlToCurrentTune();
}


// HTTPS
function redirectHTTPS() {
  if ((window.location.port !== "3000") && (window.location.protocol != 'https:')) {
    window.location.protocol = 'https';
  }
}

// // MIDI Configuration
//   const GRAND_PIANO_SOUND_FONT_URL = '/';

//   function configureMIDI() {
// //    ABCJS.midi.setSoundFont(GRAND_PIANO_SOUND_FONT_URL)
//   }

// Page Setup
window.onload = function (event) {
  // renderFromClipboard();
  redirectHTTPS();

  setupInstrumentKeyDropdown();
  setupOctaveDropdown();

  // configureMIDI();
  renderFromURL();
}
