const sectors = [...document.querySelectorAll('.sector')];
const startButton = document.querySelector('#start-button');
const levelElement = document.querySelector('#level');
const statusElement = document.querySelector('#status');

const SHOW_TIME = 500;
const STEP_PAUSE = 220;
const NEXT_ROUND_PAUSE = 700;
const PLAYER_FLASH_TIME = 180;

// Основные данные текущей игры.
const game = {
  sequence: [],
  playerInput: [],
  isShowing: false,
  isWaitingInput: false,
  isActive: false,
};

// чтобы при рестарте/проигрыше отменить все запланированные действия
const pendingTimers = [];

// обёртка над setTimeout, которая ещё и запоминает id таймера
function schedule(callback, delay) {
  const timerId = setTimeout(callback, delay);
  pendingTimers.push(timerId);
}

// отменяет все таймеры и очищает массив
function clearPendingTimers() {
  pendingTimers.forEach((timerId) => clearTimeout(timerId));
  pendingTimers.length = 0;
}

// yбирает подсветку со всех секторов
function clearSectorHighlights() {
  sectors.forEach((sector) => sector.classList.remove('active'));
}

// включает/выключает кнопки — игрок может нажимать только когда его ход
function setSectorsEnabled(isEnabled) {
  sectors.forEach((sector) => {
    sector.disabled = !isEnabled;
  });
}

function updateStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle('status--error', isError);
}

function updateLevel() {
  levelElement.textContent = String(game.sequence.length);
}

// добавляет случайный шаг в конец последовательности
function addRandomStep() {
  game.sequence.push(Math.floor(Math.random() * sectors.length));
  updateLevel();
}

function finishSequenceDisplay() {
  if (!game.isActive) {
    return;
  }

  game.isShowing = false;
  game.isWaitingInput = true;
  game.playerInput = [];
  setSectorsEnabled(true);
  updateStatus('Ваш ход');
}

function showSequenceStep(stepIndex) {
  if (!game.isActive) {
    return;
  }

  if (stepIndex >= game.sequence.length) {
    finishSequenceDisplay();
    return;
  }

  const sectorIndex = game.sequence[stepIndex];
  const sector = sectors[sectorIndex];
  sector.classList.add('active');

  schedule(() => {
    sector.classList.remove('active');
    schedule(() => showSequenceStep(stepIndex + 1), STEP_PAUSE);
  }, SHOW_TIME);
}

function showSequence() {
  game.isShowing = true;
  game.isWaitingInput = false;
  game.playerInput = [];
  setSectorsEnabled(false);
  updateStatus('Смотрите и запоминайте…');
  showSequenceStep(0);
}

function startNextRound() {
  if (!game.isActive) {
    return;
  }

  addRandomStep();
  showSequence();
}

function endGame() {
  const reachedLevel = game.sequence.length;

  game.isActive = false;
  game.isShowing = false;
  game.isWaitingInput = false;
  clearPendingTimers();
  clearSectorHighlights();
  setSectorsEnabled(false);
  updateStatus(`Ошибка! Вы дошли до уровня ${reachedLevel}`, true);
  startButton.textContent = 'Играть снова';
}

function completeRound() {
  game.isWaitingInput = false;
  setSectorsEnabled(false);
  updateStatus('Верно! Следующий уровень…');
  schedule(startNextRound, NEXT_ROUND_PAUSE);
}

function flashPlayerSector(sector) {
  sector.classList.add('active');
  schedule(() => sector.classList.remove('active'), PLAYER_FLASH_TIME);
}

function handleSectorClick(event) {
  // Во время показа нажатия не принимаются.
  if (!game.isActive || game.isShowing || !game.isWaitingInput) {
    return;
  }

  const sector = event.currentTarget;
  const sectorIndex = Number(sector.dataset.sector);
  const inputIndex = game.playerInput.length;

  flashPlayerSector(sector);
  game.playerInput.push(sectorIndex);

  if (sectorIndex !== game.sequence[inputIndex]) {
    endGame();
    return;
  }

  if (game.playerInput.length === game.sequence.length) {
    completeRound();
  } else {
    const stepsLeft = game.sequence.length - game.playerInput.length;
    updateStatus(`Верно. Осталось: ${stepsLeft}`);
  }
}

function startGame() {
  clearPendingTimers();
  clearSectorHighlights();

  game.sequence = [];
  game.playerInput = [];
  game.isShowing = false;
  game.isWaitingInput = false;
  game.isActive = true;

  setSectorsEnabled(false);
  startButton.textContent = 'Начать заново';
  updateStatus('Игра начинается…');
  updateLevel();
  startNextRound();
}

sectors.forEach((sector) => sector.addEventListener('click', handleSectorClick));
startButton.addEventListener('click', startGame);
