document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.expand(); // Разворачиваем на весь экран
    
    // Пытаемся взять данные пользователя из Telegram (если запущено в боте)
    const userNameElement = document.getElementById('user-name');
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userNameElement.textContent = `@${tg.initDataUnsafe.user.username}`;
    }

    // 2. Логика навигации (Переключение экранов)
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активность со всех кнопок и экранов
            navButtons.forEach(b => b.classList.remove('active'));
            screens.forEach(s => s.classList.remove('active'));

            // Добавляем активность нажатой кнопке
            btn.classList.add('active');

            // Показываем нужный экран
            const targetScreenId = btn.getAttribute('data-target');
            document.getElementById(targetScreenId).classList.add('active');

            // Опционально: Вибрация при нажатии (Haptic Feedback TWA)
            tg.HapticFeedback.impactOccurred('light');
        });
    });

    // 3. Генератор контрактов (Эмуляция получения данных с бэкенда)
    // Эта логика демонстрирует, как фронтенд будет отрисовывать рейсы
    const contractsList = document.getElementById('contracts-list');
    
    // Имитация базы данных из вашего документа
    const mockTrips = [
        { id: 1, origin: 'Костанай', dest: 'Алматы', cargo: 'Зерно', weight: 22, distance: 1950, reward: 8450 },
        { id: 2, origin: 'Алматы', dest: 'Астана', cargo: 'Электроника', weight: 8, distance: 1200, reward: 6100 },
        { id: 3, origin: 'Рудный', dest: 'Караганда', cargo: 'Железная руда', weight: 35, distance: 1100, reward: 9200 },
        { id: 4, origin: 'Астана', dest: 'Павлодар', cargo: 'Опасные химикаты', weight: 15, distance: 450, reward: 5800 }
    ];

    function renderContracts() {
        contractsList.innerHTML = ''; // Очищаем контейнер
        
        mockTrips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'contract-card glass-panel';
            
            // Форматирование цены (например, 8,450)
            const formattedReward = new Intl.NumberFormat('en-US').format(trip.reward);

            card.innerHTML = `
                <div class="c-header">
                    <div class="c-route">${trip.origin} ➔ ${trip.dest}</div>
                    <div class="c-reward">$${formattedReward}</div>
                </div>
                <div class="c-details">
                    <span>📦 ${trip.cargo} (${trip.weight}т)</span>
                    <span>🛣️ ${trip.distance} км</span>
                </div>
                <button class="btn-accept" onclick="acceptTrip(${trip.id})">Принять рейс</button>
            `;
            contractsList.appendChild(card);
        });
    }

    // Вызываем рендер при загрузке приложения
    renderContracts();
});

// Глобальная функция для кнопки "Принять рейс"
window.acceptTrip = function(id) {
    const tg = window.Telegram.WebApp;
    tg.HapticFeedback.notificationOccurred('success');
    tg.showAlert(`Рейс #${id} успешно принят! Перейдите в гараж, чтобы назначить транспорт.`);
    // В реальном проекте здесь будет fetch запрос к вашему Node.js серверу
};
