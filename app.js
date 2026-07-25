const tg = window.Telegram?.WebApp;

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  if (tg) {
    tg.ready();
    tg.expand(); // Разворачиваем на весь экран смартфона
  }

  runLoadingSequence();
});

// Симуляция загрузки данных
function runLoadingSequence() {
  let progress = 0;
  const fill = document.getElementById("progress-fill");
  const status = document.getElementById("status-text");
  const btn = document.getElementById("start-btn");

  const interval = setInterval(() => {
    progress += 10;
    fill.style.width = progress + "%";

    if (progress === 40) status.innerText = "ЗАГРУЗКА АВТОПАРКА...";
    if (progress === 80) status.innerText = "СИНХРОНИЗАЦИЯ БИРЖИ...";

    if (progress >= 100) {
      clearInterval(interval);
      document.querySelector(".progress-bar").style.display = "none";
      status.style.display = "none";
      btn.style.display = "block";
    }
  }, 150);
}

// Вход в игру
function enterGame() {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("medium"); // Виброотклик
  }

  document.getElementById("splash-screen").classList.add("hidden");
  document.getElementById("app-content").classList.remove("hidden");

  // Подгружаем имя пользователя из Telegram
  if (tg?.initDataUnsafe?.user) {
    document.getElementById("user-name").innerText = tg.initDataUnsafe.user.first_name;
  }
}

// Навигация по экранам
function switchTab(tabName) {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }

  document.querySelectorAll(".tab-screen").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".nav-btn").forEach(el => el.classList.remove("active"));

  document.getElementById(`screen-${tabName}`).classList.remove("hidden");
  event.target.classList.add("active");
}
