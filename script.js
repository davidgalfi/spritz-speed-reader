var wpm = document.getElementById('spritz_wpm').value;
var interval = 60000 / wpm;
var spritz;
var words = [];
var i = 0;
var isPaused = false;

var spaceElement = document.querySelector('.spritz-word');
var textArea = document.querySelector('.demo-text');
var startButton = document.getElementById('spritz_start');
var pauseButton = document.getElementById('spritz_pause');
var wpmInput = document.getElementById('spritz_wpm');

function words_set() {
    words = textArea.value.replace(/\s{2,}/g, ' ').trim().split(' ').filter(word => word.length > 0);
}

function word_show(index) {
    if (index >= words.length) return;
    
    var word = words[index];
    var stop = Math.round((word.length + 1) * 0.4) - 1;
    
    if (stop < 0) stop = 0;
    if (stop >= word.length) stop = word.length - 1;
    
    spaceElement.innerHTML = '<div>' + word.slice(0, stop) + '</div><div>' + word[stop] + '</div><div>' + word.slice(stop + 1) + '</div>';
}

function word_update(intervalTime) {
    spritz = setInterval(function() {
        word_show(i);
        i++;
        
        if (i >= words.length) {
            setTimeout(function() {
                spaceElement.innerHTML = '';
                i = 0;
                startButton.textContent = 'Start Reading';
            }, intervalTime);
            clearInterval(spritz);
        }
    }, intervalTime);
}

function startReading() {
    clearInterval(spritz);
    words_set();
    
    if (words.length === 0) {
        alert('Please enter some text to read!');
        return;
    }
    
    if (isPaused) {
        isPaused = false;
    } else {
        i = 0;
    }
    
    startButton.textContent = 'Restart';
    pauseButton.textContent = 'Pause';
    word_update(60000 / wpmInput.value);
}

function pauseReading() {
    if (!isPaused) {
        clearInterval(spritz);
        isPaused = true;
        pauseButton.textContent = 'Resume';
    } else {
        isPaused = false;
        pauseButton.textContent = 'Pause';
        word_update(60000 / wpmInput.value);
    }
}

// Event Listeners
startButton.addEventListener('click', startReading);
pauseButton.addEventListener('click', pauseReading);

wpmInput.addEventListener('input', function() {
    if (!isPaused && spritz) {
        clearInterval(spritz);
        word_update(60000 / wpmInput.value);
    }
});

// Initialize
words_set();
if (words.length > 0) {
    word_show(0);
}