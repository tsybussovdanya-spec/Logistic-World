class GameEngine {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        
        // --- БАЗОВОЕ СОСТОЯНИЕ ---
        this.defaultState = {
            balance: 75000,
            trucks: [],
            activeTrip: null,
            inventory: [], // Предметы кастомизации (Модуль 10)
            stats: { totalTrips: 0, totalDistance: 0, xp: 0, level: 1 }
        };

        this.marketTrips = [];
        
        // --- КАТАЛОГ ТРАНСПОРТА ---
        this.catalog = [
            { id: 't1', brand: 'Start', model: 'Van 3.5t', price: 15000, capacity: 3.5, speed: 90, fuelTank: 80, fuelRate: 12 },
            { id: 't2', brand: 'City', model: 'Truck 10t', price: 45000, capacity: 10, speed: 85, fuelTank: 200, fuelRate: 18 },
            { id: 't3', brand: 'Volvo', model: 'F16 Cyber', price: 125000, capacity: 25, speed: 80, fuelTank: 500, fuelRate: 30 }
        ];

        // --- МОДУЛЬ 9: МАГАЗИН КОСМЕТИКИ (Без Pay-to-Win) ---
        this.shopCosmetics = [
            { id: 'neon_blue', name: 'Неоновая подсветка (Cyan)', type: 'neon', price: 10000, style: '#00f0ff' },
            { id: 'neon_purple', name: 'Неоновая подсветка (Cyber Purple)', type: 'neon', price: 15000, style: '#a200ff' },
            { id: 'wheels_gold', name: 'Премиум диски (Gold Edition)', type: 'wheels', price: 25000, style: 'gold' },
            { id: 'skin_carbon', name: 'Винил кузова "Carbon Fiber"', type: 'skin', price: 40000, style: 'carbon' }
        ];
        
        // --- МОДУЛЬ 3: ЛИЦЕНЗИИ ---
        this.licenses = [
            { id: 'lic_base', name: "Базовые грузы", reqLevel: 1 },
            { id: 'lic_fragile', name: "Хрупкие грузы", reqLevel: 3 },
            { id: 'lic_inter', name: "Международные рейсы", reqLevel: 5 },
            { id: 'lic_adr', name: "Опасные грузы (ADR)", reqLevel: 10 },
            { id: 'lic_heavy', name: "Негабаритные перевозки", reqLevel: 15 }
        ];

        // --- МОДУЛЬ 5: ГОРОДА И ИХ ЭКОНОМИКА ---
        this.cities = [
            { id: 1, name: 'Костанай', spec: 'AGRICULTURE' },
            { id: 2, name: 'Астана', spec: 'BUSINESS' },
            { id: 3, name: 'Алматы', spec: 'BUSINESS' },
            { id: 4, name: 'Караганда', spec: 'INDUSTRY' },
            { id: 5, name: 'Павлодар', spec: 'INDUSTRY' },
            { id: 6, name: 'Актобе', spec: 'INDUSTRY' },
            { id: 7, name: 'Шымкент', spec: 'AGRICULTURE' }
        ];

        // --- МОДУЛЬ 6: ГРУЗЫ ---
        this.cargos = [
            { id: 'c1', name: 'Зерно', type: 'AGRICULTURE', reqLicenseLevel: 1, baseMultiplier: 1.0, isFragile: false },
            { id: 'c2', name: 'Стройматериалы', type: 'INDUSTRY', reqLicenseLevel: 1, baseMultiplier: 1.1, isFragile: false },
            { id: 'c3', name: 'Медикаменты', type: 'BUSINESS', reqLicenseLevel: 3, baseMultiplier: 1.5, isFragile: true },
            { id: 'c4', name: 'Электроника', type: 'BUSINESS', reqLicenseLevel: 3, baseMultiplier: 1.8, isFragile: true },
            { id: 'c5', name: 'Химикаты', type: 'INDUSTRY', reqLicenseLevel: 10, baseMultiplier: 2.5, isFragile: false },
            { id: 'c6', name: 'Тракторы', type: 'AGRICULTURE', reqLicenseLevel: 15, baseMultiplier: 3.0, isFragile: false }
        ];

        this.loadState();
        this.initNavigation();
        this.generateMarket();
        this.updateUI();
        
        setInterval(() => this.tick(), 1000);
    }

    loadState() {
        const saved = localStorage.getItem('logistic_world_save');
        this.state = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(this.defaultState));
        
        if (!this.state.inventory) this.state.inventory = [];
        if (this.state.stats.level === undefined) {
            this.state.stats.xp = 0;
            this.state.stats.level = 1;
        }
        this.state.trucks.forEach(t => {
            if (!t.condition) t.condition = { engine: 100, tires: 100, oil: 100 };
            if (!t.fuel) {
                const catalogItem = this.catalog.find(c => c.model === t.model) || this.catalog[0];
                t.fuelTank = catalogItem.fuelTank;
                t.fuelRate = catalogItem.fuelRate;
                t.fuel = catalogItem.fuelTank;
            }
            if (!t.customization) t.customization = { neon: 'Стандарт', wheels: 'Стандарт', skin: 'Обычный' };
        });
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
                if (target === 'screen-company') this.renderLeaderboard(); // Модуль 8: Рейтинги
                if (this.tg.HapticFeedback) this.tg.HapticFeedback.impactOccurred('light');
            });
        });
    }

    // --- МОДУЛЬ 11: ЭКОНОМИКА И РЕЙСЫ ---
    generateMarket() {
        this.marketTrips = [];
        for (let i = 0; i < 6; i++) {
            const originCity = this.cities[Math.floor(Math.random() * this.cities.length)];
            let destCity = this.cities[Math.floor(Math.random() * this.cities.length)];
            while (destCity.id === originCity.id) destCity = this.cities[Math.floor(Math.random() * this.cities.length)];
            
            const cargo = this.cargos[Math.floor(Math.random() * this.cargos.length)];
            const distance = Math.floor(Math.random() * 1500) + 200; 
            const weight = Math.floor(Math.random() * 20) + 2; 
            
            let economyModifier = destCity.spec === cargo.type ? 1.3 : 1.0;
            let baseReward = (distance * 4) + (weight * 50);
            let finalReward = baseReward * cargo.baseMultiplier * economyModifier;

            const timeSeconds = Math.floor(distance / 80) * 60; 

            this.marketTrips.push({ 
                id: Date.now() + i, 
                origin: originCity.name, 
                dest: destCity.name, 
                distance, 
                weight, 
                cargo: cargo, 
                reward: Math.floor(finalReward), 
                timeSeconds,
                isHighDemand: economyModifier > 1.0
            });
        }
        this.renderMarket();
    }

    renderMarket() {
        const list = document.getElementById('contracts-list');
        list.innerHTML = '';

        if (this.state.activeTrip) {
            list.innerHTML = `<div class="glass-panel" style="padding: 20px; text-align: center; border-radius: 16px; color: var(--color-warning);">Завершите активный рейс, чтобы взять новый.</div>`;
            return;
        }

        const freeTrucks = this.state.trucks.filter(t => t.status === 'IDLE');

        this.marketTrips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'contract-card glass-panel';
            if (trip.isHighDemand) card.style.border = '1px solid var(--color-green)';
            
            const reqTruck = freeTrucks.find(t => t.capacity >= trip.weight);
            let btnText = 'Принять рейс';
            let isDisabled = false;
            let reqFuel = 0;

            if (this.state.stats.level < trip.cargo.reqLicenseLevel) {
                isDisabled = true;
                btnText = `Нужен уровень ${trip.cargo.reqLicenseLevel} (Лицензия)`;
            } else if (!reqTruck) {
                isDisabled = true;
                btnText = 'Нет фуры нужной грузоподъемности';
            } else {
                reqFuel = (trip.distance / 100) * reqTruck.fuelRate * (1 + (trip.weight * 0.02));
                
                if (reqTruck.condition.engine < 20 || reqTruck.condition.tires < 20 || reqTruck.condition.oil < 20) {
                    isDisabled = true;
                    btnText = 'Фура требует ремонта';
                } else if (reqTruck.fuel < reqFuel) {
                    isDisabled = true;
                    btnText = `Мало топлива (нужно ${Math.ceil(reqFuel)}л)`;
                }
            }
            
            const fragileIcon = trip.cargo.isFragile ? ' 🧊 (Хрупкий)' : '';
            const demandTag = trip.isHighDemand ? '<span style="color: var(--color-green); font-size: 10px; border: 1px solid var(--color-green); padding: 2px 4px; border-radius: 4px; margin-left: 5px;">🔥 Высокий спрос</span>' : '';

            card.innerHTML = `
                <div class="c-header">
                    <div class="c-route">${trip.origin} ➔ ${trip.dest} ${demandTag}</div>
                    <div class="c-reward">+$${new Intl.NumberFormat('en-US').format(trip.reward)}</div>
                </div>
                <div class="c-details">
                    <span>📦 ${trip.cargo.name}${fragileIcon} (${trip.weight}т)</span>
                    <span>🛣️ ${trip.distance} км (Время: ${~~(trip.timeSeconds/60)}м)</span>
                    <span style="color: var(--color-warning)">⛽ Расход: ~${reqFuel ? Math.ceil(reqFuel) : '-'} л</span>
                </div>
                <button class="btn-action" ${isDisabled ? 'disabled' : ''} onclick="gameEngine.acceptTrip(${trip.id})">
                    ${btnText}
                </button>
            `;
            list.appendChild(card);
        });
    }

    acceptTrip(tripId) {
        const trip = this.marketTrips.find(t => t.id === tripId);
        const truckIndex = this.state.trucks.findIndex(t => t.status === 'IDLE' && t.capacity >= trip.weight);
        
        if (truckIndex === -1) return;
        
        const truck = this.state.trucks[truckIndex];
        const reqFuel = (trip.distance / 100) * truck.fuelRate * (1 + (trip.weight * 0.02));

        truck.fuel -= reqFuel;
        truck.status = 'ON_TRIP';
        
        this.state.activeTrip = {
            ...trip,
            truckIndex: truckIndex,
            startedAt: Date.now(),
            finishAt: Date.now() + (trip.timeSeconds * 1000)
        };

        this.saveState();
        this.renderMarket();
        document.querySelector('[data-target="screen-home"]').click();
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

        const pBar = document.getElementById('active-trip-progress');
        const pTime = document.getElementById('active-trip-time');
        if (pBar) pBar.style.width = `${progress}%`;
        if (pTime) {
            const leftSecs = Math.ceil((trip.finishAt - now) / 1000);
            pTime.innerText = `Осталось ${~~(leftSecs / 60)}м ${leftSecs % 60}с`;
        }
    }

    finishTrip() {
        const trip = this.state.activeTrip;
        const truck = this.state.trucks[trip.truckIndex];
        
        this.state.balance += trip.reward;
        this.state.stats.totalTrips += 1;
        this.state.stats.totalDistance += trip.distance;
        
        const wearMultiplier = trip.cargo.isFragile ? 1.5 : 1.0;
        truck.condition.engine = Math.max(0, truck.condition.engine - ((trip.distance / 120) * wearMultiplier));
        truck.condition.tires = Math.max(0, truck.condition.tires - ((trip.distance / 80) * wearMultiplier));
        truck.condition.oil = Math.max(0, truck.condition.oil - ((trip.distance / 60) * wearMultiplier));
        
        truck.status = 'IDLE';
        truck.mileage += trip.distance;
        this.state.activeTrip = null;

        this.state.stats.xp += trip.distance;
        this.checkLevelUp();

        this.saveState();
        this.generateMarket();
        this.tg.showAlert(`Рейс завершен!\nЗаработано: $${new Intl.NumberFormat('en-US').format(trip.reward)}`);
    }

    checkLevelUp() {
        const nextLevelXp = this.state.stats.level * 1000;
        if (this.state.stats.xp >= nextLevelXp) {
            this.state.stats.level += 1;
            this.state.stats.xp -= nextLevelXp;
            this.tg.showAlert(`🎉 Поздравляем! Ваш уровень компании повышен до ${this.state.stats.level}!`);
        }
    }

    // --- МОДУЛЬ 2 и МОДУЛЬ 9: ГАРАЖ И МАГАЗИН КАСТОМИЗАЦИИ ---
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
                content.innerHTML = `<p style="text-align:center; color:var(--text-muted);">Автопарк пуст. Перейдите в Автосалон.</p>`;
                return;
            }
            this.state.trucks.forEach((t, index) => {
                const card = document.createElement('div');
                card.className = 'truck-card glass-panel';
                
                const fuelPercent = (t.fuel / t.fuelTank) * 100;
                const engColor = t.condition.engine > 30 ? 'var(--color-green)' : 'var(--color-red)';
                const tiresColor = t.condition.tires > 30 ? 'var(--color-green)' : 'var(--color-red)';
                
                card.innerHTML = `
                    <div class="truck-header">
                        <div class="truck-model">${t.brand} ${t.model}</div>
                        <div class="truck-plate glow-text">${t.plate}</div>
                    </div>
                    <div style="font-size: 11px; margin-bottom: 10px; color: ${t.status === 'IDLE' ? 'var(--color-green)' : 'var(--color-blue)'};">
                        ${t.status === 'IDLE' ? '🟢 Свободен' : '🔵 В рейсе'} • Пробег: ${new Intl.NumberFormat('ru-RU').format(t.mileage)} км
                    </div>
                    <div style="font-size: 11px; color: var(--accent-color); margin-bottom: 10px;">
                        ✨ Тюнинг: Неон [${t.customization.neon}] | Диски [${t.customization.wheels}]
                    </div>
                    
                    <div class="detail-row"><span>⛽ Топливо (${Math.ceil(t.fuel)}/${t.fuelTank} л)</span></div>
                    <div class="bar-container"><div class="bar-fill" style="width: ${fuelPercent}%; background: var(--color-warning)"></div></div>
                    
                    <div class="detail-row"><span>Двигатель (${Math.ceil(t.condition.engine)}%)</span></div>
                    <div class="bar-container"><div class="bar-fill" style="width: ${t.condition.engine}%; background: ${engColor}"></div></div>
                    
                    <div class="detail-row"><span>Покрышки (${Math.ceil(t.condition.tires)}%)</span></div>
                    <div class="bar-container"><div class="bar-fill" style="width: ${t.condition.tires}%; background: ${tiresColor}"></div></div>
                    
                    <div class="btn-group">
                        <button class="btn-sm btn-refuel" onclick="gameEngine.refuelTruck(${index})" ${t.status === 'ON_TRIP' ? 'disabled' : ''}>Заправить</button>
                        <button class="btn-sm btn-repair" onclick="gameEngine.repairTruck(${index})" ${t.status === 'ON_TRIP' ? 'disabled' : ''}>Ремонт (ТО)</button>
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
                    <div class="truck-stats" style="flex-direction: column; gap: 5px;">
                        <span>Вместимость: ${item.capacity}т</span>
                        <span>Бак: ${item.fuelTank} л (Расход ~${item.fuelRate}л/100км)</span>
                    </div>
                    <button class="btn-action btn-buy" ${this.state.balance < item.price ? 'disabled' : ''} onclick="gameEngine.buyTruck('${item.id}')">
                        ${this.state.balance >= item.price ? 'Купить фуру' : 'Недостаточно средств'}
                    </button>
                `;
                content.appendChild(card);
            });
        } else if (tab === 'cosmetics') {
            // Магазин косметики (Модуль 9)
            content.innerHTML = `<h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 10px;">Магазин стиля (Без P2W)</h3>`;
            this.shopCosmetics.forEach(item => {
                const isOwned = this.state.inventory.includes(item.id);
                const card = document.createElement('div');
                card.className = 'truck-card glass-panel';
                card.innerHTML = `
                    <div class="truck-header">
                        <div class="truck-model">${item.name}</div>
                        <div class="c-reward">$${new Intl.NumberFormat('en-US').format(item.price)}</div>
                    </div>
                    <button class="btn-action btn-buy" ${isOwned ? 'disabled' : (this.state.balance < item.price ? 'disabled' : '')} onclick="gameEngine.buyCosmetic('${item.id}')">
                        ${isOwned ? 'Куплено' : (this.state.balance >= item.price ? 'Приобрести' : 'Недостаточно средств')}
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
            const randomNum = Math.floor(Math.random() * 900) + 100;
            const plate = `${randomNum}MQA | 10`;

            this.state.trucks.push({
                brand: item.brand, model: item.model, capacity: item.capacity, plate: plate, mileage: 0, status: 'IDLE',
                fuelTank: item.fuelTank, fuelRate: item.fuelRate, fuel: item.fuelTank,
                condition: { engine: 100, tires: 100, oil: 100 },
                customization: { neon: 'Стандарт', wheels: 'Стандарт', skin: 'Обычный' }
            });
            this.saveState();
            this.renderGarage('shop');
            this.tg.showAlert(`Поздравляем с покупкой ${item.brand} ${item.model}!`);
        }
    }

    buyCosmetic(itemId) {
        const item = this.shopCosmetics.find(i => i.id === itemId);
        if (this.state.balance >= item.price && !this.state.inventory.includes(itemId)) {
            this.state.balance -= item.price;
            this.state.inventory.push(itemId);
            
            // Автоматически применяем на первую машину для примера
            if (this.state.trucks.length > 0) {
                if (item.type === 'neon') this.state.trucks[0].customization.neon = item.name;
                if (item.type === 'wheels') this.state.trucks[0].customization.wheels = item.name;
            }

            this.saveState();
            this.renderGarage('cosmetics');
            this.tg.showAlert(`Элемент стиля "${item.name}" успешно приобретен!`);
        }
    }

    refuelTruck(index) {
        const truck = this.state.trucks[index];
        const needed = truck.fuelTank - truck.fuel;
        if (needed < 1) return this.tg.showAlert("Бак уже полон.");
        const cost = Math.ceil(needed * 1.5); 
        if (this.state.balance >= cost) {
            this.state.balance -= cost;
            truck.fuel = truck.fuelTank;
            this.saveState();
            this.renderGarage('my-trucks');
        } else {
            this.tg.showAlert(`Недостаточно средств. Нужно $${cost}`);
        }
    }

    repairTruck(index) {
        const truck = this.state.trucks[index];
        const cost = 2500; 
        if (this.state.balance >= cost) {
            this.state.balance -= cost;
            truck.condition = { engine: 100, tires: 100, oil: 100 };
            this.saveState();
            this.renderGarage('my-trucks');
        } else {
            this.tg.showAlert(`Недостаточно средств на ТО. Стоимость $${cost}`);
        }
    }

    // --- МОДУЛЬ 8: ТАБЛИЦА РЕЙТИНГОВ ---
    renderLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        // Имитация мировой таблицы лидеров ( MMO-песочница )
        const leaders = [
            { rank: 1, name: 'ApexLogistics', value: '$45,200,000', isPlayer: false },
            { rank: 2, name: 'TransKazakhstan', value: '$38,900,000', isPlayer: false },
            { rank: 3, name: '@TSYBUSS (Вы)', value: `$${new Intl.NumberFormat('en-US').format(this.state.balance * 15)}`, isPlayer: true },
            { rank: 4, name: 'SilkRoad Express', value: '$19,400,000', isPlayer: false },
            { rank: 5, name: 'Eurasia Cargo', value: '$12,100,000', isPlayer: false }
        ];

        container.innerHTML = leaders.map(l => `
            <div class="finance-row" style="background: ${l.isPlayer ? 'rgba(0, 240, 255, 0.1)' : 'transparent'}; padding: 8px; border-radius: 8px;">
                <span>#${l.rank} ${l.name}</span>
                <span class="text-green" style="font-weight: bold;">${l.value}</span>
            </div>
        `).join('');
    }

    updateUI() {
        document.getElementById('ui-balance').innerText = new Intl.NumberFormat('en-US').format(this.state.balance);
        
        const total = this.state.trucks.length;
        const busy = this.state.trucks.filter(t => t.status === 'ON_TRIP').length;
        document.getElementById('stat-total-trucks').innerText = total;
        document.getElementById('stat-free-trucks').innerText = total - busy;
        document.getElementById('stat-busy-trucks').innerText = busy;

        document.getElementById('comp-trips').innerText = this.state.stats.totalTrips;
        document.getElementById('comp-distance').innerText = `${this.state.stats.totalDistance} км`;
        
        document.getElementById('ui-level').innerText = this.state.stats.level;
        const nextLevelXp = this.state.stats.level * 1000;
        document.getElementById('ui-xp-text').innerText = `${Math.floor(this.state.stats.xp)} / ${nextLevelXp} XP`;
        document.getElementById('ui-xp-bar').style.width = `${(this.state.stats.xp / nextLevelXp) * 100}%`;

        const licensesList = document.getElementById('company-licenses');
        licensesList.innerHTML = '';
        this.licenses.forEach(lic => {
            const isUnlocked = this.state.stats.level >= lic.reqLevel;
            licensesList.innerHTML += `
                <div class="license-item ${isUnlocked ? 'active' : 'locked'}">
                    ${isUnlocked ? '✅' : '🔒'} ${lic.name} ${isUnlocked ? '' : `(С ур. ${lic.reqLevel})`}
                </div>
            `;
        });

        const activeContainer = document.getElementById('active-trip-container');
        if (this.state.activeTrip) {
            const t = this.state.activeTrip;
            activeContainer.innerHTML = `
                <div class="trip-details">
                    <div class="city">${t.origin}</div>
                    <div class="arrow glow-text">➔</div>
                    <div class="city">${t.dest}</div>
                </div>
                <div class="cargo-info">${t.cargo.name} • ${t.weight}т</div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="active-trip-progress" style="width: 0%;"></div>
                </div>
                <div class="status-row">
                    <span class="status-text text-blue">В пути</span>
                    <span class="time-left" id="active-trip-time">Вычисление...</span>
                </div>
            `;
        } else {
            activeContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 20px 0;">Нет активных рейсов.</p>`;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});
