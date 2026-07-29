// ============================================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP И БАЗЫ ДАННЫХ
// ============================================================================
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, 
    DAILY_BONUS_COINS: 15000,
    DAILY_BONUS_FUEL: 200,
    BONUS_COOLDOWN_MS: 86400000, 
    TIPS: [
        "Дождь увеличивает износ шин и тормозов.",
        "Следите за коробкой передач: 0% износа блокирует рейсы!",
        "Ремонтируйте узлы вовремя, чтобы избежать поломки в пути."
    ]
};

const TRUCK_SHOP = [
    { id: 't1', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, rarity: 'common', price: 75000, image: 'https://i.ibb.co.com/p6XDM2Rx/44-F0-E8-CE-1-CFA-47-E8-AAB4-8-A3-A6-B1-D0-FFD.png' },
    { id: 't2', name: 'ЗАЗ Карго', capacity: 2800, fuel_use: 30, rarity: 'common', price: 140000, image: 'https://i.ibb.co.com/v63jh8Sw/61-FB1-D82-33-D6-4928-B3-A6-2-B5-D57-A338-FB.png' },
    { id: 't3', name: 'Volvo FH Neo', capacity: 5000, fuel_use: 45, rarity: 'rare', price: 250000, image: 'https://i.ibb.co.com/hRVfRq6G/271-F0-AAF-8480-41-D8-BEE3-8-EC01-B5-BE97-E.png' },
    { id: 't4', name: 'Scania R730', capacity: 8500, fuel_use: 60, rarity: 'rare', price: 420000, image: 'https://i.ibb.co.com/C5TVRDX2/60-A0-E34-A-CE54-4243-ADBE-96-F5-A9-F96-EAF.png' },
    { id: 't5', name: 'Cyber Titan', capacity: 12000, fuel_use: 80, rarity: 'epic', price: 600000, image: 'https://i.ibb.co.com/ccjV64tt/613-B8045-D8-D0-46-B4-B362-E11-F940-E6-CE5.png' },
    { id: 't6', name: 'Peterbilt 389 Custom', capacity: 17000, fuel_use: 100, rarity: 'epic', price: 950000, image: 'https://i.ibb.co.com/5x580wTg/8-AE858-A3-23-BD-477-B-A735-43-A2-C75-B7-B8-E.png' },
    { id: 't7', name: 'Quantum Leviathan', capacity: 25000, fuel_use: 120, rarity: 'legendary', price: 1500000, image: 'https://i.ibb.co.com/6cFXLhYF/B419-FC20-BE70-4-BD0-A6-FD-2-B72-D347-C0-EB.png' },
    { id: 't8', name: 'Titanium Goliath X', capacity: 40000, fuel_use: 180, rarity: 'legendary', price: 2800000, image: 'https://i.ibb.co.com/RksPdPSb/DF802-CE4-829-F-4-A68-9068-717-B406-D42-AE.png' }
];

