function generateTransposeOptions() {
  var transposeMap = {
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

  var transposeDropdown = document.getElementById('instrumentKey');
  Object.keys(transposeMap).forEach(key => {
    value = transposeMap[key];
    var option = document.createElement('option')
    option.text = key
    option.value = value
    transposeDropdown.appendChild(option);
  })

  var storedValue = window.localStorage.getItem('instrumentKey')
  if (storedValue) {
    transposeDropdown.value = storedValue;
  } else {
    transposeDropdown.value = 0;
  }
}

function setupOctave() {
  var octaveMap = {
    "+3": 36,
    "+2": 24,
    "+1": 12,
    "same": 0,
    "-1": -12,
    "-2": -24,
    "-3": -36
  }

  var octaveDropdown = document.getElementById('octaveChange');
  Object.keys(octaveMap).forEach(key => {
    value = octaveMap[key];
    var option = document.createElement('option')
    option.text = key
    option.value = value
    octaveDropdown.appendChild(option);
  })

  var storedValue = window.localStorage.getItem('octaveChange')
  if (storedValue) {
    octaveDropdown.value = storedValue;
  } else {
    octaveDropdown.value = 0;
  }
}

function newKeySelected(){
  var transposeDropdown = document.getElementById('instrumentKey');
  window.localStorage.setItem('instrumentKey', transposeDropdown.value);
  renderCurrentTune();
}

function newOctaveSelected(){
  var octaveDropdown = document.getElementById('octaveChange');
  window.localStorage.setItem('octaveChange', octaveDropdown.value);
  renderCurrentTune();
}

function transposeAmount() {
  var instrumentKeyTransposeAmount = parseInt(document.getElementById('instrumentKey').value);
  var octaveChangeTransposeAmount = parseInt(document.getElementById('octaveChange').value);
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
  document.getElementById('flash-message').textContent = text;
  document.getElementById('flash-message').classList.remove('display-none');
  document.getElementById('flash-message').classList.add("quickFlash")
  document.getElementById('flash-message').classList.add(className)

  setTimeout(function(){
    document.getElementById('flash-message').classList.add('display-none');
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
