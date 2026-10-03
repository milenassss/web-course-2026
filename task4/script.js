let secretNumber = "";
let attempts = 0;
let attemptHistory = [];
let gameFinished = false;

const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const checkButton = document.querySelector("#check-button");
const newGameButton = document.querySelector("#new-game-button");
const inputError = document.querySelector("#input-error");
const statusMessage = document.querySelector("#status-message");
const attemptCounter = document.querySelector("#attempt-counter");
const historyList = document.querySelector("#history-list");
const historyBadge = document.querySelector("#history-badge");
const emptyHistory = document.querySelector("#empty-history");

// Генерирует четырёхзначное число без повторяющихся цифр.
function generateSecretNumber() {
  const firstDigit = String(Math.floor(Math.random() * 9) + 1);
  const availableDigits = "0123456789".split("").filter((digit) => digit !== firstDigit);
  let result = firstDigit;

  while (result.length < 4) {
    const randomIndex = Math.floor(Math.random() * availableDigits.length);
    result += availableDigits.splice(randomIndex, 1)[0];
  }

  return result;
}

// Возвращает сообщение об ошибке или пустую строку при верном вводе.
function validateGuess(guess) {
  if (!/^\d{4}$/.test(guess)) {
    return "Нужно ввести ровно 4 цифры.";
  }

  if (new Set(guess).size !== 4) {
    return "Все четыре цифры должны быть разными.";
  }

  return "";
}

// Считает совпадения цифр и их позиций.
function calculateBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  guess.split("").forEach((digit, index) => {
    if (digit === secret[index]) {
      bulls += 1;
    } else if (secret.includes(digit)) {
      cows += 1;
    }
  });

  return { bulls, cows };
}

// Подбирает правильную форму русского слова для числа.
function getWordForm(number, forms) {
  const lastTwoDigits = number % 100;
  const lastDigit = number % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return forms[2];
  if (lastDigit === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
  return forms[2];
}

function formatResult(bulls, cows) {
  const bullWord = getWordForm(bulls, ["бык", "быка", "быков"]);
  const cowWord = getWordForm(cows, ["корова", "коровы", "коров"]);
  return `${bulls} ${bullWord}, ${cows} ${cowWord}`;
}

// Перерисовывает историю на основе массива попыток.
function renderHistory() {
  historyList.replaceChildren();

  attemptHistory
    .map((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = `history-item${item.bulls === 4 ? " winning" : ""}`;

      const number = document.createElement("span");
      number.className = "history-number";
      number.textContent = `#${index + 1}`;

      const guess = document.createElement("span");
      guess.className = "history-guess";
      guess.textContent = item.guess;

      const result = document.createElement("span");
      result.className = "history-result";
      result.textContent = formatResult(item.bulls, item.cows);

      listItem.append(number, guess, result);
      return listItem;
    })
    .forEach((historyItem) => historyList.append(historyItem));

  historyBadge.textContent = String(attemptHistory.length);
  emptyHistory.hidden = attemptHistory.length > 0;
}

// Полностью сбрасывает состояние без перезагрузки страницы.
function startNewGame() {
  secretNumber = generateSecretNumber();
  attempts = 0;
  attemptHistory = [];
  gameFinished = false;

  guessForm.reset();
  guessInput.disabled = false;
  checkButton.disabled = false;
  guessInput.classList.remove("input-invalid");
  inputError.textContent = "";
  statusMessage.textContent = "Игра началась. Введите первую попытку.";
  statusMessage.classList.remove("win");
  attemptCounter.textContent = "Попыток: 0";
  renderHistory();
  guessInput.focus();
}

// Обрабатывает одну корректную попытку игрока.
function makeGuess(guess) {
  const result = calculateBullsAndCows(secretNumber, guess);

  attempts += 1;
  attemptHistory.push({ guess, ...result });
  attemptCounter.textContent = `Попыток: ${attempts}`;
  renderHistory();

  if (result.bulls === 4) {
    gameFinished = true;
    statusMessage.textContent = `Победа! Угадано за ${attempts} ${getWordForm(
      attempts,
      ["попытку", "попытки", "попыток"],
    )}.`;
    statusMessage.classList.add("win");
    guessInput.disabled = true;
    checkButton.disabled = true;
    return;
  }

  statusMessage.textContent = `${guess} → ${formatResult(result.bulls, result.cows)}`;
  guessInput.value = "";
  guessInput.focus();
}

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (gameFinished) return;

  const guess = guessInput.value.trim();
  const errorMessage = validateGuess(guess);

  if (errorMessage) {
    inputError.textContent = errorMessage;
    guessInput.classList.add("input-invalid");
    guessInput.focus();
    return;
  }

  inputError.textContent = "";
  guessInput.classList.remove("input-invalid");
  makeGuess(guess);
});

guessInput.addEventListener("input", () => {
  inputError.textContent = "";
  guessInput.classList.remove("input-invalid");
});

newGameButton.addEventListener("click", startNewGame);

startNewGame();
