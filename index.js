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
    ABCJS.renderMidi('midi-full', currentTune, {
      inlineControls: { loopToggle: true }
    });
    ABCJS.renderMidi('midi-melody', currentTune, {
      inlineControls: { loopToggle: true },
      chordsOff: true
    });
    ABCJS.renderMidi('midi-accompaniment', currentTune, {
      inlineControls: { loopToggle: true },
      voicesOff: true
    });
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
      renderCurrentTune();
      toast("tune read from URL", "goodColor");
    } else {
      renderExample();
      toast("showing example tune", "goodColor");
    }
  }


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
    navigator.clipboard.writeText(currentTune).then(function() {
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

    setTimeout(function(){
      el('flash').classList.add('display-none');
    }, 3000);
  }


// exampleTune
function renderExample() {
  var exampleTune = `X:25
T:Old Grey Cat
M:4/4
R:reel
Q:1/2=120
L:1/8
K:G
"Em"e2e2 E3F  |"Em"GFGA BAB^c|"D"d2d2 D3E|"D"FAdB AFED|
"Em"e2e2 E3F|"Em"GFGA BAB^c|"D"d^cBA BAGF|"Em"G2E2E4::
"Em"B2e2 e3d|"Em"Bdef gfed| "D"A2d2 d3B|ABde fedf|
"Em"e2B2 "G"g2B2|"A"a2B2 "B"b3a|"B"gfed BABd|"Em"e4 e4 :|`;

  currentTune = exampleTune

  renderCurrentTune()
  updateUrlToCurrentTune();
}


// HTTPS
  function redirectHTTPS() {
    if ((window.location.host !== "localhost:3000") && (window.location.protocol != 'https:')) {
      window.location.protocol = 'https';
    }
  }

// MIDI Configuration
  const GRAND_PIANO_SOUND_FONT_URL = '/';

  function configureMIDI() {
//    ABCJS.midi.setSoundFont(GRAND_PIANO_SOUND_FONT_URL)
  }

// Page Setup
  window.onload = function(event) {
    // renderFromClipboard();
    redirectHTTPS();

    setupInstrumentKeyDropdown();
    setupOctaveDropdown();

    configureMIDI();
    renderFromURL();
  }
