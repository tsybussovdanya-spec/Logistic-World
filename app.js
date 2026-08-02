class GameEngine {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        
        // Дефолтное состояние нового игрока
        this.defaultState = {
            balance: 50000,
            trucks: [],
            activeTrip: null,
            stats: {
                totalTrips: 0,
                totalDistance: 0
            }
        };

        this.marketTrips = [];
        this.catalog = [
            { id: 't1', brand: 'Start', model: 'Van 3.5t', price: 15000, capacity: 3.5, speed: 90 },
            { id: 't2', brand: 'City', model: 'Truck 10t', price: 45000, capacity: 10, speed: 85 },
            { id: 't3', brand: 'Volvo', model: 'F16 Cyber', price: 125000, capacity: 25, speed: 80 }
        ];
        
        this.cities = ['Костанай', 'Астана', 'Алматы', 'Караганда', 'Павлодар', 'Актобе', 'Шымкент'];
        this.cargos = ['Стройматериалы', 'Электроника', 'Медикаменты', 'Зерно', 'Запчасти', 'Продукты'];

        this.loadState();
        this.initNavigation();
        this.generateMarket();
        this.updateUI();
        
        // Игровой цикл для обновления прогресс-бара поездки каждую секунду
        setInterval(() => this.tick(), 1000);
    }

    // --- СИСТЕМА СОХРАНЕНИЙ ---
    loadState() {
        const saved = localStorage.getItem('logistic_world_save');
        this.state = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(this.defaultState));
    }

    saveState() {
        localStorage.setItem('logistic_world_save', JSON.stringify(this.state));
        this.updateUI();
    }

    hardReset() {
        if(confirm("Вы уверены? Весь прогресс будет удален!")) {
            localStorage.removeItem('logistic_world_save');
            location.reload();
        }
    }

    // --- НАВИГАЦИЯ ---
    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const screens = document.querySelectorAll('.screen');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                navButtons.forEach(b => b.classList.remove('active'));
                screens.forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                
                const target = btn.getAttribute('data-target');
                document.getElementById(target).classList.add('active');
                
                if (target === 'screen-garage') this.renderGarage('my-trucks');
                
                if (this.tg.HapticFeedback) this.tg.HapticFeedback.impactOccurred('light');
            });
        });
    }

    // --- ГЕНЕРАТОР РЕЙСОВ ---
    generateMarket() {
        this.marketTrips = [];
        for (let i = 0; i < 5; i++) {
            const origin = this.cities[Math.floor(Math.random() * this.cities.length)];
            let dest = this.cities[Math.floor(Math.random() * this.cities.length)];
            while (dest === origin) dest = this.cities[Math.floor(Math.random() * this.cities.length)];
            
            const distance = Math.floor(Math.random() * 1500) + 200; // от 200 до 1700 км
            const weight = Math.floor(Math.random() * 20) + 2; // от 2 до 22 тонн
            const cargo = this.cargos[Math.floor(Math.random() * this.cargos.length)];
            const reward = distance * 4 + weight * 50; // Формула прибыли
            const timeSeconds = Math.floor(distance / 80) * 60; // Игровые секунды (условно 1 час пути = 1 минута реального времени)

            this.marketTrips.push({
                id: Date.now() + i,
                origin, dest, distance, weight, cargo, reward, timeSeconds
            });
        }
        this.renderMarket();
        if (this.tg.HapticFeedback) this.tg.HapticFeedback.impactOccurred('medium');
    }

    renderMarket() {
        const list = document.getElementById('contracts-list');
        list.innerHTML = '';

        if (this.state.activeTrip) {
            list.innerHTML = `<div class="glass-panel" style="padding: 20px; text-align: center; border-radius: 16px; color: var(--color-warning);">
                У вас уже есть активный рейс. Завершите его, чтобы взять новый.
            </div>`;
            return;
        }

        const freeTrucks = this.state.trucks.filter(t => t.status === 'IDLE');

        this.marketTrips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'contract-card glass-panel';
            const reqTruck = freeTrucks.find(t => t.capacity >= trip.weight);
            
            card.innerHTML = `
                <div class="c-header">
                    <div class="c-route">${trip.origin} ➔ ${trip.dest}</div>
                    <div class="c-reward">+$${new Intl.NumberFormat('en-US').format(trip.reward)}</div>
                </div>
                <div class="c-details">
                    <span>📦 ${trip.cargo} (${trip.weight}т)</span>
                    <span>🛣️ ${trip.distance} км (Время: ${~~(trip.timeSeconds/60)}м)</span>
                </div>
                <button class="btn-action" 
                    ${!reqTruck ? 'disabled' : ''} 
                    onclick="gameEngine.acceptTrip(${trip.id})">
                    ${reqTruck ? 'Принять рейс' : 'Нет подходящей свободной фуры'}
                </button>
            `;
            list.appendChild(card);
        });
    }

    // --- ЛОГИКА ПОЕЗДКИ ---
    acceptTrip(tripId) {
        const trip = this.marketTrips.find(t => t.id === tripId);
        const truckIndex = this.state.trucks.findIndex(t => t.status === 'IDLE' && t.capacity >= trip.weight);
        
        if (truckIndex === -1) return;

        this.state.trucks[truckIndex].status = 'ON_TRIP';
        this.state.activeTrip = {
            ...trip,
            truckIndex: truckIndex,
            startedAt: Date.now(),
            finishAt: Date.now() + (trip.timeSeconds * 1000)
        };

        this.saveState();
        this.renderMarket();
        
        // Переключаем на главный экран
        document.querySelector('[data-target="screen-home"]').click();
        if (this.tg.HapticFeedback) this.tg.HapticFeedback.notificationOccurred('success');
    }

    tick() {
        if (!this.state.activeTrip) return;

        const now = Date.now();
        const trip = this.state.activeTrip;
        const totalDuration = trip.finishAt - trip.startedAt;
        const passed = now - trip.startedAt;
        let progress = (passed / totalDuration) * 100;

        if (progress >= 100) {
            this.finishTrip();
            return;
        }

        // Обновление UI прогресса на главной
        const pBar = document.getElementById('active-trip-progress');
        const pTime = document.getElementById('active-trip-time');
        if (pBar) pBar.style.width = `${progress}%`;
        if (pTime) {
            const leftSecs = Math.ceil((trip.finishAt - now) / 1000);
            const m = Math.floor(leftSecs / 60);
            const s = leftSecs % 60;
            pTime.innerText = `Осталось ${m}м ${s}с`;
        }
    }

    finishTrip() {
        const trip = this.state.activeTrip;
        
        // Начисляем награду
        this.state.balance += trip.reward;
        this.state.stats.totalTrips += 1;
        this.state.stats.totalDistance += trip.distance;
        
        // Освобождаем фуру
        this.state.trucks[trip.truckIndex].status = 'IDLE';
        this.state.trucks[trip.truckIndex].mileage += trip.distance;
        
        this.state.activeTrip = null;
        this.saveState();
        this.generateMarket();

        if (this.tg.HapticFeedback) this.tg.HapticFeedback.notificationOccurred('success');
        this.tg.showAlert(`Рейс успешно завершен!\nЗаработано: $${new Intl.NumberFormat('en-US').format(trip.reward)}`);
    }

    // --- ГАРАЖ И МАГАЗИН ---
    switchGarageTab(tab) {
        document.querySelectorAll('.garage-controls .btn-secondary').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderGarage(tab);
    }

    renderGarage(tab) {
        const content = document.getElementById('garage-content');
        content.innerHTML = '';

        if (tab === 'my-trucks') {
            if (this.state.trucks.length === 0) {
                content.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top: 20px;">Ваш автопарк пуст. Перейдите в Автосалон.</p>`;
                return;
            }
            this.state.trucks.forEach(t => {
                const card = document.createElement('div');
                card.className = 'truck-card glass-panel';
                card.innerHTML = `
                    <div class="truck-header">
                        <div class="truck-model">${t.brand} ${t.model}</div>
                        <div class="truck-plate glow-text">${t.plate}</div>
                    </div>
                    <div class="truck-stats">
                        <span>Грузоподъемность: ${t.capacity}т</span>
                        <span>Пробег: ${t.mileage} км</span>
                    </div>
                    <div style="color: ${t.status === 'IDLE' ? 'var(--color-green)' : 'var(--color-blue)'}; font-size: 13px; font-weight: bold;">
                        ${t.status === 'IDLE' ? '🟢 Свободен' : '🔵 В рейсе'}
                    </div>
                `;
                content.appendChild(card);
            });
        } else if (tab === 'shop') {
            this.catalog.forEach(item => {
                const card = document.createElement('div');
                card.className = 'truck-card glass-panel';
                card.innerHTML = `
                    <div class="truck-header">
                        <div class="truck-model">${item.brand} ${item.model}</div>
                        <div class="c-reward">$${new Intl.NumberFormat('en-US').format(item.price)}</div>
                    </div>
                    <div class="truck-stats">
                        <span>Вместимость: ${item.capacity}т</span>
                        <span>Скорость: ${item.speed} км/ч</span>
                    </div>
                    <button class="btn-action btn-buy" 
                        ${this.state.balance < item.price ? 'disabled' : ''} 
                        onclick="gameEngine.buyTruck('${item.id}')">
                        ${this.state.balance >= item.price ? 'Купить фуру' : 'Недостаточно средств'}
                    </button>
                `;
                content.appendChild(card);
            });
        }
    }

    buyTruck(catalogId) {
        const item = this.catalog.find(i => i.id === catalogId);
        if (this.state.balance >= item.price) {
            this.state.balance -= item.price;
            
            // Генерация случайного номера фуры (пасхалка к 803MQA)
            const randomNum = Math.floor(Math.random() * 900) + 100;
            const isKZ = Math.random() > 0.5;
            const plate = isKZ ? `${randomNum}MQA | 10` : `${randomNum}ABC | 01`;

            this.state.trucks.push({
                brand: item.brand,
                model: item.model,
                capacity: item.capacity,
                plate: plate,
                mileage: 0,
                status: 'IDLE'
            });
            this.saveState();
            this.renderGarage('shop');
            if (this.tg.HapticFeedback) this.tg.HapticFeedback.notificationOccurred('success');
            this.tg.showAlert(`Поздравляем с покупкой ${item.brand} ${item.model}!`);
        }
    }

    // --- ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
    updateUI() {
        document.getElementById('ui-balance').innerText = new Intl.NumberFormat('en-US').format(this.state.balance);
        
        // Статистика автопарка
        const total = this.state.trucks.length;
        const busy = this.state.trucks.filter(t => t.status === 'ON_TRIP').length;
        document.getElementById('stat-total-trucks').innerText = total;
        document.getElementById('stat-free-trucks').innerText = total - busy;
        document.getElementById('stat-busy-trucks').innerText = busy;

        // Статистика компании
        document.getElementById('comp-trips').innerText = this.state.stats.totalTrips;
        document.getElementById('comp-distance').innerText = `${this.state.stats.totalDistance} км`;

        // Отрисовка активного рейса на Главной
        const activeContainer = document.getElementById('active-trip-container');
        if (this.state.activeTrip) {
            const t = this.state.activeTrip;
            activeContainer.innerHTML = `
                <div class="trip-details">
                    <div class="city">${t.origin}</div>
                    <div class="arrow glow-text">➔</div>
                    <div class="city">${t.dest}</div>
                </div>
                <div class="cargo-info">${t.cargo} • ${t.weight}т</div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="active-trip-progress" style="width: 0%;"></div>
                </div>
                <div class="status-row">
                    <span class="status-text text-blue">В пути</span>
                    <span class="time-left" id="active-trip-time">Вычисление...</span>
                </div>
            `;
        } else {
            activeContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px 0;">Нет активных рейсов. Возьмите контракт на бирже.</p>`;
        }
    }
}

// Запуск движка после загрузки DOM
window.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});
