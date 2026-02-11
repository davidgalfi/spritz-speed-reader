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
var wpmInput = document.getElementById('spritz_wpm');
var readingControlsDiv = document.getElementById('reading_controls');

function getIntervalMs(){
  var wpm = Number(wpmInput.value) || 300;
  wpm = Math.max(50, Math.min(1200, wpm));
  return 60000 / wpm;
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

function word_update(intervalTime) {
  spritz = setInterval(function() {
    word_show(i);
    i++;

    if (i >= words.length) {
      clearInterval(spritz);
      setTimeout(function(){ stopReading(); }, intervalTime);
    }
  }, intervalTime);
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
  clearInterval(spritz);
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

  word_update(getIntervalMs());
}

function pauseReading() {
  if (!isReading) return;

  if (!isPaused) {
    clearInterval(spritz);
    isPaused = true;
    pauseButton.textContent = 'Resume';
  } else {
    isPaused = false;
    pauseButton.textContent = 'Pause';
    word_update(getIntervalMs());
  }
}

function stopReading() {
  clearInterval(spritz);
  isPaused = false;
  isReading = false;
  i = 0;

  exitReadingMode();
  pauseButton.textContent = 'Pause';

  spaceElement.innerHTML = '';
  if (words.length > 0) word_show(0);
}

startButton.addEventListener('click', startReading);
pauseButton.addEventListener('click', pauseReading);
stopButton.addEventListener('click', stopReading);

wpmInput.addEventListener('input', function() {
  if (isReading && !isPaused && spritz) {
    clearInterval(spritz);
    word_update(getIntervalMs());
  }
});

// Allow spacebar to pause/resume on desktop
window.addEventListener('keydown', function(e){
  if (e.code === 'Space' && isReading){
    e.preventDefault();
    pauseReading();
  }
});

words_set();
if (words.length > 0) word_show(0);