const LICENSES_SHOP = [
    { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1, col1: 'Риск: 0%', col2: 'Штраф: 0', col3: 'Бонус: 0%', col4: 'Скрытность: 100%', col5: 'Доступ: База' },
    { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5, col1: 'Риск: 5%', col2: 'Штраф: 10k', col3: 'Бонус: +10%', col4: 'Скрытность: 80%', col5: 'Доступ: Химия' },
    { id: 'oversized', name: 'Негабарит', type: 'legal', cost: 150000, reqLvl: 10, col1: 'Риск: 2%', col2: 'Штраф: 25k', col3: 'Бонус: +25%', col4: 'Скрытность: 90%', col5: 'Доступ: Техника' },
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12, col1: 'Риск: 35%', col2: 'Штраф: 120k', col3: 'Бонус: +60%', col4: 'Скрытность: 40%', col5: 'Доступ: Теневой' },
    { id: 'falsified_docs', name: 'Липовые допуски', type: 'illegal', cost: 600000, reqLvl: 15, col1: 'Риск: 55%', col2: 'Штраф: 250k', col3: 'Бонус: +120%', col4: 'Скрытность: 20%', col5: 'Доступ: Синдикат' },
    { id: 'black_market', name: 'Черный коридор', type: 'illegal', cost: 1200000, reqLvl: 20, col1: 'Риск: 80%', col2: 'Штраф: 600k', col3: 'Бонус: +250%', col4: 'Скрытность: 10%', col5: 'Доступ: Элитный черный' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

// ============================================================================
// 🏆 СИСТЕМА ЗВАНИЙ (REPUTATION)
// ============================================================================
const ReputationSys = {
    getTitle(level) {
        if (level < 5) return 'Частник-одиночка';
        if (level < 10) return 'Вольный водитель';
        if (level < 15) return 'Опытный дальнобойщик';
        if (level < 20) return 'Владелец автопарка';
        if (level < 30) return 'Босс логистики';
        if (level < 40) return 'Теневой барон';
        if (level < 50) return 'Глобальный оператор';
        return 'Транспортный магнат';
    }
};

// ============================================================================
// 🎵 АУДИО СИСТЕМА И ВИБРАЦИЯ
// ============================================================================
const AudioSys = {
    musicOn: false,
    sfxOn: true,
    bgm: document.getElementById('bg-music'),
    
    toggleMusic() {
        this.musicOn = !this.musicOn;
        const btn = document.getElementById('btn-music');
        
        if (this.musicOn) {
            if (this.bgm) {
                this.bgm.volume = 0.5;
                this.bgm.play().then(() => {
                    if (btn) btn.innerText = "Включено 🔊";
                }).catch(e => {
                    console.log("Браузер заблокировал автовоспроизведение музыки:", e);
                    this.musicOn = false;
                    if (btn) btn.innerText = "Выключено 🔇";
                    UI.showToast("Кликните еще раз для включения музыки", "info");
                });
            }
        } else {
            if (this.bgm) this.bgm.pause();
            if (btn) btn.innerText = "Выключено 🔇";
        }
        this.playVibrate('click');
    },

    toggleSFX() {
        this.sfxOn = !this.sfxOn;
        const btn = document.getElementById('btn-sfx');
        if (btn) btn.innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇";
        this.playVibrate('click');
    },

    playVibrate(type = 'success') {
        if (!this.sfxOn || !tg.HapticFeedback) return;
        if(type === 'success') tg.HapticFeedback.notificationOccurred('success');
        if(type === 'error') tg.HapticFeedback.notificationOccurred('error');
        if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium');
    }
};

// ============================================================================
// 🛡️ АДМИН СИСТЕМА
// ============================================================================
const AdminSys = {
    isAdmin() {
        return AppState.player.name === 'TSYBUSS' || AppState.player.is_admin === true;
    },
    checkAdminAccess() {
        const nameInput = AppState.player.name;
        const adminCard = document.getElementById('admin-panel-card');
        if (!adminCard) return;

        if (nameInput === 'TSYBUSS' || nameInput === 'AdminPass2026') {
            adminCard.style.display = 'block';
            if (nameInput === 'AdminPass2026') {
                AppState.player.name = 'TSYBUSS';
            }
        } else {
            adminCard.style.display = 'none';
        }
    },
    addMoney(amount) {
        if (!this.isAdmin()) return;
        AppState.player.money += amount;
        DB.syncPlayer();
        UI.showToast(`[ADMIN] Зачислено ${amount.toLocaleString()} 🪙`, 'success');
        UI.renderAll();
    },
    addFuel(amount) {
        if (!this.isAdmin()) return;
        AppState.player.fuel_stock += amount;
        DB.syncPlayer();
        UI.showToast(`[ADMIN] Зачислено ${amount}л топлива`, 'success');
        UI.renderAll();
    },
    setLevel(lvl) {
        if (!this.isAdmin()) return;
        AppState.player.level = lvl;
        AppState.player.pass_level = Math.max(AppState.player.pass_level, lvl);
        DB.syncPlayer();
        UI.showToast(`[ADMIN] Установлен уровень ${lvl}`, 'success');
        UI.renderAll();
    },
    unlockAll() {
        if (!this.isAdmin()) return;
        AppState.player.licenses = LICENSES_SHOP.map(l => l.id);
        TRUCK_SHOP.forEach(shopT => {
            if (!AppState.trucks.some(t => t.name === shopT.name)) {
                AppState.trucks.push({
                    id: 'admin_' + Math.random(),
                    player_id: AppState.player.id,
                    name: shopT.name,
                    capacity: shopT.capacity,
                    fuel_use: shopT.fuel_use,
                    rarity: shopT.rarity,
                    engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100,
                    engineLvlUpgrade: 0, tiresLvlUpgrade: 0, gearLvlUpgrade: 0, brakesLvlUpgrade: 0
                });
            }
        });
        DB.syncPlayer();
        UI.showToast('[ADMIN] Все лицензии и фуры разблокированы!', 'success');
        UI.renderAll();
    }
};

// ============================================================================
// 🌍 ПОГОДА И ГЛОБАЛЬНЫЕ ИВЕНТЫ
// ============================================================================
const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    marketEvent: { name: 'Стабильность', effect: 'none', multiplier: 1.0 },
    
    generateWeather() {
        const types = [
            { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
            { name: '🔥 Жара', timeMod: 1.0, fuelMod: 1.2, wearMod: 1.2 },
            { name: '🌨 Снег', timeMod: 1.3, fuelMod: 1.1, wearMod: 1.4 },
            { name: '🌧 Ливень', timeMod: 1.1, fuelMod: 1.0, wearMod: 1.5 }
        ];
        this.weather = types[Math.floor(Math.random() * types.length)];
        UI.safeUpdate('weather-info', this.weather.name);
    },

    generateMarketEvent() {
        const events = [
            { name: '⚖️ Стабильность', effect: 'none', multiplier: 1.0, desc: "Рынок стабилен, цены в норме." },
            { name: '📈 Строительный бум', effect: 'Стройматериалы', multiplier: 1.5, desc: "Спрос на стройматериалы вырос! Награды увеличены на 50%." },
            { name: '⚡ Кризис микрочипов', effect: 'Электроника', multiplier: 1.8, desc: "Дефицит электроники! Платят почти вдвое больше." },
            { name: '🛢 Топливный кризис', effect: 'fuel_price', multiplier: 2.0, desc: "Цены на топливо взлетели! Экономьте бензин." }
        ];
        
        this.marketEvent = events[Math.floor(Math.random() * events.length)];
        
        const banner = document.getElementById('global-event-banner');
        const title = document.getElementById('global-event-title');
        const desc = document.getElementById('global-event-desc');
        
        if (banner && desc && title) {
            if (this.marketEvent.effect === 'none') {
                banner.style.display = 'none';
            } else {
                banner.style.display = 'block';
                title.innerText = this.marketEvent.name;
                desc.innerText = this.marketEvent.desc;
                AIDispatcher.showPopup(`Внимание: ${this.marketEvent.name}! Проверьте Центр Логистики.`);
            }
        }
        
        if (this.marketEvent.effect === 'fuel_price') {
            AppState.player.fuel_price = Math.floor(AppState.player.fuel_price * this.marketEvent.multiplier);
            UI.renderAll();
        }
    }
};

// ============================================================================
// ⚡ СИСТЕМА СЛУЧАЙНЫХ СОБЫТИЙ В ПУТИ
// ============================================================================
const EventSys = {
    activeEvent: null,
    timerInterval: null,

    checkEventsForTrip(trip) {
        if (this.activeEvent) return;
        
        let luckMod = 1.0;
        if (AppState.player.skills && AppState.player.skills.luck) {
            luckMod -= AppState.player.skills.luck * 0.1;
        }
        if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) {
            luckMod -= (AppState.syndicateData.techs.security || 0) * 0.05;
        }

        const chance = Math.random() / Math.max(0.2, luckMod);
        
        if (chance < 0.12) {
            this.triggerEvent(trip, 'customs');
        } else if (chance < 0.25) {
            this.triggerEvent(trip, 'breakdown');
        } else if (chance < 0.38) {
            this.triggerEvent(trip, 'weather_traffic');
        } else if (chance < 0.45) {
            this.triggerEvent(trip, 'accident');
        }
    },

    triggerEvent(trip, type) {
        const tripTruck = AppState.trucks.find(t => String(t.id) === String(trip.truck_id));
        const truckName = tripTruck ? tripTruck.name : 'Тягач';

        let eventData = {
            tripId: trip.id,
            type: type,
            timeLeft: 30,
            title: '',
            desc: '',
            choices: []
        };

        switch(type) {
            case 'breakdown':
                eventData.title = `🛠 Поломка в пути: ${truckName}`;
                eventData.desc = `Шеф! Узел машины не выдержал нагрузки. Движение остановлено, рейс заморожен!`;
                eventData.choices = [
                    { id: 1, text: 'Мобильный ремкомплект (Бесплатно)', action: () => EventSys.resolveEvent('breakdown_kit') },
                    { id: 2, text: 'Вызвать эвакуатор и сервис (-15,000 🪙)', action: () => EventSys.resolveEvent('breakdown_tow') },
                    { id: 3, text: 'Бросить машину / ждать помощи', action: () => EventSys.resolveEvent('breakdown_abandon') }
                ];
                break;

            case 'weather_traffic':
                eventData.title = `🌧 Дорожный затор / Шторм`;
                eventData.desc = `Колонна встала из-за непогоды или пробки. Скорость упала к нулю.`;
                eventData.choices = [
                    { id: 1, text: 'Объехать по платной дороге (-5,000 🪙)', action: () => EventSys.resolveEvent('traffic_toll') },
                    { id: 2, text: 'Переждать бурю (Потеря времени)', action: () => EventSys.resolveEvent('traffic_wait') },
                    { id: 3, text: 'Рискнуть и гнать сквозь бурю', action: () => EventSys.resolveEvent('traffic_rush') }
                ];
                break;

            case 'accident':
                eventData.title = `💥 Дорожно-транспортное происшествие!`;
                eventData.desc = `ЧП на дороге! Машина попала в жесткую аварию, часть груза повреждена.`;
                eventData.choices = [
                    { id: 1, text: 'Использовать страховку (Покрытие 80% ущерба)', action: () => EventSys.resolveEvent('accident_insured') },
                    { id: 2, text: 'Обойтись своими силами (-50,000 🪙 штраф)', action: () => EventSys.resolveEvent('accident_raw') }
                ];
                break;

            case 'customs':
                eventData.title = `🚨 Таможенный и полицейский контроль`;
                eventData.desc = `Шеф, нас тормозит патруль на посту! Требуют полный досмотр груза.`;
                eventData.choices = [
                    { id: 1, text: 'Дать взятку инспектору (-25,000 🪙)', action: () => EventSys.resolveEvent('customs_bribe') },
                    { id: 2, text: 'Попытаться прорваться (Риск ареста)', action: () => EventSys.resolveEvent('customs_break') },
                    { id: 3, text: 'Сотрудничать / Пройти досмотр', action: () => EventSys.resolveEvent('customs_legal') }
                ];
                break;
        }

        this.activeEvent = eventData;
        this.renderEventModal();
        this.startEventTimer();
        AIDispatcher.showPopup(`⚠️ Внимание! Форс-мажор в активном рейсе!`);
    },

    startEventTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (!this.activeEvent) {
                clearInterval(this.timerInterval);
                return;
            }

            this.activeEvent.timeLeft--;
            UI.safeUpdate('event-timer-badge', `⏳ ${this.activeEvent.timeLeft}с`);

            if (this.activeEvent.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeout();
            }
        }, 1000);
    },

    handleTimeout() {
        UI.showToast('Время истекло! Сработал худший сценарий по умолчанию.', 'error');
        this.closeEventModal();
        AppState.player.money = Math.max(0, AppState.player.money - 10000);
        DB.syncPlayer();
        UI.renderAll();
    },

    resolveEvent(actionId) {
        if (this.timerInterval) clearInterval(this.timerInterval);

        switch(actionId) {
            case 'breakdown_kit':
                UI.showToast('Ремонт на месте завершен успешно!', 'success');
                break;
            case 'breakdown_tow':
                if (AppState.player.money < 15000) {
                    UI.showToast('Недостаточно средств на эвакуатор! Штраф.', 'error');
                } else {
                    AppState.player.money -= 15000;
                    UI.showToast('Эвакуатор доставил тягач в сервис.', 'info');
                }
                break;
            case 'breakdown_abandon':
                UI.showToast('Машина брошена на трассе, задержка рейса увеличена.', 'error');
                AppState.player.total_profit = Math.max(0, AppState.player.total_profit - 5000);
                break;
            case 'traffic_toll':
                if (AppState.player.money >= 5000) {
                    AppState.player.money -= 5000;
                    UI.showToast('Платная дорога успешно пройдена!', 'success');
                } else {
                    UI.showToast('Нет денег на платку! Пришлось стоять в пробке.', 'error');
                }
                break;
            case 'traffic_wait':
                UI.showToast('Буря переждана, потеряно драгоценное время.', 'info');
                break;
            case 'traffic_rush':
                if (Math.random() > 0.5) {
                    UI.showToast('Успешно проскочили сквозь бурю на адреналине!', 'success');
                } else {
                    UI.showToast('Авария при проезде шторма! Поломка узлов.', 'error');
                }
                break;
            case 'accident_insured':
                UI.showToast('Страховая компания покрыла 80% убытков.', 'success');
                break;
            case 'accident_raw':
                AppState.player.money = Math.max(0, AppState.player.money - 50000);
                UI.showToast('Огромный штраф за ДТП и ремонт выплачен!', 'error');
                break;
            case 'customs_bribe':
                if (AppState.player.money >= 25000) {
                    AppState.player.money -= 25000;
                    UI.showToast('Инспектор взял взятку и закрыл глаза.', 'success');
                } else {
                    UI.showToast('Не хватило денег на взятку! Груз конфискован.', 'error');
                }
                break;
            case 'customs_break':
                if (Math.random() > 0.6) {
                    UI.showToast('Удачный прорыв блокады! Пост остался позади.', 'success');
                } else {
                    UI.showToast('Погоня! Груз арестован, штраф списан.', 'error');
                    AppState.player.money = Math.max(0, AppState.player.money - 80000);
                }
                break;
            case 'customs_legal':
                UI.showToast('Досмотр пройден штатно. Чистая репутация.', 'success');
                break;
        }

        this.closeEventModal();
        DB.syncPlayer();
        UI.renderAll();
    },

    renderEventModal() {
        let existingModal = document.getElementById('event-modal');
        if (existingModal) existingModal.remove();

        const ev = this.activeEvent;
        if (!ev) return;

        const modalHtml = `
        <div id="event-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(8px);">
            <div class="card" style="width: 100%; max-width: 400px; border-color: var(--accent-pink); box-shadow: 0 0 30px rgba(236, 72, 153, 0.3);">
                <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--accent-pink);">${ev.title}</span>
                    <span id="event-timer-badge" style="background: rgba(236,72,153,0.2); padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">⏳ ${ev.timeLeft}с</span>
                </div>
                <p style="font-size: 13px; color: var(--hint-color); margin: 12px 0 16px 0; line-height: 1.4;">${ev.desc}</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${ev.choices.map((choice, idx) => `
                        <button type="button" class="btn btn-outline" style="text-align: left; font-size: 12px; padding: 10px; border-color: var(--accent-blue); color: #fff;" onclick="EventSys.resolveEvent('${['breakdown_kit','breakdown_tow','breakdown_abandon','traffic_toll','traffic_wait','traffic_rush','accident_insured','accident_raw','customs_bribe','customs_break','customs_legal'][idx]}')">
                            👉 ${choice.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    closeEventModal() {
        const modal = document.getElementById('event-modal');
        if (modal) modal.remove();
        this.activeEvent = null;
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};

// ============================================================================
// ⚙️ ГЛОБАЛЬНОЕ СОСТОЯНИЕ (STATE)
// ============================================================================
const AppState = {
    player: {
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '',
        money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0,
        total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0,
        licenses: ['basic'], pass_level: 1, pass_claimed: [],
        quests: [
            { id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false },
            { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false },
            { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }
        ],
        skills: { eco: 0, luck: 0, mechanic: 0 },
        total_fuel_burned: 0,
        playtime_minutes: 0,
        reg_date: new Date().toISOString()
    },
    syndicateData: {
        name: null,
        level: 1,
        treasuryFuel: 0,
        techs: { security: 0, logistics: 0, mechanic: 0 },
        feed: ["Системный лог инициализирован..."]
    },
    trucks: [],
    activeTrips: [],
    leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/nxzLBSw/0-B0-F3-ED8-68-F9-4-D11-9455-63-CEE59-DEC70.png', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Обычный: Продукты питания', name: 'Продукты питания', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/YBMmXNHj/74065-E6-B-D63-E-446-D-A8-E1-95492-C930-D70.png', reward: 8900, fuel: 100, duration: 22, reqLvl: 2, reqLic: 'basic' },
        { id: 3, title: 'Обычный: Стройматериалы', name: 'Стройматериалы', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/Q7ggLnTC/82669679-96-F8-46-A1-9-AE1-BBFEAD007153.png', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 4, title: 'Обычный: Текстиль и одежда', name: 'Текстиль и одежда', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/67TNNkvy/67872-D1-B-C0-D3-45-AB-8-A9-D-11-C0-EC734-FC8.png', reward: 18000, fuel: 180, duration: 45, reqLvl: 4, reqLic: 'basic' },
        { id: 5, title: 'Обычный: Электроника', name: 'Электроника', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/bThvzjv/12-AF1-E99-6-BDE-42-F0-8279-393-B53-DD51-EC.png', reward: 25000, fuel: 220, duration: 60, reqLvl: 5, reqLic: 'basic' },
        { id: 6, title: 'Опасный: Промышленные химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/DPLBSsd9/80-EEB782-572-C-402-C-B9-A2-AD4-DBFC19357.png', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous' },
        { id: 7, title: 'Опасный: Горючее топливо', name: 'Горючее топливо', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/ZpJQfZ7K/70-EDCB4-B-C9-F6-4633-9-C7-C-C0-BB8580-A3-BA.png', reward: 65000, fuel: 500, duration: 240, reqLvl: 8, reqLic: 'dangerous' },
        { id: 8, title: 'Опасный: Радиоактивные изотопы', name: 'Радиоактивные изотопы', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/SwyTHN19/E78-A4-D7-B-DBC1-4-F71-A4-DE-44-D446503-BB2.png', reward: 95000, fuel: 750, duration: 300, reqLvl: 10, reqLic: 'dangerous' },
        { id: 9, title: 'Негабарит: Тяжелая спецтехника', name: 'Тяжелая спецтехника', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/WvL7611N/9-BFBF2-DE-90-B2-4970-84-CC-C3-A98248-B0-CE.png', reward: 150000, fuel: 1000, duration: 600, reqLvl: 12, reqLic: 'oversized' },
        { id: 10, title: 'Негабарит: Турбины электростанции', name: 'Турбины электростанции', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/zh98DKMm/17-A3-CEB6-372-A-4-EDB-B73-D-455839-F0349-A.png', reward: 280000, fuel: 1500, duration: 1200, reqLvl: 15, reqLic: 'oversized' },
        { id: 11, title: 'Негабарит: Космический модуль', name: 'Космический модуль', diff: 'Легендарный', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/C5hBkM7k/DB75-BFE6-2-BE7-44-CF-ADC7-2799-D8-BBFB0-E.png', reward: 500000, fuel: 2500, duration: 1800, reqLvl: 18, reqLic: 'oversized' },
        { id: 12, title: 'Теневой: Контрабандный алкоголь', name: 'Контрабанда алкоголя', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/1GcDdFJ9/D19-A33-BF-999-E-4-B0-F-8-D66-C3714-FCA6163.png', reward: 220000, fuel: 1200, duration: 900, reqLvl: 12, reqLic: 'smuggling' },
        { id: 13, title: 'Теневой: Военное обмундирование', name: 'Военное оборудование', diff: 'Легендарный', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/mrSV75fk/AB71-CD39-0-F80-4-ED6-9-BE3-DF083613-E834.png', reward: 380000, fuel: 1600, duration: 1300, reqLvl: 14, reqLic: 'smuggling' },
        { id: 14, title: 'Черный рынок: Синдикатный груз', name: 'Синдикатный груз', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/0RwFRJ9t/5-C46-E8-C8-8203-4832-BEFF-03-C668616-B82.png', reward: 450000, fuel: 1800, duration: 1500, reqLvl: 15, reqLic: 'falsified_docs' },
        { id: 15, title: 'Черный рынок: Крупные партии чипов', name: 'Крупные партии чипов', diff: 'Легендарный', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/p68qv2R2/2815771-C-7-AA5-45-B5-8700-F2-BD55-D19-DE0.png', reward: 750000, fuel: 2400, duration: 2100, reqLvl: 18, reqLic: 'falsified_docs' },
        { id: 16, title: 'Секретный коридор: Прототипы оружия', name: 'Прототипы орудия', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/Hf6fFHCL/D70-EB30-C-6520-441-B-8-D1-E-1-C9763-AB202-C.png', reward: 1300000, fuel: 3500, duration: 3000, reqLvl: 22, reqLic: 'black_market' }
    ]
};

// ============================================================================
// 🤖 ИИ ДИСПЕТЧЕР
// ============================================================================
const AIDispatcher = {
    messages: [
        "Босс, проверьте износ тормозов перед выездом!",
        "Цены на топливо меняются динамически. Закупайте на низах!",
        "Прокачайте узлы тягача, чтобы они изнашивались медленнее.",
        "Выполняйте ежедневные квесты для быстрого получения наград."
    ],
    showPopup(msg) {
        const el = document.getElementById('ai-dispatcher');
        if (!el) return;
        document.getElementById('ai-message').innerText = msg;
        el.classList.add('show');
        AudioSys.playVibrate('info');
        setTimeout(() => el.classList.remove('show'), 5000);
    },
    randomAdvice() {
        if(Math.random() > 0.6) this.showPopup(this.messages[Math.floor(Math.random() * this.messages.length)]);
    }
};

// ============================================================================
// 🗄️ ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ И РЕЙТИНГ
// ============================================================================
const DB = {
    async init() {
        try {
            let { data: existingPlayer, error: searchError } = await supabaseClient
                .from('players')
                .select('*')
                .eq('telegram_id', telegramId)
                .maybeSingle();

            if (searchError) throw searchError;

            const defaultQuests = [
                { id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false },
                { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false },
                { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }
            ];

            if (!existingPlayer) {
                await this.createNewPlayer();
            } else {
                AppState.player = { ...AppState.player, ...existingPlayer };
                if (!AppState.player.pass_level) AppState.player.pass_level = 1;
                if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
                if (!AppState.player.quests || !Array.isArray(AppState.player.quests)) {
                    AppState.player.quests = defaultQuests;
                }
                if (!AppState.player.skills) {
                    AppState.player.skills = { eco: 0, luck: 0, mechanic: 0 };
                }
                if (AppState.player.total_fuel_burned === undefined) AppState.player.total_fuel_burned = 0;
                if (AppState.player.playtime_minutes === undefined) AppState.player.playtime_minutes = 0;
                if (!AppState.player.reg_date) AppState.player.reg_date = new Date().toISOString();
                
                if (AppState.player.syndicate_data) {
                    AppState.syndicateData = { ...AppState.syndicateData, ...AppState.player.syndicate_data };
                }
            }

            await this.loadGameData();
            await this.loadLeaderboard();
            AdminSys.checkAdminAccess();
            UI.renderAll();
        } catch (err) {
            UI.showToast("Ошибка соединения с БД: " + err.message, "error");
        }
    },

    async createNewPlayer() {
        const defaultQuests = [
            { id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false },
            { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false },
            { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }
        ];

        let startMoney = 100000;
        let startFuel = 400;

        const refId = tg.initDataUnsafe?.start_param;
        if (refId && String(refId) !== String(telegramId)) {
            startMoney += 50000;
            startFuel += 500;
            this.rewardReferrer(refId); 
        }

        let insertPayload = {
            telegram_id: telegramId,
            name: AppState.player.name,
            avatar: AppState.player.avatar,
            money: startMoney,
            fuel_stock: startFuel,
            level: AppState.player.level,
            xp: AppState.player.xp,
            total_trips: 0,
            licenses: ['basic'],
            pass_level: 1,
            pass_claimed: [],
            quests: defaultQuests,
            skills: { eco: 0, luck: 0, mechanic: 0 },
            total_fuel_burned: 0,
            playtime_minutes: 0,
            reg_date: new Date().toISOString(),
            syndicate_data: AppState.syndicateData
        };

        let { data: newP, error: insertError } = await supabaseClient
            .from('players')
            .insert([insertPayload])
            .select()
            .single();

        if (insertError) {
            delete insertPayload.quests;
            delete insertPayload.skills;
            delete insertPayload.syndicate_data;
            let { data: newPFallback, error: fallbackError } = await supabaseClient
                .from('players')
                .insert([insertPayload])
                .select()
                .single();
            if (fallbackError) throw fallbackError;
            AppState.player = { ...AppState.player, ...newPFallback, quests: defaultQuests, skills: { eco: 0, luck: 0, mechanic: 0 } };
        } else if (newP) {
            AppState.player = { ...AppState.player, ...newP };
        }
    },

    async rewardReferrer(refId) {
        try {
            let { data: refUser } = await supabaseClient
                .from('players')
                .select('id, money, fuel_stock')
                .eq('telegram_id', Number(refId))
                .single();

            if (refUser) {
                await supabaseClient.from('players').update({
                    money: Number(refUser.money) + 50000,
                    fuel_stock: Number(refUser.fuel_stock) + 500
                }).eq('id', refUser.id);
            }
        } catch (e) {
            console.error('Ошибка начисления реферального бонуса:', e);
        }
    },

    async loadGameData() {
        try {
            const [trucksRes, tripRes] = await Promise.all([
                supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id),
                supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)
            ]);

            AppState.trucks = trucksRes.data || [];
            
            AppState.trucks.forEach(t => {
                if (t.engineLvl === undefined) t.engineLvl = 100;
                if (t.tiresLvl === undefined) t.tiresLvl = 100;
                if (t.gearLvl === undefined) t.gearLvl = 100;
                if (t.brakesLvl === undefined) t.brakesLvl = 100;
                if (t.engineLvlUpgrade === undefined) t.engineLvlUpgrade = 0;
                if (t.tiresLvlUpgrade === undefined) t.tiresLvlUpgrade = 0;
                if (t.gearLvlUpgrade === undefined) t.gearLvlUpgrade = 0;
                if (t.brakesLvlUpgrade === undefined) t.brakesLvlUpgrade = 0;
            });

            AppState.activeTrips = tripRes.data || [];
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    },

    async loadLeaderboard() {
        try {
            const { data, error } = await supabaseClient
                .from('players')
                .select('id, name, avatar, total_profit, level')
                .order('total_profit', { ascending: false })
                .limit(20);

            if (!error && data) AppState.leaderboard = data;
        } catch (e) {
            console.error('Ошибка загрузки таблицы лидеров:', e);
        }
    },

    async syncPlayer() {
        const p = AppState.player;
        if (!p.id) return;
        if (!p.skills) p.skills = { eco: 0, luck: 0, mechanic: 0 };

        let updateData = {
            name: p.name, avatar: p.avatar, money: Number(p.money),
            fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price),
            level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit),
            total_trips: Number(p.total_trips), syndicate: p.syndicate,
            last_bonus_time: Number(p.last_bonus_time), licenses: p.licenses,
            pass_level: p.pass_level, pass_claimed: p.pass_claimed, quests: p.quests,
            skills: p.skills,
            total_fuel_burned: Number(p.total_fuel_burned || 0),
            playtime_minutes: Number(p.playtime_minutes || 0),
            reg_date: p.reg_date || new Date().toISOString(),
            syndicate_data: AppState.syndicateData
        };

        let { error } = await supabaseClient.from('players').update(updateData).eq('id', p.id);
        if (error) {
            delete updateData.quests;
            delete updateData.skills;
            delete updateData.syndicate_data;
            await supabaseClient.from('players').update(updateData).eq('id', p.id);
        }
        this.loadLeaderboard();
    }
};

// ============================================================================
// 🎮 ИГРОВАЯ ЛОГИКА
// ============================================================================
const GameLogic = {
    isFinishing: false,

    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    
    async addXP(amount) {
        AppState.player.xp = Number(AppState.player.xp) + Number(amount);
        let req = this.getReqXP(AppState.player.level);
        let leveledUp = false;

        while (AppState.player.xp >= req) {
            AppState.player.xp -= req;
            AppState.player.level = Number(AppState.player.level) + 1;
            AppState.player.pass_level = Number(AppState.player.pass_level) + 1;
            req = this.getReqXP(AppState.player.level);
            leveledUp = true;
        }

        if (leveledUp) {
            UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success');
        }
    },

    updateQuestProgress(type, amount) {
        if (!AppState.player.quests) return;
        AppState.player.quests.forEach(q => {
            if (q.claimed) return;
            if (type === 'trips' && q.id === 'q1') {
                q.progress = Math.min(q.target, q.progress + amount);
            }
            if (type === 'fuel' && q.id === 'q2') {
                q.progress = Math.min(q.target, q.progress + amount);
            }
            if (type === 'profit' && q.id === 'q3') {
                q.progress = Math.min(q.target, q.progress + amount);
            }
        });
    },

    claimQuest(qId) {
        const q = AppState.player.quests.find(item => item.id === qId);
        if (!q || q.claimed || q.progress < q.target) return;

        q.claimed = true;
        AppState.player.money += q.rewardCoins;
        this.addXP(q.rewardXP);
        DB.syncPlayer();

        UI.showToast(`Квест выполнен! +${q.rewardCoins.toLocaleString()} 🪙`, 'success');
        UI.renderAll();
    },

    async buyTruck(shopId) {
        const template = TRUCK_SHOP.find(t => t.id === shopId);
        if (!template) return;
        
        const alreadyOwned = AppState.trucks.some(t => t.name === template.name);
        if (alreadyOwned) {
            return UI.showToast('Этот транспорт уже есть в вашем автопарке!', 'error');
        }

        const currentMoney = Number(AppState.player.money) || 0;
        const truckPrice = Number(template.price) || 0;

        if (currentMoney < truckPrice) {
            return UI.showToast(`Нужно ${truckPrice.toLocaleString()} 🪙`, 'error');
        }

        AppState.player.money = currentMoney - truckPrice;
        
        let { data, error } = await supabaseClient.from('trucks').insert([{
            player_id: AppState.player.id,
            name: template.name,
            capacity: template.capacity,
            fuel_use: template.fuel_use,
            rarity: template.rarity,
            engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100,
            engineLvlUpgrade: 0, tiresLvlUpgrade: 0, gearLvlUpgrade: 0, brakesLvlUpgrade: 0
        }]).select().single();

        if (error) return UI.showToast("Ошибка при покупке фуры", "error");

        AppState.trucks.push(data);
        await DB.syncPlayer();
        UI.showToast(`Куплен новый транспорт: ${template.name}!`, 'success');
        UI.renderAll();
    },

    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует нужная лицензия!', 'error');
        
        const activeTruckIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !activeTruckIds.includes(t.id));

        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягажей в гараже!', 'error');

        const idleTruck = idleTrucks.find(t => t.engineLvl > 0 && t.tiresLvl > 0 && t.gearLvl > 0 && t.brakesLvl > 0);

        if (!idleTruck) {
            return UI.showToast('⚠️ Все свободные тягачи сломаны! Отремонтируйте их в гараже.', 'error');
        }

        if (WorldState.marketEvent.effect !== 'none' && title.includes(WorldState.marketEvent.effect)) {
            reward = Math.floor(reward * WorldState.marketEvent.multiplier);
        }

        if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) {
            const logisticsBonus = (AppState.syndicateData.techs.logistics || 0) * 0.04;
            reward = Math.floor(reward * (1 + logisticsBonus));
        }

        let ecoMod = 1.0;
        if (AppState.player.skills && AppState.player.skills.eco) {
            ecoMod -= AppState.player.skills.eco * 0.05;
        }

        let finalFuel = Math.floor(fuel * WorldState.weather.fuelMod * ecoMod);
        let finalDur = Math.floor(duration * WorldState.weather.timeMod);

        if (AppState.player.fuel_stock < finalFuel) return UI.showToast(`Нужно ${finalFuel}л топлива!`, 'error');

        let endTime = Date.now() + (finalDur * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{
            player_id: AppState.player.id,
            truck_id: idleTruck.id, 
            title: title,
            reward: reward,
            fuel_req: finalFuel,
            end_time: endTime
        }]).select().single();

        if (error) return UI.showToast("Ошибка запуска рейса: " + error.message, "error");

        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) - finalFuel;
        AppState.player.total_fuel_burned = (Number(AppState.player.total_fuel_burned) || 0) + finalFuel;
        this.updateQuestProgress('fuel', finalFuel);

        AppState.activeTrips.push(data);
        await DB.syncPlayer();
        UI.showToast(`Рейс начат на ${idleTruck.name}!`, 'success');
        UI.renderAll();
    },

    async finishTrip(tripId) {
        if (this.isFinishing) return;
        
        const tripIndex = AppState.activeTrips.findIndex(t => t.id === tripId);
        if (tripIndex === -1) return;
        const trip = AppState.activeTrips[tripIndex];

        this.isFinishing = true;
        
        let p = Number(trip.reward);
        let earnedXP = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.money = Number(AppState.player.money) + p;
        AppState.player.total_profit = Number(AppState.player.total_profit) + p;
        AppState.player.total_trips = Number(AppState.player.total_trips) + 1;

        this.updateQuestProgress('trips', 1);
        this.updateQuestProgress('profit', p);

        const truck = AppState.trucks.find(t => t.id === trip.truck_id);
        
        if (truck && trip.title !== 'Аренда: Сдана в прокат') {
            let mechMod = 1.0;
            if (AppState.player.skills && AppState.player.skills.mechanic) {
                mechMod -= AppState.player.skills.mechanic * 0.1;
            }
            if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) {
                mechMod -= (AppState.syndicateData.techs.mechanic || 0) * 0.05;
            }

            const baseWear = Math.floor(Math.random() * 6) + 5; 
            const wMod = WorldState.weather.wearMod;
            const wear = Math.max(1, Math.floor(baseWear * wMod * mechMod));

            truck.engineLvl = Math.max(0, truck.engineLvl - Math.max(1, wear - (truck.engineLvlUpgrade || 0)));
            truck.tiresLvl = Math.max(0, truck.tiresLvl - Math.max(1, Math.floor((wear + 3)) - (truck.tiresLvlUpgrade || 0)));
            truck.gearLvl = Math.max(0, truck.gearLvl - Math.max(1, wear - (truck.gearLvlUpgrade || 0)));
            truck.brakesLvl = Math.max(0, truck.brakesLvl - Math.max(1, Math.floor((wear + 2)) - (truck.brakesLvlUpgrade || 0)));

            await supabaseClient.from('trucks').update({
                engineLvl: truck.engineLvl, tiresLvl: truck.tiresLvl,
                gearLvl: truck.gearLvl, brakesLvl: truck.brakesLvl
            }).eq('id', truck.id);
        }

        await this.addXP(earnedXP);
        await supabaseClient.from('active_trips').delete().eq('id', trip.id); 
        AppState.activeTrips.splice(tripIndex, 1);
        this.isFinishing = false;

        await DB.syncPlayer();
        if (trip.title === 'Аренда: Сдана в прокат') {
            UI.showToast(`Аренда завершена! +${p} 🪙`, 'success');
        } else {
            UI.showToast(`Рейс завершен! +${p} 🪙 | +${earnedXP} XP`, 'success');
        }
        AIDispatcher.randomAdvice();
        UI.renderAll();
    },

    async repairPart(truckId, partName) {
        const truck = AppState.trucks.find(t => String(t.id) === String(truckId));
        if (!truck) return UI.showToast('Тягач не найден в памяти!', 'error');

        const currentVal = Number(truck[partName]) || 0;
        if (currentVal >= 100) return UI.showToast('Узел в идеальном состоянии!', 'info');

        const missingPercent = 100 - currentVal;
        const repairCost = missingPercent * 150; 

        if (Number(AppState.player.money) < repairCost) {
            return UI.showToast(`Нужно ${repairCost.toLocaleString()} 🪙 для починки`, 'error');
        }

        AppState.player.money = Number(AppState.player.money) - repairCost;
        truck[partName] = 100;

        let { error } = await supabaseClient.from('trucks').update({ [partName]: 100 }).eq('id', truck.id);
        if (error) {
            return UI.showToast("Ошибка сохранения ремонта в базе", "error");
        }

        await DB.syncPlayer();
        UI.showToast(`Узел отремонтирован за ${repairCost.toLocaleString()} 🪙!`, 'success');
        UI.renderAll();
    },

    async upgradeTruckPart(truckId, partName) {
        const truck = AppState.trucks.find(t => String(t.id) === String(truckId));
        if (!truck) return;

        const upgradeKey = partName + 'Upgrade'; 
        if (truck[upgradeKey] === undefined) truck[upgradeKey] = 0;
        if (truck[upgradeKey] >= 5) return UI.showToast('Узел прокачан на максимум!', 'info');

        const cost = 25000 * (truck[upgradeKey] + 1); 
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');

        AppState.player.money -= cost;
        truck[upgradeKey] += 1;

        await supabaseClient.from('trucks').update({ [upgradeKey]: truck[upgradeKey] }).eq('id', truck.id);
        await DB.syncPlayer();

        UI.showToast(`Тюнинг установлен! Уровень: ${truck[upgradeKey]}/5`, 'success');
        UI.renderAll();
    },

    async buyFuel(amount) {
        const currentMoney = Number(AppState.player.money) || 0;
        const fuelPrice = Number(AppState.player.fuel_price) || 0;
        const cost = Number(amount) * fuelPrice;

        if (currentMoney < cost) {
            return UI.showToast('Недостаточно монет!', 'error');
        }
        
        AppState.player.money = currentMoney - cost;
        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) + Number(amount);
        
        await DB.syncPlayer();
        UI.showToast(`Куплено ${amount}л топлива`, 'success');
        UI.renderAll();
    },

    async claimDailyBonus() {
        let now = Date.now();
        if (now - AppState.player.last_bonus_time < CONFIG.BONUS_COOLDOWN_MS) {
            let hours = Math.ceil((CONFIG.BONUS_COOLDOWN_MS - (now - AppState.player.last_bonus_time)) / 3600000);
            return UI.showToast(`Бонус будет доступен через ${hours} ч.`, 'error');
        }
        AppState.player.last_bonus_time = now;
        AppState.player.money = Number(AppState.player.money) + CONFIG.DAILY_BONUS_COINS;
        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) + CONFIG.DAILY_BONUS_FUEL;
        await DB.syncPlayer();
        UI.showToast(`Бонус получен: +${CONFIG.DAILY_BONUS_COINS} 🪙, +${CONFIG.DAILY_BONUS_FUEL}л`, 'success');
        UI.renderAll();
    },

    async buyLicense(licId) {
        if (AppState.player.licenses.includes(licId)) return UI.showToast('Лицензия уже приобретена!', 'info');
        
        const lic = LICENSES_SHOP.find(l => l.id === licId);
        if (!lic) return;

        if (AppState.player.level < lic.reqLvl) {
            return UI.showToast(`Требуется ${lic.reqLvl} уровень!`, 'error');
        }

        if (AppState.player.money < lic.cost) {
            return UI.showToast(`Нужно ${lic.cost.toLocaleString()} 🪙`, 'error');
        }

        AppState.player.money = Number(AppState.player.money) - lic.cost;
        AppState.player.licenses.push(licId);
        
        await DB.syncPlayer();
        UI.showToast(`Лицензия "${lic.name}" успешно получена!`, 'success');
        UI.renderAll();
    },

    async saveProfile() {
        let nameField = document.getElementById('input-username');
        let name = nameField ? nameField.value.trim() : '';
        if (name) {
            AppState.player.name = name;
            AdminSys.checkAdminAccess();
        }
        await DB.syncPlayer();
        UI.showToast('Профиль сохранен', 'success');
        UI.renderAll();
    },

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return UI.showToast('Файл слишком большой (макс. 2МБ)', 'error');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            AppState.player.avatar = e.target.result;
            await DB.syncPlayer();
            UI.showToast('Аватар изменен!', 'success');
            UI.renderAll();
        };
        reader.readAsDataURL(file);
    },

    claimPassReward(tierLevel, coinReward) {
        if (!AppState.player.pass_level) AppState.player.pass_level = 1;
        if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];

        if (AppState.player.pass_level < tierLevel) return UI.showToast('Уровень пропуска не достигнут!', 'error');
        if (AppState.player.pass_claimed.includes(tierLevel)) return UI.showToast('Награда уже получена!', 'info');

        AppState.player.pass_claimed.push(tierLevel);
        AppState.player.money = Number(AppState.player.money) + Number(coinReward);
        DB.syncPlayer();

        UI.showToast(`Награда за пропуск получена: +${coinReward.toLocaleString()} 🪙!`, 'success');
        UI.renderAll();
    },

    updateMarket() {
        const minPrice = 8;
        const maxPrice = 22;
        AppState.player.fuel_price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
        UI.renderAll();
    },

    async upgradeSkill(skillKey) {
        const maxLevel = 5;
        if (!AppState.player.skills) AppState.player.skills = { eco: 0, luck: 0, mechanic: 0 };
        
        const currentLevel = AppState.player.skills[skillKey] || 0;
        if (currentLevel >= maxLevel) return UI.showToast('Навык прокачан на максимум!', 'info');

        const cost = 50000 * (currentLevel + 1); 
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');

        AppState.player.money -= cost;
        AppState.player.skills[skillKey] = currentLevel + 1;
        
        await DB.syncPlayer();
        UI.showToast('Навык успешно улучшен!', 'success');
        UI.renderAll();
    },

    async rentOutTruck(truckId) {
        const truck = AppState.trucks.find(t => String(t.id) === String(truckId));
        if (!truck) return;

        if (truck.engineLvl < 100 || truck.tiresLvl < 100 || truck.gearLvl < 100 || truck.brakesLvl < 100) {
            return UI.showToast('В аренду берут только полностью исправные фуры (все по 100%)!', 'error');
        }

        const rentTime = 4 * 60 * 60 * 1000; 
        const reward = Math.floor(truck.capacity * 2); 
        const endTime = Date.now() + rentTime;

        let { data, error } = await supabaseClient.from('active_trips').insert([{
            player_id: AppState.player.id,
            truck_id: truck.id, 
            title: 'Аренда: Сдана в прокат',
            reward: reward,
            fuel_req: 0, 
            end_time: endTime
        }]).select().single();

        if (error) return UI.showToast("Ошибка сдачи в аренду", "error");

        AppState.activeTrips.push(data);
        await DB.syncPlayer();
        UI.showToast(`Фура сдана в аренду на 4 часа! Принесет ${reward} 🪙`, 'success');
        UI.renderAll();
    },

    inviteFriend() {
        const botUsername = 'LogisticWorldBot';
        const refLink = `https://t.me/${botUsername}/app?startapp=${telegramId}`;
        const shareText = `Присоединяйся к моей логистической империи! Тебя ждет крутой стартовый бонус.`;
        
        const url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;
        tg.openTelegramLink(url);
    },

    createSyndicate: async function(name) {
        name = name.trim();
        if (!name || name.length < 3) return UI.showToast('Название должно быть длиннее 3 символов', 'error');
        if (AppState.player.syndicate) return UI.showToast('Вы уже состоите в синдикате!', 'error');
        if (AppState.player.money < 500000) return UI.showToast('Нужно 500,000 🪙 для создания!', 'error');

        AppState.player.money -= 500000;
        AppState.player.syndicate = name;
        AppState.syndicateData = {
            name: name,
            level: 1,
            treasuryFuel: 0,
            techs: { security: 0, logistics: 0, mechanic: 0 },
            feed: [`Создан синдикат "${name}". Основатель: ${AppState.player.name}`]
        };
        
        await DB.syncPlayer();
        UI.showToast(`Синдикат "${name}" успешно создан!`, 'success');
        UI.renderAll();
    },

    joinSyndicate: async function(name) {
        name = name.trim();
        if (!name) return UI.showToast('Введите название синдиката', 'error');
        if (AppState.player.syndicate === name) return UI.showToast('Вы уже в этом синдикате', 'info');
        if (AppState.player.syndicate) return UI.showToast('Сначала покиньте текущий синдикат', 'error');

        AppState.player.syndicate = name;
        AppState.syndicateData.name = name;
        if (!AppState.syndicateData.feed) AppState.syndicateData.feed = [];
        AppState.syndicateData.feed.unshift(`Агент ${AppState.player.name} присоединился к синдикату.`);
        
        await DB.syncPlayer();
        UI.showToast(`Вы вступили в ${name}!`, 'success');
        UI.renderAll();
    },

    leaveSyndicate: async function() {
        if (!AppState.player.syndicate) return;
        
        if (confirm("Вы уверены, что хотите покинуть синдикат?")) {
            AppState.player.syndicate = null;
            await DB.syncPlayer();
            UI.showToast('Вы покинули корпорацию.', 'info');
            UI.renderAll();
        }
    },

    upgradeTech(techKey) {
        const techCosts = { security: 1000, logistics: 1500, mechanic: 1200 };
        const currentLvl = AppState.syndicateData.techs[techKey] || 0;
        if (currentLvl >= 5) return UI.showToast('Технология максимального уровня!', 'info');

        const cost = techCosts[techKey] * (currentLvl + 1);

        if (AppState.player.fuel_stock < cost) {
            return UI.showToast(`Недостаточно личного топлива! Нужно ${cost}л`, 'error');
        }

        AppState.player.fuel_stock -= cost;
        AppState.syndicateData.techs[techKey] = currentLvl + 1;
        AppState.syndicateData.treasuryFuel = (AppState.syndicateData.treasuryFuel || 0) + cost;

        let techNames = { security: 'Безопасность', logistics: 'Тендерный отдел', mechanic: 'Собственная СТО' };
        if (!AppState.syndicateData.feed) AppState.syndicateData.feed = [];
        AppState.syndicateData.feed.unshift(`> ${AppState.player.name} улучшил "${techNames[techKey]}" до Ур.${AppState.syndicateData.techs[techKey]}`);
        
        if (AppState.syndicateData.feed.length > 10) AppState.syndicateData.feed.pop();

        DB.syncPlayer();
        UI.showToast('Технология синдиката улучшена!', 'success');
        UI.renderAll();
    }
};

