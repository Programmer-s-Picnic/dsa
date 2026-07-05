/*
  KBC Quiz - Plain JavaScript Version
  This file is deliberately written with detailed comments for students.
*/

let questions = [];              // Stores all questions loaded from JSON
let currentIndex = 0;             // Which question is currently visible
let selectedAnswer = null;        // The option selected by the student
let locked = false;               // Prevents changing answer after lock
let prizeWon = 0;                 // Current winning amount
let timerValue = 30;              // Seconds left for current question
let timerId = null;               // Used to stop setInterval
let usedLifelines = { fifty: false, skip: false, poll: false };

const questionNumber = document.getElementById('questionNumber');
const timer = document.getElementById('timer');
const currentPrize = document.getElementById('currentPrize');
const questionText = document.getElementById('questionText');
const optionsBox = document.getElementById('optionsBox');
const message = document.getElementById('message');
const prizeLadder = document.getElementById('prizeLadder');
const lockBtn = document.getElementById('lockBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const fiftyBtn = document.getElementById('fiftyBtn');
const skipBtn = document.getElementById('skipBtn');
const pollBtn = document.getElementById('pollBtn');
const pollBox = document.getElementById('pollBox');

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    questions = await response.json();
    drawPrizeLadder();
    showQuestion();
  } catch (error) {
    questionText.textContent = 'Could not load questions.json. Use Live Server or a local server.';
  }
}

function drawPrizeLadder() {
  prizeLadder.innerHTML = '';
  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.textContent = `Q${index + 1} - ₹${q.prize}`;
    if (index === currentIndex) li.classList.add('active');
    prizeLadder.appendChild(li);
  });
}

function showQuestion() {
  const q = questions[currentIndex];
  selectedAnswer = null;
  locked = false;
  message.textContent = '';
  pollBox.classList.add('hidden');
  pollBox.innerHTML = '';
  nextBtn.disabled = true;
  lockBtn.disabled = false;

  questionNumber.textContent = currentIndex + 1;
  currentPrize.textContent = prizeWon;
  questionText.textContent = q.question;
  optionsBox.innerHTML = '';

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = `${String.fromCharCode(65 + index)}. ${optionText}`;
    btn.dataset.answer = optionText;

    btn.addEventListener('click', () => selectOption(btn, optionText));
    optionsBox.appendChild(btn);
  });

  drawPrizeLadder();
  startTimer();
}

function selectOption(button, answer) {
  if (locked) return;

  selectedAnswer = answer;
  document.querySelectorAll('.option').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
}

function lockAnswer() {
  if (locked) return;
  if (!selectedAnswer) {
    message.textContent = 'Please select an answer first.';
    return;
  }

  locked = true;
  stopTimer();
  lockBtn.disabled = true;
  nextBtn.disabled = false;

  const q = questions[currentIndex];
  const isCorrect = selectedAnswer === q.answer;

  document.querySelectorAll('.option').forEach(btn => {
    const value = btn.dataset.answer;
    if (value === q.answer) btn.classList.add('correct');
    if (value === selectedAnswer && !isCorrect) btn.classList.add('wrong');
    btn.disabled = true;
  });

  if (isCorrect) {
    prizeWon = q.prize;
    currentPrize.textContent = prizeWon;
    message.textContent = 'Correct answer!';
  } else {
    message.textContent = `Wrong answer. You won ₹${prizeWon}.`;
  }
}

function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    endGame();
  }
}

function endGame() {
  stopTimer();
  questionText.textContent = `Game Over! Final prize won: ₹${prizeWon}`;
  optionsBox.innerHTML = '';
  message.textContent = 'Click Restart to play again.';
  lockBtn.disabled = true;
  nextBtn.disabled = true;
}

function startTimer() {
  stopTimer();
  timerValue = 30;
  timer.textContent = timerValue;
  timerId = setInterval(() => {
    timerValue--;
    timer.textContent = timerValue;
    if (timerValue <= 0) {
      stopTimer();
      message.textContent = 'Time is up!';
      lockBtn.disabled = true;
      nextBtn.disabled = false;
      locked = true;
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
}

function useFiftyFifty() {
  if (usedLifelines.fifty || locked) return;
  usedLifelines.fifty = true;
  fiftyBtn.disabled = true;

  const q = questions[currentIndex];
  const wrongButtons = [...document.querySelectorAll('.option')]
    .filter(btn => btn.dataset.answer !== q.answer);

  wrongButtons.slice(0, 2).forEach(btn => btn.classList.add('hide'));
}

function skipQuestion() {
  if (usedLifelines.skip || locked) return;
  usedLifelines.skip = true;
  skipBtn.disabled = true;
  nextQuestion();
}

function audiencePoll() {
  if (usedLifelines.poll || locked) return;
  usedLifelines.poll = true;
  pollBtn.disabled = true;

  const q = questions[currentIndex];
  pollBox.classList.remove('hidden');
  pollBox.innerHTML = '<strong>Audience Poll</strong><br>' +
    q.options.map(opt => {
      const percent = opt === q.answer ? 60 : Math.floor(Math.random() * 20) + 5;
      return `${opt}: ${percent}%`;
    }).join('<br>');
}

function restartGame() {
  currentIndex = 0;
  prizeWon = 0;
  usedLifelines = { fifty: false, skip: false, poll: false };
  fiftyBtn.disabled = false;
  skipBtn.disabled = false;
  pollBtn.disabled = false;
  showQuestion();
}

lockBtn.addEventListener('click', lockAnswer);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartGame);
fiftyBtn.addEventListener('click', useFiftyFifty);
skipBtn.addEventListener('click', skipQuestion);
pollBtn.addEventListener('click', audiencePoll);

loadQuestions();
