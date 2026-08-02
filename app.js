document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // Навигация
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            screens.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            
            const targetScreenId = btn.getAttribute('data-target');
            document.getElementById(targetScreenId).classList.add('active');
            
            if(tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        });
    });

    // --- ЛОГИКА ЭКРАНА: РЕЙСЫ ---
    const contractsList = document.getElementById('contracts-list');
    const mockTrips = [
        { id: 1, origin: 'Костанай', dest: 'Алматы', cargo: 'Зерно', weight: 22, distance: 1950, reward: 8450 },
        { id: 2, origin: 'Алматы', dest: 'Астана', cargo: 'Электроника', weight: 8, distance: 1200, reward: 6100 },
        { id: 3, origin: 'Рудный', dest: 'Караганда', cargo: 'Железная руда', weight: 35, distance: 1100, reward: 9200 },
        { id: 4, origin: 'Астана', dest: 'Павлодар', cargo: 'Опасные химикаты', weight: 15, distance: 450, reward: 5800 }
    ];

    function renderContracts() {
        contractsList.innerHTML = '';
        mockTrips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'contract-card glass-panel';
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

    // --- ЛОГИКА ЭКРАНА: ГАРАЖ ---
    const garageList = document.getElementById('garage-list');
    
    // Глубокая симуляция состояния транспорта из дизайн-документа
    const mockVehicles = [
        { 
            id: 101, 
            brand: 'Volvo', 
            model: 'F16 Cyber', 
            plate: '803MQA | 10', 
            mileage: 145020,
            status: 'IDLE',
            condition: { engine: 85, tires: 45, transmission: 92, oil: 60 }
        },
        { 
            id: 102, 
            brand: 'Scania', 
            model: 'R500 Neon', 
            plate: '215ABC | 01', 
            mileage: 89000,
            status: 'ON_TRIP',
            condition: { engine: 98, tires: 90, transmission: 95, oil: 85 }
        }
    ];

    function getConditionColor(val) {
        if (val > 70) return 'var(--color-green)';
        if (val > 30) return 'var(--accent-color)';
        return 'var(--color-red)';
    }

    function renderGarage() {
        garageList.innerHTML = '';
        mockVehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'truck-card glass-panel';
            
            // Динамический рендер физики износа
            card.innerHTML = `
                <div class="truck-header">
                    <div class="truck-model">${vehicle.brand} ${vehicle.model}</div>
                    <div class="truck-plate glow-text">${vehicle.plate}</div>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">
                    Пробег: ${new Intl.NumberFormat('ru-RU').format(vehicle.mileage)} км • Статус: ${vehicle.status === 'IDLE' ? 'Свободен' : 'В рейсе'}
                </div>
                
                <div class="condition-grid">
                    <div class="cond-item">
                        <div class="cond-label"><span>Двигатель</span><span>${vehicle.condition.engine}%</span></div>
                        <div class="cond-bar-bg"><div class="cond-bar-fill" style="width: ${vehicle.condition.engine}%; background: ${getConditionColor(vehicle.condition.engine)}"></div></div>
                    </div>
                    <div class="cond-item">
                        <div class="cond-label"><span>Шины</span><span>${vehicle.condition.tires}%</span></div>
                        <div class="cond-bar-bg"><div class="cond-bar-fill" style="width: ${vehicle.condition.tires}%; background: ${getConditionColor(vehicle.condition.tires)}"></div></div>
                    </div>
                    <div class="cond-item">
                        <div class="cond-label"><span>Трансмиссия</span><span>${vehicle.condition.transmission}%</span></div>
                        <div class="cond-bar-bg"><div class="cond-bar-fill" style="width: ${vehicle.condition.transmission}%; background: ${getConditionColor(vehicle.condition.transmission)}"></div></div>
                    </div>
                    <div class="cond-item">
                        <div class="cond-label"><span>Масло</span><span>${vehicle.condition.oil}%</span></div>
                        <div class="cond-bar-bg"><div class="cond-bar-fill" style="width: ${vehicle.condition.oil}%; background: ${getConditionColor(vehicle.condition.oil)}"></div></div>
                    </div>
                </div>
                
                <button class="btn-repair" onclick="repairVehicle(${vehicle.id})">🛠 Техническое обслуживание</button>
            `;
            garageList.appendChild(card);
        });
    }

    // Инициализация
    renderContracts();
    renderGarage();
});

window.acceptTrip = function(id) {
    const tg = window.Telegram.WebApp;
    if(tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    tg.showAlert(`Контракт #${id} подписан. Назначьте тягач в меню Гаража.`);
};

window.repairVehicle = function(id) {
    const tg = window.Telegram.WebApp;
    if(tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    tg.showConfirm(`Отправить транспорт #${id} на полное обслуживание? Стоимость: $2,500`);
};
