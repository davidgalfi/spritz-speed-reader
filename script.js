var spritz;
var words = [];
var i = 0;
var isPaused = false;
var isReading = false;

var spaceElement = document.querySelector('.spritz-word');
var textArea = document.getElementById('demo_text');
var startButton = document.getElementById('spritz_start');
var pauseButton = document.getElementById('spritz_pause');
var stopButton = document.getElementById('spritz_stop');
var rewindButton = document.getElementById('spritz_rewind');
var wpmInput = document.getElementById('spritz_wpm');
var readingControlsDiv = document.getElementById('reading_controls');
var spritzArea = document.getElementById('spritz_area');

// Advanced settings
var longWordPauseEnabled = document.getElementById('long_word_pause');
var longWordMultiplier = document.getElementById('long_word_multiplier');
var punctuationPauseEnabled = document.getElementById('punctuation_pause');
var punctuationMultiplier = document.getElementById('punctuation_multiplier');
var specialPauseEnabled = document.getElementById('special_pause');
var specialMultiplier = document.getElementById('special_multiplier');
var rewindAmountInput = document.getElementById('rewind_amount');

var LONG_WORD_THRESHOLD = 9;
var PUNCTUATION_REGEX = /[.,;:!?]+$/;
var SPECIAL_CHARS_REGEX = /[\(\)\[\]\/\\\-]+$/;

// Touch gesture variables
var touchStartX = 0;
var touchEndX = 0;
var SWIPE_THRESHOLD = 50;

function getBaseIntervalMs(){
  var wpm = Number(wpmInput.value) || 300;
  wpm = Math.max(50, Math.min(1200, wpm));
  return 60000 / wpm;
}

function getIntervalForWord(word) {
  var baseInterval = getBaseIntervalMs();
  var multiplier = 1;

  if (longWordPauseEnabled.checked && word.length >= LONG_WORD_THRESHOLD) {
    multiplier = Math.max(multiplier, Number(longWordMultiplier.value) || 1.5);
  }

  if (punctuationPauseEnabled.checked && PUNCTUATION_REGEX.test(word)) {
    multiplier = Math.max(multiplier, Number(punctuationMultiplier.value) || 2);
  }

  if (specialPauseEnabled.checked && SPECIAL_CHARS_REGEX.test(word)) {
    multiplier = Math.max(multiplier, Number(specialMultiplier.value) || 1.3);
  }

  return baseInterval * multiplier;
}

function words_set() {
  words = (textArea.value || '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .split(' ')
    .filter(function(w){ return w.length > 0; });
}

function word_show(index) {
  if (index >= words.length) return;

  var word = words[index];
  var stop = Math.round((word.length + 1) * 0.4) - 1;

  if (stop < 0) stop = 0;
  if (stop >= word.length) stop = word.length - 1;

  spaceElement.innerHTML =
    '<div>' + word.slice(0, stop) + '</div>' +
    '<div>' + word[stop] + '</div>' +
    '<div>' + word.slice(stop + 1) + '</div>';
}

function word_update() {
  function scheduleNext() {
    if (i >= words.length) {
      stopReading();
      return;
    }

    var currentWord = words[i];
    var interval = getIntervalForWord(currentWord);
    
    word_show(i);
    i++;

    spritz = setTimeout(scheduleNext, interval);
  }

  scheduleNext();
}

function enterReadingMode(){
  document.body.classList.add('reading-mode');
  readingControlsDiv.hidden = false;
}

function exitReadingMode(){
  document.body.classList.remove('reading-mode');
  readingControlsDiv.hidden = true;
}

function startReading() {
  clearTimeout(spritz);
  words_set();

  if (words.length === 0) {
    alert('Please enter some text to read!');
    return;
  }

  enterReadingMode();
  isReading = true;

  if (isPaused) {
    isPaused = false;
    pauseButton.textContent = 'Pause';
  } else {
    i = 0;
  }

  word_update();
}

function pauseReading() {
  if (!isReading) return;

  if (!isPaused) {
    clearTimeout(spritz);
    isPaused = true;
    pauseButton.textContent = 'Resume';
  } else {
    isPaused = false;
    pauseButton.textContent = 'Pause';
    word_update();
  }
}

function stopReading() {
  clearTimeout(spritz);
  isPaused = false;
  isReading = false;
  i = 0;

  exitReadingMode();
  pauseButton.textContent = 'Pause';

  spaceElement.innerHTML = '';
  if (words.length > 0) word_show(0);
}

function rewindReading() {
  if (!isReading) return;

  var rewindAmount = Number(rewindAmountInput.value) || 10;
  
  // Jump back by rewindAmount words, but don't go negative
  i = Math.max(0, i - rewindAmount - 1);
  
  // If we were paused, stay paused and just show the word
  if (isPaused) {
    word_show(i);
    i++;
  } else {
    // If we were reading, restart from the new position
    clearTimeout(spritz);
    word_update();
  }
}

// Touch gesture handlers
function handleTouchStart(e) {
  if (!isReading) return;
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  if (!isReading) return;
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}

function handleSwipeGesture() {
  var swipeDistance = touchEndX - touchStartX;
  
  // Swipe right (left to right) = rewind
  if (swipeDistance > SWIPE_THRESHOLD) {
    rewindReading();
  }
}

// Event Listeners
startButton.addEventListener('click', startReading);
pauseButton.addEventListener('click', pauseReading);
stopButton.addEventListener('click', stopReading);
rewindButton.addEventListener('click', rewindReading);

wpmInput.addEventListener('input', function() {
  if (isReading && !isPaused) {
    clearTimeout(spritz);
    word_update();
  }
});

// Keyboard shortcuts
window.addEventListener('keydown', function(e){
  if (!isReading) return;
  
  if (e.code === 'Space'){
    e.preventDefault();
    pauseReading();
  } else if (e.code === 'ArrowLeft'){
    e.preventDefault();
    rewindReading();
  }
});

// Touch gesture listeners
spritzArea.addEventListener('touchstart', handleTouchStart, {passive: true});
spritzArea.addEventListener('touchend', handleTouchEnd, {passive: true});

// Initialize
words_set();
if (words.length > 0) word_show(0);