// ============================================================================
// 🎨 УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
// ============================================================================
const UI = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); 
        
        const selectedTab = document.getElementById(`tab-${tabId}`);
        if (selectedTab) selectedTab.classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(b => { 
            if(b.getAttribute('onclick')?.includes(tabId)) b.classList.add('active'); 
        });
        
        AudioSys.playVibrate('click');
        this.renderAll();
    },

    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container');
        if (!c) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`; t.innerText = msg;
        c.appendChild(t);
        AudioSys.playVibrate(type);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },

    safeUpdate(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; },
    safeUpdateHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; },

    getHealthColor(val) {
        if (val > 60) return '#10B981'; 
        if (val > 25) return '#F59E0B'; 
        return '#EF4444'; 
    },

    renderAll() {
        const p = AppState.player;
        if (!p.pass_level) p.pass_level = 1;
        if (!p.pass_claimed) p.pass_claimed = [];
        
        // --- Обновление нового Профиля ---
        this.safeUpdate('profile-id-name', p.name);
        this.safeUpdate('profile-id-role', ReputationSys.getTitle(p.level));
        this.safeUpdate('profile-id-lvl', `LVL ${p.level}`);
        
        const dateObj = new Date(p.reg_date || Date.now());
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`;
        this.safeUpdate('profile-id-date', formattedDate);
        
        const idAvatar = document.getElementById('profile-id-avatar');
        if (idAvatar) idAvatar.src = p.avatar || 'https://via.placeholder.com/80';
        
        this.safeUpdate('stat-total-fuel', `${Number(p.total_fuel_burned || 0).toLocaleString()} л`);
        let hrs = Math.floor((p.playtime_minutes || 0) / 60);
        let mins = (p.playtime_minutes || 0) % 60;
        this.safeUpdate('stat-playtime', `${hrs}ч ${mins}м`);
        
        let favTruckStr = "Нет тягача";
        if (AppState.trucks && AppState.trucks.length > 0) {
            let sortedTrucks = [...AppState.trucks].sort((a, b) => {
                let tA = TRUCK_SHOP.find(s => s.name === a.name);
                let tB = TRUCK_SHOP.find(s => s.name === b.name);
                let priceA = tA ? tA.price : 0;
                let priceB = tB ? tB.price : 0;
                return priceB - priceA;
            });
            favTruckStr = sortedTrucks[0].name;
        }
        this.safeUpdate('stat-fav-truck', favTruckStr);
        // ---------------------------------

        this.safeUpdate('username', p.name);
        this.safeUpdate('user-title', ReputationSys.getTitle(p.level));
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);
        this.safeUpdate('current-fuel-price', `${p.fuel_price} 🪙 / л`);
        this.safeUpdate('pass-subtitle', `Ваш текущий уровень пропуска: ${p.pass_level}`);
        
        document.querySelectorAll('#user-avatar').forEach(img => {
            if (p.avatar) img.src = p.avatar;
        });
        
        this.safeUpdate('stat-total-profit', `${Number(p.total_profit).toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', p.total_trips);

        if (p.quests && p.quests.length > 0) {
            this.safeUpdateHTML('quests-list', p.quests.map(q => {
                const isCompleted = q.progress >= q.target;
                const btnText = q.claimed ? 'Получено' : (isCompleted ? 'Забрать награду' : `${q.progress} / ${q.target}`);
                return `
                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 13px; font-weight: 700;">${q.title}</div>
                        <div style="font-size: 11px; color: var(--hint-color); margin-top: 2px;">Награда: +${q.rewardCoins.toLocaleString()} 🪙 | +${q.rewardXP} XP</div>
                    </div>
                    <button class="btn ${q.claimed ? 'btn-outline' : 'btn-primary'}" style="font-size: 11px; padding: 6px 10px; width: auto;" 
                        ${q.claimed || !isCompleted ? 'disabled' : ''} onclick="GameLogic.claimQuest('${q.id}')">
                        ${btnText}
                    </button>
                </div>`;
            }).join(''));
        }
        
        // --- Рендеринг Масштабного Синдиката ---
        const noSynPanel = document.getElementById('no-syndicate-panel');
        const activeSynPanel = document.getElementById('active-syndicate-panel');

        if(p.syndicate) {
            if(noSynPanel) noSynPanel.style.display = 'none';
            if(activeSynPanel) activeSynPanel.style.display = 'block';

            const syn = AppState.syndicateData;
            this.safeUpdate('corp-name-title', p.syndicate);
            this.safeUpdate('corp-level-badge', `Ур. ${syn.level || 1}`);
            this.safeUpdate('corp-fuel-treasury', `${(syn.treasuryFuel || 0).toLocaleString()} л`);
            this.safeUpdate('corp-role-desc', p.name === 'TSYBUSS' ? 'Генеральный Директор' : 'Элитный Логист');

            if (syn.feed && syn.feed.length > 0) {
                this.safeUpdateHTML('corp-activity-feed', syn.feed.map(item => `<div class="feed-item">${item}</div>`).join(''));
            }

            const techsConfig = [
                { key: 'security', name: '🛡️ Отдел Безопасности', desc: 'Снижает шанс форс-мажоров в пути на 5% за уровень.', cost: 1000 },
                { key: 'logistics', name: '📈 Тендерный Отдел', desc: 'Увеличивает доходность контрактов на +4% за уровень.', cost: 1500 },
                { key: 'mechanic', name: '🔧 Корпоративная СТО', desc: 'Замедляет износ узлов тягачей на 5% за уровень.', cost: 1200 }
            ];

            this.safeUpdateHTML('corp-tech-tree', techsConfig.map(t => {
                const curLvl = syn.techs[t.key] || 0;
                const nextCost = t.cost * (curLvl + 1);
                const isMax = curLvl >= 5;

                return `
                <div class="tech-card">
                    <div class="tech-header">
                        <span class="tech-name">${t.name}</span>
                        <span class="tech-lvl">Ур. ${curLvl}/5</span>
                    </div>
                    <p class="tech-desc">${t.desc}</p>
                    <button class="btn ${isMax ? 'btn-outline' : 'btn-primary'}" style="font-size: 11px; padding: 8px;" ${isMax ? 'disabled' : ''} onclick="GameLogic.upgradeTech('${t.key}')">
                        ${isMax ? 'МАКСИМУМ' : `Инвестировать (${nextCost}л ⛽)`}
                    </button>
                </div>`;
            }).join(''));

            this.safeUpdateHTML('corp-members-list', `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${p.avatar || 'https://via.placeholder.com/30'}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="font-size: 12px; font-weight: bold;">${p.name} (Вы)</div>
                            <div style="font-size: 10px; color: var(--accent-pink);">Участник сети</div>
                        </div>
                    </div>
                    <span style="font-size: 11px; color: var(--success-color);">Активен</span>
                </div>
            `);

        } else {
            if(noSynPanel) noSynPanel.style.display = 'block';
            if(activeSynPanel) activeSynPanel.style.display = 'none';
        }
        // --------------------------------------------------

        const xpProg = Math.min((p.xp / GameLogic.getReqXP(p.level)) * 100, 100);
        const xpFill = document.getElementById('xp-bar-fill');
        if (xpFill) xpFill.style.width = `${xpProg}%`;

        const activeTruckIds = AppState.activeTrips.map(trip => trip.truck_id);
        
        let fleetHtml = AppState.trucks.length > 0 ? AppState.trucks.map((t) => {
            const isBusy = activeTruckIds.includes(t.id);
            const statusHtml = isBusy ? `<span style="font-size:12px; color:#EF4444;">🔴 Занята</span>` : `<span style="font-size:12px; color:#10B981;">🟢 Свободна</span>`;
            
            const allParts100 = t.engineLvl === 100 && t.tiresLvl === 100 && t.gearLvl === 100 && t.brakesLvl === 100;

            const parts = [
                { key: 'engineLvl', name: '🛠 Двс' },
                { key: 'tiresLvl', name: '🛞 Шины' },
                { key: 'gearLvl', name: '⚙️ КПП' },
                { key: 'brakesLvl', name: '🧯 Торм' }
            ];

            const shopTemplate = TRUCK_SHOP.find(shopT => shopT.name === t.name);
            const truckImage = shopTemplate ? shopTemplate.image : '';

            return `
            <div class="card rarity-${t.rarity || 'common'}" style="margin-bottom: 12px;">
                <div class="card-title">
                    <span>🚚 ${t.name}</span>
                    ${statusHtml}
                </div>
                ${truckImage ? `<div style="text-align: center; margin: 10px 0;"><img src="${truckImage}" alt="${t.name}" style="max-width: 100%; height: 100px; object-fit: contain;"></div>` : ''}
                <div class="parts-grid">
                    ${parts.map(pt => {
                        const val = t[pt.key] !== undefined ? Number(t[pt.key]) : 100;
                        const upgradeLvl = t[pt.key + 'Upgrade'] || 0;
                        const color = this.getHealthColor(val);
                        const repairCost = (100 - val) * 150;
                        
                        let dotsHtml = '';
                        for(let i = 0; i < 5; i++) {
                            dotsHtml += `<div class="upgrade-dot ${i < upgradeLvl ? 'active' : ''}"></div>`;
                        }

                        return `
                        <div class="part-card">
                            <div class="part-header">
                                <span>${pt.name}</span>
                                <span style="color:${color};">${val}%</span>
                            </div>
                            <div class="part-bar">
                                <div class="part-bar-fill" style="width:${val}%; background-color:${color};"></div>
                            </div>
                            <div class="upgrade-track">${dotsHtml}</div>
                            <div style="display:flex; gap:4px; margin-top:6px;">
                                <button class="btn btn-outline btn-repair" style="flex:1; padding: 4px; pointer-events: auto;" ${isBusy || val === 100 ? 'disabled' : ''} onclick="GameLogic.repairPart('${t.id}', '${pt.key}')">
                                    ${val === 100 ? 'OK' : `${(repairCost/1000).toFixed(1)}k`}
                                </button>
                                <button class="btn btn-upgrade" style="flex:1; padding: 4px; pointer-events: auto;" ${isBusy || upgradeLvl >= 5 ? 'disabled' : ''} onclick="GameLogic.upgradeTruckPart('${t.id}', '${pt.key}')">
                                    ${upgradeLvl >= 5 ? 'MAX' : `UP`}
                                </button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
                <button class="btn ${isBusy || !allParts100 ? 'btn-outline' : 'btn-primary'}" style="width: 100%; margin-top: 8px; font-size: 12px; padding: 6px;" ${isBusy || !allParts100 ? 'disabled' : ''} onclick="GameLogic.rentOutTruck('${t.id}')">
                    ${isBusy ? 'Машина занята' : (!allParts100 ? 'Нужен ремонт 100%' : 'Сдать в аренду (4ч)')}
                </button>
            </div>`;
        }).join('') : `<p style="text-align:center; color:var(--hint-color); margin-bottom: 16px;">Ваш гараж пока пуст. Купите тягач в автосалоне ниже!</p>`;

        let shopHtml = `
        <h3 class="subsection-title" style="margin-top: 20px;">Автосалон</h3>
        <div class="card-grid">
            ${TRUCK_SHOP.map(shopT => {
                const alreadyOwned = AppState.trucks.some(t => t.name === shopT.name);
                return `
                <div class="card">
                    <div class="card-title">
                        <span>🚚 ${shopT.name}</span>
                        <span style="color:var(--accent-blue);">${shopT.price.toLocaleString()} 🪙</span>
                    </div>
                    ${shopT.image ? `<div style="text-align: center; margin: 10px 0;"><img src="${shopT.image}" alt="${shopT.name}" style="max-width: 100%; height: 100px; object-fit: contain;"></div>` : ''}
                    <div class="specs-grid" style="margin-bottom:8px;">
                        <div>Вместимость: ${shopT.capacity}</div>
                        <div>Расход: ${shopT.fuel_use}л</div>
                    </div>
                    <button class="btn ${alreadyOwned ? 'btn-outline' : 'btn-primary'}" ${alreadyOwned ? 'disabled' : ''} onclick="GameLogic.buyTruck('${shopT.id}')">
                        ${alreadyOwned ? 'Куплено' : 'Купить машину'}
                    </button>
                </div>`;
            }).join('')}
        </div>`;

        this.safeUpdateHTML('fleet-list', fleetHtml + shopHtml);

        let licensesHtml = LICENSES_SHOP.map(l => {
            const hasLicense = p.licenses.includes(l.id);
            const isIllegal = l.type === 'illegal';
            const borderColor = isIllegal ? 'var(--accent-pink)' : 'var(--accent-blue)';
            
            return `
            <div class="card" style="border-color: ${borderColor}; margin-bottom: 10px;">
                <div class="card-title">
                    <span>${isIllegal ? '🥷' : '📜'} ${l.name} ${isIllegal ? '(Нелегально)' : ''}</span>
                    <span style="color: ${hasLicense ? '#10B981' : 'var(--accent-pink)'};">${hasLicense ? 'Куплено' : `${l.cost.toLocaleString()} 🪙`}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; font-size: 10px; color: var(--hint-color); margin: 8px 0; text-align: center; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 6px;">
                    <div>${l.col1}</div>
                    <div>${l.col2}</div>
                    <div>${l.col3}</div>
                    <div>${l.col4}</div>
                    <div>${l.col5}</div>
                </div>
                <button class="btn ${hasLicense ? 'btn-outline' : 'btn-primary'}" 
                    ${hasLicense ? 'disabled' : ''} 
                    onclick="GameLogic.buyLicense('${l.id}')">
                    ${hasLicense ? 'Активировано' : 'Приобрести'}
                </button>
            </div>`;
        }).join('');

        this.safeUpdateHTML('licenses-list', licensesHtml);

        let tripsHtml = AppState.activeTrips.map(trip => {
            let left = Math.floor((trip.end_time - Date.now()) / 1000);
            if (left <= 0) {
                GameLogic.finishTrip(trip.id);
                return '';
            }
            
            if (trip.title !== 'Аренда: Сдана в прокат' && Math.random() < 0.008) {
                EventSys.checkEventsForTrip(trip);
            }

            const tripTruck = AppState.trucks.find(t => String(t.id) === String(trip.truck_id));
            const truckName = tripTruck ? tripTruck.name : 'Фура';
            
            return `<div class="card rarity-epic" style="margin-bottom: 12px; border-color: var(--accent-blue);">
                <div class="card-title"><span>🚚 ${truckName} в пути</span><span style="color:var(--accent-blue);">⏳ ${left} сек</span></div>
                <p style="font-size:12px; color:var(--hint-color);">${trip.title}</p>
            </div>`;
        }).join('');
        
        this.safeUpdateHTML('active-trip-panel', tripsHtml);

        const activeTruckIdsArr = AppState.activeTrips.map(trip => trip.truck_id);
        const hasIdleTrucks = AppState.trucks.some(t => !activeTruckIdsArr.includes(t.id) && Number(t.engineLvl) > 0 && Number(t.tiresLvl) > 0 && Number(t.gearLvl) > 0 && Number(t.brakesLvl) > 0);
        
        this.safeUpdateHTML('contracts-list', AppState.contracts.map(c => {
            const lockedLvl = p.level < c.reqLvl;
            const lockedLic = !p.licenses.includes(c.reqLic);
            const isLocked = lockedLvl || lockedLic;
            
            let currentReward = c.reward;
            if (WorldState.marketEvent.effect !== 'none' && c.title.includes(WorldState.marketEvent.effect)) {
                currentReward = Math.floor(currentReward * WorldState.marketEvent.multiplier);
            }

            if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) {
                const logisticsBonus = (AppState.syndicateData.techs.logistics || 0) * 0.04;
                currentReward = Math.floor(currentReward * (1 + logisticsBonus));
            }

            let btnText = 'Начать рейс';
            let btnClass = 'contract-action-btn active';
            
            if (lockedLvl) {
                btnText = `Нужен Ур. ${c.reqLvl}`;
                btnClass = 'contract-action-btn disabled';
            } else if (lockedLic) {
                btnText = 'Нет лицензии';
                btnClass = 'contract-action-btn disabled';
            } else if (!hasIdleTrucks) {
                btnText = 'Нет готовых тягачей';
                btnClass = 'contract-action-btn disabled';
            }

            let timeStr = c.duration >= 60 ? `${Math.floor(c.duration/60)}м ${c.duration%60 > 0 ? c.duration%60+'с' : ''}` : `${c.duration}с`;

            return `
            <div class="contract-card" style="${isLocked ? 'opacity:0.6' : ''}">
                <div class="contract-header">
                    <div class="contract-title-group">
                        <span class="contract-badge ${c.badgeClass}">${c.diff}</span>
                        <span class="contract-name">${c.name}</span>
                    </div>
                    <div class="contract-reward">+${currentReward.toLocaleString()} 🪙</div>
                </div>

                <div class="contract-body">
                    <div class="contract-image">
                        <img src="${c.image}" alt="${c.name}">
                    </div>
                    <div class="contract-specs">
                        <div class="spec-item">
                            <span>⏱ Время:</span>
                            <span style="color: #fff; font-weight: bold;">${timeStr}</span>
                        </div>
                        <div class="spec-item">
                            <span>⛽ Топливо:</span>
                            <span style="color: #fff; font-weight: bold;">${c.fuel}л</span>
                        </div>
                    </div>
                </div>

                <button class="${btnClass}" ${!hasIdleTrucks || isLocked ? 'disabled' : ''} 
                    onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">
                    ${btnText}
                </button>
            </div>`;
        }).join(''));

        this.safeUpdateHTML('leaderboard-list', AppState.leaderboard.map((user, index) => `
            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: bold; font-size: 16px; color: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--hint-color)'};">#${index + 1}</span>
                    <img src="${user.avatar || 'https://via.placeholder.com/40'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${user.name}</div>
                        <div style="font-size: 11px; color: var(--hint-color);">Уровень: ${user.level}</div>
                    </div>
                </div>
                <div style="font-weight: bold; color: var(--accent-pink); font-size: 14px;">🪙 ${Number(user.total_profit).toLocaleString()}</div>
            </div>
        `).join(''));

        const passTiers = Array.from({ length: 30 }, (_, i) => {
            const lvl = i + 1;
            const rewardCoins = 10000 + (lvl - 1) * 20000;
            return {
                level: lvl,
                reward: rewardCoins,
                title: `Уровень ${lvl}: Этап Cyber Tokyo #${lvl}`
            };
        });

        this.safeUpdateHTML('pass-tiers-list', passTiers.map(tier => {
            const isReached = p.pass_level >= tier.level;
            const isClaimed = p.pass_claimed.includes(tier.level);
            
            return `<div class="card bp-card" style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div class="card-title" style="margin-bottom:4px;"><span>${tier.title}</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">Награда: +${tier.reward.toLocaleString()} 🪙</p>
                </div>
                <button class="btn ${isClaimed ? 'btn-outline' : 'btn-primary'}" 
                    style="font-size:12px; padding:8px 12px; width:auto;"
                    ${!isReached || isClaimed ? 'disabled' : ''}
                    onclick="GameLogic.claimPassReward(${tier.level}, ${tier.reward})">
                    ${isClaimed ? 'Получено' : (isReached ? 'Забрать' : `Нужен ур. ${tier.level}`)}
                </button>
            </div>`;
        }).join(''));

        if (!p.skills) p.skills = { eco: 0, luck: 0, mechanic: 0 };
        const skillsData = [
            { key: 'eco', name: '🍃 Эко-вождение', desc: 'Снижает расход топлива в пути', icon: '⛽' },
            { key: 'luck', name: '🍀 Связи на таможне', desc: 'Снижает шанс форс-мажора', icon: '👮' },
            { key: 'mechanic', name: '🔧 Опытный механик', desc: 'Замедляет износ деталей фуры', icon: '🛠' }
        ];

        this.safeUpdateHTML('skills-list', skillsData.map(s => {
            const lvl = p.skills[s.key] || 0;
            const cost = 50000 * (lvl + 1);
            const isMax = lvl >= 5;
            return `
            <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 13px; font-weight: 700;">${s.name} <span style="color:var(--accent-pink);">[Ур. ${lvl}/5]</span></div>
                    <div style="font-size: 11px; color: var(--hint-color); margin-top: 2px;">${s.desc}</div>
                </div>
                <button class="btn ${isMax ? 'btn-outline' : 'btn-primary'}" style="font-size: 11px; padding: 6px 12px; width: auto;" 
                    ${isMax ? 'disabled' : ''} onclick="GameLogic.upgradeSkill('${s.key}')">
                    ${isMax ? 'MAX' : `${cost.toLocaleString()} 🪙`}
                </button>
            </div>`;
        }).join(''));
    }
};

