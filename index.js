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

const selectors = {
  instrumentKeyDropdown: '#instrumentKey',
  octaveDropdown: '#octaveChange',
  flash: '#flash-message'
}

function el(name) {
  return document.querySelector(selectors[name]);
}


function generateTransposeOptions() {
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

function setupOctave() {
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

function instrumentKeyChanged(){
  window.localStorage.setItem('instrumentKey', el('instrumentKeyDropdown').value);
  renderCurrentTune();
}

function octaveChanged(){
  window.localStorage.setItem('octaveChange', el('octaveDropdown').value);
  renderCurrentTune();
}

function transposeAmount() {
  var instrumentKeyTransposeAmount = parseInt(el('instrumentKeyDropdown').value);
  var octaveChangeTransposeAmount = parseInt(el('octaveDropdown').value);
  return instrumentKeyTransposeAmount + octaveChangeTransposeAmount;
}

function renderCurrentTune() {
  ABCJS.renderAbc('paper', currentTune, {
    visualTranspose: transposeAmount(),
    responsive: "resize"
  });
}

function updateUrlToCurrentTune() {
  window.location.hash = encodeURIComponent(currentTune);
}

function renderFromURL() {
  if (window.location.hash) {
    currentTune = decodeURIComponent(window.location.hash.substr(1));
    renderCurrentTune();
    toast("tune read from URL", "goodColor");
  } else {
    renderExample();
    toast("showing example tune", "goodColor");
  }
}

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

function toast(text, className) {
  debugger;
  el('flash').textContent = text;
  el('flash').classList.remove('display-none');
  el('flash').classList.add("quickFlash")
  el('flash').classList.add(className)

  setTimeout(function(){
    el('flash').classList.add('display-none');
  }, 3000);
}

function renderExample() {
  var exampleTune = `X: 33
T:Old Grey Cat
M:4/4
L:1/8
K:EDor
"Em"e2 e2 E3F|GFGA BABc|"D"d2d2 D3E|FAdB AFED|!
"Em"e2e2 E3F|GFGA BABc|"D"dcBA BAGF|"Em"E4 e2:|!
|:"Em"B2e2 e3d|Bdef gfed|"D"A2d2 d3B|ABde fedf|!
"Em"e2B2 "G"g2B2|"A"a2B2 "B"b4a|gfed BABd|"EM"e4 e4:|!`;

  currentTune = exampleTune

  renderCurrentTune()
  updateUrlToCurrentTune();
}


function redirectHTTPS() {
  if ((window.location.host !== "localhost:3000") && (window.location.protocol != 'https:')) {
    window.location.protocol = 'https';
  }
}

window.onload = function(event) {
  // renderFromClipboard();
  generateTransposeOptions()
  setupOctave()

  redirectHTTPS();
  renderFromURL();
}

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'UA-150091503-1');
