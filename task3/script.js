// Состояние приложения хранится в массиве объектов.
let tasks = [];
let nextTaskId = 1;
let currentFilter = "all";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const formMessage = document.querySelector("#form-message");
const taskList = document.querySelector("#task-list");
const taskCounter = document.querySelector("#task-counter");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll(".filter-button");

// Возвращает задачи, подходящие под выбранный фильтр.
function getVisibleTasks() {
  return tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });
}

// Создаёт DOM-разметку одной задачи.
function createTaskElement(task) {
  const listItem = document.createElement("li");
  listItem.className = `task-item${task.completed ? " completed" : ""}`;
  listItem.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.className = "task-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Отметить задачу «${task.text}» как выполненную`);

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Удалить";
  deleteButton.setAttribute("aria-label", `Удалить задачу «${task.text}»`);

  checkbox.addEventListener("change", () => toggleTask(task.id));
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  listItem.append(checkbox, taskText, deleteButton);
  return listItem;
}

// Полностью обновляет список и связанные элементы интерфейса.
function render() {
  const visibleTasks = getVisibleTasks();
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;

  taskList.replaceChildren();

  visibleTasks
    .map((task) => createTaskElement(task))
    .forEach((taskElement) => taskList.append(taskElement));

  taskCounter.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyState.textContent = "Задач пока нет. Добавьте первую!";
  } else if (visibleTasks.length === 0) {
    emptyState.textContent = "В этой категории задач нет.";
  }
}

// Добавляет непустую задачу в состояние.
function addTask(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    formMessage.textContent = "Введите текст задачи.";
    taskInput.classList.add("input-error");
    taskInput.focus();
    return;
  }

  tasks.push({
    id: nextTaskId,
    text: cleanText,
    completed: false,
  });

  nextTaskId += 1;
  taskInput.value = "";
  formMessage.textContent = "";
  taskInput.classList.remove("input-error");
  render();
  taskInput.focus();
}

// Меняет статус выполнения задачи по её идентификатору.
function toggleTask(taskId) {
  tasks = tasks.map((task) => (
    task.id === taskId ? { ...task, completed: !task.completed } : task
  ));
  render();
}

// Удаляет задачу из массива по её идентификатору.
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  render();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

taskInput.addEventListener("input", () => {
  if (taskInput.value.trim()) {
    formMessage.textContent = "";
    taskInput.classList.remove("input-error");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    render();
  });
});

render();