// ============================================================================
// 🎮 ПАРАЛЛАКС И ЗАПУСК ИГРЫ
// ============================================================================
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById('parallax-bg');
    if (!bg) return;
    const x = (window.innerWidth - e.pageX * 2) / 90;
    const y = (window.innerHeight - e.pageY * 2) / 90;
    bg.style.transform = `translate(${x}px, ${y}px)`;
});

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather();
    WorldState.generateMarketEvent();
    
    let p = 0;
    const loader = document.getElementById('loading-screen');
    if (loader) {
        const int = setInterval(() => {
            p += 20;
            document.getElementById('loader-progress').style.width = `${p}%`;
            document.getElementById('loader-percent').innerText = `${p}%`;
            if(p >= 100) {
                clearInterval(int);
                document.getElementById('loader-tap').style.display = 'block';
                loader.addEventListener('click', () => {
                    loader.style.opacity = '0';
                    document.getElementById('app-content').style.opacity = '1';
                    setTimeout(() => loader.remove(), 500);
                    
                    DB.init().then(() => {
                        setTimeout(() => {
                            if (AppState.trucks.length === 0) {
                                AIDispatcher.showPopup("Босс, гараж пуст! Зайдите в Автосалон и купите свой первый транспорт.");
                            } else {
                                AIDispatcher.showPopup("Добро пожаловать в Logistic World, Босс!");
                            }
                        }, 1500);
                    });
                });
            }
        }, 300);
    } else {
        DB.init();
    }

    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    
    setInterval(() => { WorldState.generateWeather(); AIDispatcher.randomAdvice(); }, 180000);
    setInterval(() => { GameLogic.updateMarket(); }, 240000);
    setInterval(() => { WorldState.generateMarketEvent(); }, 600000);

    // Таймер проведенного времени в игре (1 минута = 60000 мс)
    setInterval(() => {
        if (AppState.player && AppState.player.id) {
            AppState.player.playtime_minutes = (AppState.player.playtime_minutes || 0) + 1;
            
            const el = document.getElementById('stat-playtime');
            if (el) {
                let hrs = Math.floor(AppState.player.playtime_minutes / 60);
                let mins = AppState.player.playtime_minutes % 60;
                el.innerText = `${hrs}ч ${mins}м`;
            }
            
            if (AppState.player.playtime_minutes % 5 === 0) {
                DB.syncPlayer();
            }
        }
    }, 60000);
});

window.switchTab = (id) => UI.switchTab(id);
window.AudioSys = AudioSys;
window.AdminSys = AdminSys;
window.GameLogic = GameLogic;
window.EventSys = EventSys;
window.UI = UI;
