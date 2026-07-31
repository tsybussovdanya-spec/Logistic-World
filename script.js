const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, DAILY_BONUS_COINS: 15000, DAILY_BONUS_FUEL: 200, BONUS_COOLDOWN_MS: 86400000, 
    CASE_COST: 10000000, DUPLICATE_COINS: 1000000, DUPLICATE_XP: 10000,
    TIPS: [
        "Дождь увеличивает износ шин и тормозов.",
        "Следите за коробкой передач: 0% износа блокирует рейсы!",
        "Ремонтируйте узлы вовремя, чтобы избежать поломки в пути.",
        "Открывайте кейсы с фонами, чтобы кастомизировать свой профиль!"
    ]
};

const TRUCK_SHOP = [
    { id: 't1', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, rarity: 'common', price: 75000, image: 'https://i.ibb.co.com/p6XDM2Rx/44-F0-E8-CE-1-CFA-47-E8-AAB4-8-A3-A6-B1-D0-FFD.png' },
    { id: 't2', name: 'ЗАЗ Карго', capacity: 2800, fuel_use: 30, rarity: 'common', price: 140000, image: 'https://i.ibb.co.com/v63jh8Sw/61-FB1-D82-33-D6-4928-B3-A6-2-B5-D57-A338-FB.png' },
    { id: 't3', name: 'Volvo FH Neo', capacity: 5000, fuel_use: 45, rarity: 'rare', price: 250000, image: 'https://i.ibb.co.com/hRVfRq6G/271-F0-AAF-8480-41-D8-BEE3-8-EC01-B5-BE97-E.png' },
    { id: 't4', name: 'Scania R730', capacity: 8500, fuel_use: 60, rarity: 'rare', price: 420000, image: 'https://i.ibb.co.com/C5TVRDX2/60-A0-E34-A-CE54-4243-ADBE-96-F5-A9-F96-EAF.png' },
    { id: 't5', name: 'Cyber Truck', capacity: 11000, fuel_use: 75, rarity: 'epic', price: 550000, image: 'https://i.ibb.co.com/WNd23f1s/0-E6-FEEE9-5867-4504-B095-FC5-A92-C85-F00.png' },
    { id: 't6', name: 'Cyber Titan', capacity: 12000, fuel_use: 80, rarity: 'epic', price: 600000, image: 'https://i.ibb.co.com/ccjV64tt/613-B8045-D8-D0-46-B4-B362-E11-F940-E6-CE5.png' },
    { id: 't7', name: 'Peterbilt 389 Custom', capacity: 17000, fuel_use: 100, rarity: 'epic', price: 950000, image: 'https://i.ibb.co.com/5x580wTg/8-AE858-A3-23-BD-477-B-A735-43-A2-C75-B7-B8-E.png' },
    { id: 't8', name: 'Quantum Leviathan', capacity: 25000, fuel_use: 120, rarity: 'legendary', price: 1500000, image: 'https://i.ibb.co.com/6cFXLhYF/B419-FC20-BE70-4-BD0-A6-FD-2-B72-D347-C0-EB.png' },
    { id: 't9', name: 'Titanium Goliath X', capacity: 40000, fuel_use: 180, rarity: 'legendary', price: 2800000, image: 'https://i.ibb.co.com/RksPdPSb/DF802-CE4-829-F-4-A68-9068-717-B406-D42-AE.png' }
];

const LICENSES_SHOP = [
    { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1, col1: 'Риск: 0%', col2: 'Штраф: 0', col3: 'Бонус: 0%', col4: 'Скрытн: 100%', col5: 'Доступ: База' },
    { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5, col1: 'Риск: 5%', col2: 'Штраф: 10k', col3: 'Бонус: +10%', col4: 'Скрытн: 80%', col5: 'Доступ: Химия' },
    { id: 'oversized', name: 'Негабарит', type: 'legal', cost: 150000, reqLvl: 10, col1: 'Риск: 2%', col2: 'Штраф: 25k', col3: 'Бонус: +25%', col4: 'Скрытн: 90%', col5: 'Доступ: Техника' },
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12, col1: 'Риск: 35%', col2: 'Штраф: 120k', col3: 'Бонус: +60%', col4: 'Скрытн: 40%', col5: 'Доступ: Теневой' },
    { id: 'falsified_docs', name: 'Липовые допуски', type: 'illegal', cost: 600000, reqLvl: 15, col1: 'Риск: 55%', col2: 'Штраф: 250k', col3: 'Бонус: +120%', col4: 'Скрытн: 20%', col5: 'Доступ: Синдикат' },
    { id: 'black_market', name: 'Черный коридор', type: 'illegal', cost: 1200000, reqLvl: 20, col1: 'Риск: 80%', col2: 'Штраф: 600k', col3: 'Бонус: +250%', col4: 'Скрытн: 10%', col5: 'Доступ: Элитный' }
];

const BACKGROUNDS_SHOP = [
    { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' },
    { id: 'bg_r2', name: 'Ночной траверз', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/HLhsyRKk/IMG-4514.jpg' },
    { id: 'bg_r3', name: 'Кибер-трасса 01', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/mVjJzRdV/IMG-4519.jpg' },
    { id: 'bg_r4', name: 'Цифровой горизонт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/rKGsR0VC/IMG-4520.jpg' },
    { id: 'bg_r5', name: 'Скоростной пульс', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/mCRj1msw/IMG-4523.jpg' },
    { id: 'bg_r6', name: 'Лазерный поток', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/v4Sr1x8s/IMG-4524.jpg' },
    { id: 'bg_e1', name: 'Глубокий синий неоновый', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/5CxBvqG/IMG-4527.jpg' },
    { id: 'bg_e2', name: 'Фиолетовый шторм', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/hSXZxCJ/IMG-4528.jpg' },
    { id: 'bg_e3', name: 'Квантовый варп', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/PGCmhw0V/IMG-4522.jpg' },
    { id: 'bg_e4', name: 'Глитч-драйв', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/wkxt4Kd/IMG-4517.jpg' },
    { id: 'bg_m1', name: 'Астральный тоннель', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/kg81Wjdv/IMG-4525.jpg' },
    { id: 'bg_m2', name: 'Сверхсветовой прыжок', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/39rfWGkn/IMG-4516.jpg' },
    { id: 'bg_m3', name: 'Матричный пульс', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/s9ZnK8ss/IMG-4521.jpg' },
    { id: 'bg_l1', name: 'Абсолютный кибернетиз', rarity: 'legendary', chance: 2.0, image: 'https://i.ibb.co.com/KjbxLkzJ/IMG-4529.jpg' },
    { id: 'bg_l2', name: 'Ядро синдиката', rarity: 'legendary', chance: 2.0, image: 'https://i.ibb.co.com/23WZ4t1D/IMG-4526.jpg' },
    { id: 'bg_l3', name: 'Транспортный бог', rarity: 'legendary', chance: 1.0, image: 'https://i.ibb.co.com/mV8CH1jr/IMG-4518.jpg' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

const ReputationSys = {
    getTitle(level) {
        if (level < 5) return 'Частник-одиночка'; if (level < 10) return 'Вольный водитель';
        if (level < 15) return 'Опытный дальнобойщик'; if (level < 20) return 'Владелец автопарка';
        if (level < 30) return 'Босс логистики'; if (level < 40) return 'Теневой барон';
        if (level < 50) return 'Глобальный оператор'; return 'Транспортный магнат';
    }
};

const AudioSys = {
    musicOn: false,
    sfxOn: true,
    bgm: document.getElementById('bg-music'),
    sfxElements: {
        click: document.getElementById('sfx-click'),
        success: document.getElementById('sfx-success'),
        error: document.getElementById('sfx-error'),
        engine: document.getElementById('sfx-engine')
    },
    
    toggleMusic() {
        this.musicOn = !this.musicOn;
        const btn = document.getElementById('btn-music');
        if (this.musicOn) {
            if (this.bgm) {
                this.bgm.volume = 0.3;
                this.bgm.play().then(() => { if (btn) btn.innerText = "Включено 🔊"; }).catch(e => {
                    this.musicOn = false; if (btn) btn.innerText = "Выключено 🔇";
                });
            }
        } else {
            if (this.bgm) this.bgm.pause();
            if (btn) btn.innerText = "Выключено 🔇";
        }
        this.playVibrate('click'); this.playSFX('click');
    },

    toggleSFX() {
        this.sfxOn = !this.sfxOn;
        const btn = document.getElementById('btn-sfx');
        if (btn) btn.innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇";
        this.playVibrate('click'); this.playSFX('click');
    },

    playSFX(type) {
        if (!this.sfxOn) return;
        const sound = this.sfxElements[type];
        if (sound) {
            sound.currentTime = 0; sound.volume = 0.6;
            sound.play().catch(e => console.log('SFX blocked:', e));
        }
    },

    playVibrate(type = 'success') {
        if (!this.sfxOn || !tg.HapticFeedback) return;
        if(type === 'success') tg.HapticFeedback.notificationOccurred('success');
        if(type === 'error') tg.HapticFeedback.notificationOccurred('error');
        if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium');
    }
};

const MapSys = {
    currentRegion: 'all',
    selectRegion(regionId) {
        this.currentRegion = regionId;
        AudioSys.playSFX('click'); AudioSys.playVibrate('click');
        document.querySelectorAll('.map-node').forEach(el => el.classList.remove('active-node'));
        const activeNode = document.querySelector(`.node-${regionId}`);
        if(activeNode) activeNode.classList.add('active-node');

        const regionNames = {
            'all': '📍 Все контракты', 'hub': '📦 Базовый Хаб (Обычные)',
            'chem': '☣️ Хим-Завод (Опасные)', 'heavy': '🏗️ Промзона (Негабарит)',
            'shadow': '🥷 Теневой Порт (Нелегал)'
        };
        UI.safeUpdate('selected-region-title', regionNames[regionId] || regionNames['all']);
        UI.renderAll();
    },
    getFilteredContracts() {
        if (this.currentRegion === 'all') return AppState.contracts;
        return AppState.contracts.filter(c => {
            if (this.currentRegion === 'hub') return c.reqLic === 'basic';
            if (this.currentRegion === 'chem') return c.reqLic === 'dangerous';
            if (this.currentRegion === 'heavy') return c.reqLic === 'oversized';
            if (this.currentRegion === 'shadow') return ['smuggling', 'falsified_docs', 'black_market'].includes(c.reqLic);
            return true;
        });
    }
};

const NotificationSys = {
    async sendTelegramPush(message) {
        try {
            console.log(`[PUSH NOTIFICATION TO TG: ${telegramId}]: ${message}`);
            // await fetch('https://YOUR_SUPABASE.supabase.co/functions/v1/send-tg-push', { ... });
        } catch (e) { console.error('Ошибка отправки Push', e); }
    }
};

const AdminSys = {
    isAdmin() { return AppState.player.name === 'TSYBUSS' || AppState.player.is_admin === true; },
    checkAdminAccess() {
        const nameInput = AppState.player.name; const adminCard = document.getElementById('admin-panel-card');
        if (!adminCard) return;
        if (nameInput === 'TSYBUSS' || nameInput === 'AdminPass2026') {
            adminCard.style.display = 'block';
            if (nameInput === 'AdminPass2026') AppState.player.name = 'TSYBUSS';
        } else adminCard.style.display = 'none';
    },
    addMoney(amount) { if (!this.isAdmin()) return; AppState.player.money += amount; DB.syncPlayer(); UI.showToast(`[ADMIN] Зачислено ${amount.toLocaleString()} 🪙`, 'success'); UI.renderAll(); },
    addFuel(amount) { if (!this.isAdmin()) return; AppState.player.fuel_stock += amount; DB.syncPlayer(); UI.showToast(`[ADMIN] Зачислено ${amount}л топлива`, 'success'); UI.renderAll(); },
    setLevel(lvl) { if (!this.isAdmin()) return; AppState.player.level = lvl; AppState.player.pass_level = Math.max(AppState.player.pass_level, lvl); DB.syncPlayer(); UI.showToast(`[ADMIN] Установлен уровень ${lvl}`, 'success'); UI.renderAll(); },
    unlockAll() {
        if (!this.isAdmin()) return;
        AppState.player.licenses = LICENSES_SHOP.map(l => l.id); AppState.player.unlocked_backgrounds = BACKGROUNDS_SHOP.map(b => b.id);
        TRUCK_SHOP.forEach(shopT => {
            if (!AppState.trucks.some(t => t.name === shopT.name)) {
                AppState.trucks.push({ id: 'admin_' + Math.random(), player_id: AppState.player.id, name: shopT.name, capacity: shopT.capacity, fuel_use: shopT.fuel_use, rarity: shopT.rarity, custom_plate: '456LWO|10', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100, engineLvlUpgrade: 0, tiresLvlUpgrade: 0, gearLvlUpgrade: 0, brakesLvlUpgrade: 0 });
            }
        });
        DB.syncPlayer(); UI.showToast('[ADMIN] Все разблокировано!', 'success'); UI.renderAll();
    }
};

const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    marketEvent: { name: 'Стабильность', effect: 'none', multiplier: 1.0 },
    generateWeather() {
        const types = [{ name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 }, { name: '🔥 Жара', timeMod: 1.0, fuelMod: 1.2, wearMod: 1.2 }, { name: '🌨 Снег', timeMod: 1.3, fuelMod: 1.1, wearMod: 1.4 }, { name: '🌧 Ливень', timeMod: 1.1, fuelMod: 1.0, wearMod: 1.5 }];
        this.weather = types[Math.floor(Math.random() * types.length)]; UI.safeUpdate('weather-info', this.weather.name);
    },
    generateMarketEvent() {
        const events = [{ name: '⚖️ Стабильность', effect: 'none', multiplier: 1.0, desc: "Рынок стабилен." }, { name: '📈 Строительный бум', effect: 'Стройматериалы', multiplier: 1.5, desc: "Спрос на стройматериалы вырос!" }, { name: '⚡ Кризис микрочипов', effect: 'Электроника', multiplier: 1.8, desc: "Дефицит электроники!" }, { name: '🛢 Топливный кризис', effect: 'fuel_price', multiplier: 2.0, desc: "Цены на топливо взлетели!" }];
        this.marketEvent = events[Math.floor(Math.random() * events.length)];
        const banner = document.getElementById('global-event-banner'), title = document.getElementById('global-event-title'), desc = document.getElementById('global-event-desc');
        if (banner && desc && title) {
            if (this.marketEvent.effect === 'none') banner.style.display = 'none';
            else { banner.style.display = 'block'; title.innerText = this.marketEvent.name; desc.innerText = this.marketEvent.desc; AIDispatcher.showPopup(`Внимание: ${this.marketEvent.name}!`); }
        }
        if (this.marketEvent.effect === 'fuel_price') { AppState.player.fuel_price = Math.floor(AppState.player.fuel_price * this.marketEvent.multiplier); UI.renderAll(); }
    }
};

const EventSys = {
    activeEvent: null, timerInterval: null,
    checkEventsForTrip(trip) {
        if (this.activeEvent) return;
        let luckMod = 1.0;
        if (AppState.player.skills && AppState.player.skills.luck) luckMod -= AppState.player.skills.luck * 0.1;
        if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) luckMod -= (AppState.syndicateData.techs.security || 0) * 0.05;
        const chance = Math.random() / Math.max(0.2, luckMod);
        if (chance < 0.12) this.triggerEvent(trip, 'customs'); else if (chance < 0.25) this.triggerEvent(trip, 'breakdown'); else if (chance < 0.38) this.triggerEvent(trip, 'weather_traffic'); else if (chance < 0.45) this.triggerEvent(trip, 'accident');
    },
    triggerEvent(trip, type) {
        const tripTruck = AppState.trucks.find(t => String(t.id) === String(trip.truck_id));
        const truckName = tripTruck ? tripTruck.name : 'Тягач';
        let eventData = { tripId: trip.id, type: type, timeLeft: 30, title: '', desc: '', choices: [] };
        switch(type) {
            case 'breakdown': eventData.title = `🛠 Поломка: ${truckName}`; eventData.desc = `Узел машины не выдержал. Рейс заморожен!`; eventData.choices = [{ id: 1, text: 'Мобильный ремкомплект (Беспл)', action: () => EventSys.resolveEvent('breakdown_kit') }, { id: 2, text: 'Вызвать эвакуатор (-15k 🪙)', action: () => EventSys.resolveEvent('breakdown_tow') }, { id: 3, text: 'Бросить машину', action: () => EventSys.resolveEvent('breakdown_abandon') }]; break;
            case 'weather_traffic': eventData.title = `🌧 Дорожный затор`; eventData.desc = `Колонна встала. Скорость упала.`; eventData.choices = [{ id: 1, text: 'Объехать по платной (-5k 🪙)', action: () => EventSys.resolveEvent('traffic_toll') }, { id: 2, text: 'Переждать', action: () => EventSys.resolveEvent('traffic_wait') }, { id: 3, text: 'Рискнуть', action: () => EventSys.resolveEvent('traffic_rush') }]; break;
            case 'accident': eventData.title = `💥 ДТП!`; eventData.desc = `Машина в аварии, груз поврежден.`; eventData.choices = [{ id: 1, text: 'Страховка (80% ущерба)', action: () => EventSys.resolveEvent('accident_insured') }, { id: 2, text: 'Своими силами (-50k 🪙)', action: () => EventSys.resolveEvent('accident_raw') }]; break;
            case 'customs': eventData.title = `🚨 Таможня`; eventData.desc = `Патруль требует досмотр.`; eventData.choices = [{ id: 1, text: 'Взятка (-25k 🪙)', action: () => EventSys.resolveEvent('customs_bribe') }, { id: 2, text: 'Прорваться', action: () => EventSys.resolveEvent('customs_break') }, { id: 3, text: 'Досмотр', action: () => EventSys.resolveEvent('customs_legal') }]; break;
        }
        this.activeEvent = eventData; this.renderEventModal(); this.startEventTimer(); AIDispatcher.showPopup(`⚠️ Внимание! Форс-мажор!`);
    },
    startEventTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.activeEvent) { clearInterval(this.timerInterval); return; }
            this.activeEvent.timeLeft--; UI.safeUpdate('event-timer-badge', `⏳ ${this.activeEvent.timeLeft}с`);
            if (this.activeEvent.timeLeft <= 0) { clearInterval(this.timerInterval); this.handleTimeout(); }
        }, 1000);
    },
    handleTimeout() { UI.showToast('Время истекло!', 'error'); this.closeEventModal(); AppState.player.money = Math.max(0, AppState.player.money - 10000); DB.syncPlayer(); UI.renderAll(); },
    resolveEvent(actionId) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        switch(actionId) {
            case 'breakdown_kit': UI.showToast('Ремонт успешен!', 'success'); break;
            case 'breakdown_tow': if (AppState.player.money < 15000) UI.showToast('Нет средств!', 'error'); else { AppState.player.money -= 15000; UI.showToast('Эвакуатор вызван', 'info'); } break;
            case 'breakdown_abandon': UI.showToast('Машина брошена.', 'error'); AppState.player.total_profit = Math.max(0, AppState.player.total_profit - 5000); break;
            case 'traffic_toll': if (AppState.player.money >= 5000) { AppState.player.money -= 5000; UI.showToast('Платка пройдена', 'success'); } else UI.showToast('Нет денег!', 'error'); break;
            case 'traffic_wait': UI.showToast('Переждали', 'info'); break;
            case 'traffic_rush': if (Math.random() > 0.5) UI.showToast('Проскочили!', 'success'); else UI.showToast('Авария!', 'error'); break;
            case 'accident_insured': UI.showToast('Страховка покрыла 80%', 'success'); break;
            case 'accident_raw': AppState.player.money = Math.max(0, AppState.player.money - 50000); UI.showToast('Огромный штраф выплачен!', 'error'); break;
            case 'customs_bribe': if (AppState.player.money >= 25000) { AppState.player.money -= 25000; UI.showToast('Откупились.', 'success'); } else UI.showToast('Мало денег! Штраф.', 'error'); break;
            case 'customs_break': if (Math.random() > 0.6) UI.showToast('Удачный прорыв!', 'success'); else { UI.showToast('Погоня! Штраф.', 'error'); AppState.player.money = Math.max(0, AppState.player.money - 80000); } break;
            case 'customs_legal': UI.showToast('Досмотр пройден.', 'success'); break;
        }
        this.closeEventModal(); DB.syncPlayer(); UI.renderAll();
    },
    renderEventModal() {
        let ex = document.getElementById('event-modal'); if (ex) ex.remove();
        const ev = this.activeEvent; if (!ev) return;
        const modalHtml = `<div id="event-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);"><div class="card" style="width:100%;max-width:400px;border-color:var(--accent-pink);box-shadow:0 0 30px rgba(236,72,153,0.3);"><div class="card-title" style="display:flex;justify-content:space-between;align-items:center;"><span style="color:var(--accent-pink);">${ev.title}</span><span id="event-timer-badge" style="background:rgba(236,72,153,0.2);padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold;">⏳ ${ev.timeLeft}с</span></div><p style="font-size:13px;color:var(--hint-color);margin:12px 0 16px 0;line-height:1.4;">${ev.desc}</p><div style="display:flex;flex-direction:column;gap:8px;">${ev.choices.map((choice, idx) => `<button type="button" class="btn btn-outline" style="text-align:left;font-size:12px;padding:10px;border-color:var(--accent-blue);color:#fff;" onclick="EventSys.resolveEvent('${['breakdown_kit','breakdown_tow','breakdown_abandon','traffic_toll','traffic_wait','traffic_rush','accident_insured','accident_raw','customs_bribe','customs_break','customs_legal'][idx]}')">👉 ${choice.text}</button>`).join('')}</div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    closeEventModal() { const modal = document.getElementById('event-modal'); if (modal) modal.remove(); this.activeEvent = null; if (this.timerInterval) clearInterval(this.timerInterval); }
};

const BackgroundCaseSys = {
    isOpening: false,
    openCase() {
        if (this.isOpening) return;
        const cost = CONFIG.CASE_COST;
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');
        this.isOpening = true; AppState.player.money -= cost; DB.syncPlayer(); UI.renderAll();
        this.showOpeningAnimation();
        let roll = Math.random() * 100, cumulative = 0, selectedBg = BACKGROUNDS_SHOP[0];
        for (let bg of BACKGROUNDS_SHOP) { cumulative += bg.chance; if (roll <= cumulative) { selectedBg = bg; break; } }
        if (!AppState.player.unlocked_backgrounds) AppState.player.unlocked_backgrounds = ['bg_r1'];
        let isDuplicate = AppState.player.unlocked_backgrounds.includes(selectedBg.id), rewardText = '';
        if (isDuplicate) { AppState.player.money += CONFIG.DUPLICATE_COINS; GameLogic.addXP(CONFIG.DUPLICATE_XP); rewardText = `Дубликат! Выпал фон "${selectedBg.name}". +1M 🪙 и +10k XP!`; } 
        else { AppState.player.unlocked_backgrounds.push(selectedBg.id); AppState.player.current_background = selectedBg.id; rewardText = `🎉 Вы выиграли новый фон: "${selectedBg.name}"!`; }
        DB.syncPlayer();
        setTimeout(() => {
            const m = document.getElementById('case-opening-modal'); if (m) m.remove();
            document.body.insertAdjacentHTML('beforeend', '<div class="flash-bang" id="flash-bang-effect"></div>');
            AudioSys.playVibrate('success'); AudioSys.playSFX('success');
            this.showCaseResultModal(selectedBg, isDuplicate, rewardText);
            UI.renderAll(); this.isOpening = false;
            setTimeout(() => { const f = document.getElementById('flash-bang-effect'); if (f) f.remove(); }, 1500);
        }, 2500);
    },
    showOpeningAnimation() {
        let ex = document.getElementById('case-opening-modal'); if (ex) ex.remove();
        const m = `<div id="case-opening-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;backdrop-filter:blur(15px);"><h2 style="color:#fff;margin-bottom:40px;font-weight:900;letter-spacing:2px;">РАСПАКОВКА...</h2><div class="case-opening-anim" style="width:120px;height:120px;background:var(--gradient-primary);border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(236,72,153,0.5);border:2px solid rgba(255,255,255,0.2);"><span style="font-size:60px;">🎁</span></div><p style="color:var(--hint-color);margin-top:50px;font-size:12px;text-transform:uppercase;">Дешифровка данных...</p></div>`;
        document.body.insertAdjacentHTML('beforeend', m);
        let vCount = 0, vInt = setInterval(() => { if (vCount >= 8 || !this.isOpening) clearInterval(vInt); else { AudioSys.playVibrate('click'); AudioSys.playSFX('click'); vCount++; } }, 300);
    },
    showCaseResultModal(bg, isDup, text) {
        let ex = document.getElementById('case-modal'); if (ex) ex.remove();
        let glow = bg.rarity==='legendary'?'rgba(245,158,11,0.6)':bg.rarity==='mythic'?'rgba(139,92,246,0.6)':bg.rarity==='rare'?'rgba(59,130,246,0.5)':'rgba(236,72,153,0.4)';
        const m = `<div id="case-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(12px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-pink);text-align:center;box-shadow:0 0 50px ${glow};" onclick="event.stopPropagation()"><h3 style="color:#fff;font-size:20px;margin-bottom:15px;font-weight:900;">${isDup ? '🔄 ДУБЛИКАТ' : '✨ НОВЫЙ ФОН!'}</h3><div style="width:100%;height:160px;border-radius:12px;overflow:hidden;margin-bottom:16px;border:2px solid rgba(255,255,255,0.1);position:relative;"><img src="${bg.image}" style="width:100%;height:100%;object-fit:cover;"><div style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.8);padding:4px 10px;border-radius:6px;font-size:11px;font-weight:900;text-transform:uppercase;color:#fff;border-left:3px solid var(--accent-pink);">${bg.rarity}</div></div><h4 style="color:var(--accent-pink);font-size:18px;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">${bg.name}</h4><p style="font-size:13px;color:var(--hint-color);margin-bottom:20px;line-height:1.5;padding:0 10px;">${text}</p><button class="btn btn-primary" style="padding:14px;font-size:14px;text-transform:uppercase;" onclick="document.getElementById('case-modal').remove()">Отлично</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', m);
    },
    setBackground(bgId) { if (!AppState.player.unlocked_backgrounds.includes(bgId)) return; AppState.player.current_background = bgId; DB.syncPlayer(); UI.showToast('Фон профиля изменен!', 'success'); UI.renderAll(); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], quests: [{ id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false }, { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false }, { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }], skills: { eco: 0, luck: 0, mechanic: 0 }, total_fuel_burned: 0, playtime_minutes: 0, reg_date: new Date().toISOString() },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: ["Системный лог инициализирован..."] },
    trucks: [], activeTrips: [], leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/nxzLBSw/0-B0-F3-ED8-68-F9-4-D11-9455-63-CEE59-DEC70.png', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Обычный: Продукты', name: 'Продукты', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/YBMmXNHj/74065-E6-B-D63-E-446-D-A8-E1-95492-C930-D70.png', reward: 8900, fuel: 100, duration: 22, reqLvl: 2, reqLic: 'basic' },
        { id: 3, title: 'Обычный: Строймат', name: 'Строймат', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/Q7ggLnTC/82669679-96-F8-46-A1-9-AE1-BBFEAD007153.png', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 4, title: 'Обычный: Текстиль', name: 'Текстиль', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/67TNNkvy/67872-D1-B-C0-D3-45-AB-8-A9-D-11-C0-EC734-FC8.png', reward: 18000, fuel: 180, duration: 45, reqLvl: 4, reqLic: 'basic' },
        { id: 5, title: 'Обычный: Электроника', name: 'Электроника', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/bThvzjv/12-AF1-E99-6-BDE-42-F0-8279-393-B53-DD51-EC.png', reward: 25000, fuel: 220, duration: 60, reqLvl: 5, reqLic: 'basic' },
        { id: 6, title: 'Опасный: Химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/DPLBSsd9/80-EEB782-572-C-402-C-B9-A2-AD4-DBFC19357.png', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous' },
        { id: 7, title: 'Опасный: Горючее', name: 'Горючее', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/ZpJQfZ7K/70-EDCB4-B-C9-F6-4633-9-C7-C-C0-BB8580-A3-BA.png', reward: 65000, fuel: 500, duration: 240, reqLvl: 8, reqLic: 'dangerous' },
        { id: 8, title: 'Опасный: Изотопы', name: 'Изотопы', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/SwyTHN19/E78-A4-D7-B-DBC1-4-F71-A4-DE-44-D446503-BB2.png', reward: 95000, fuel: 750, duration: 300, reqLvl: 10, reqLic: 'dangerous' },
        { id: 9, title: 'Негабарит: Спецтехника', name: 'Спецтехника', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/WvL7611N/9-BFBF2-DE-90-B2-4970-84-CC-C3-A98248-B0-CE.png', reward: 150000, fuel: 1000, duration: 600, reqLvl: 12, reqLic: 'oversized' },
        { id: 10, title: 'Негабарит: Турбины', name: 'Турбины', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/zh98DKMm/17-A3-CEB6-372-A-4-EDB-B73-D-455839-F0349-A.png', reward: 280000, fuel: 1500, duration: 1200, reqLvl: 15, reqLic: 'oversized' },
        { id: 11, title: 'Негабарит: Космос', name: 'Космос', diff: 'Легенда', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/C5hBkM7k/DB75-BFE6-2-BE7-44-CF-ADC7-2799-D8-BBFB0-E.png', reward: 500000, fuel: 2500, duration: 1800, reqLvl: 18, reqLic: 'oversized' },
        { id: 12, title: 'Теневой: Алкоголь', name: 'Контрабанда', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/1GcDdFJ9/D19-A33-BF-999-E-4-B0-F-8-D66-C3714-FCA6163.png', reward: 220000, fuel: 1200, duration: 900, reqLvl: 12, reqLic: 'smuggling' },
        { id: 13, title: 'Теневой: Военка', name: 'Военка', diff: 'Легенда', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/mrSV75fk/AB71-CD39-0-F80-4-ED6-9-BE3-DF083613-E834.png', reward: 380000, fuel: 1600, duration: 1300, reqLvl: 14, reqLic: 'smuggling' },
        { id: 14, title: 'Черный рынок: Груз', name: 'Синдикат. груз', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/0RwFRJ9t/5-C46-E8-C8-8203-4832-BEFF-03-C668616-B82.png', reward: 450000, fuel: 1800, duration: 1500, reqLvl: 15, reqLic: 'falsified_docs' },
        { id: 15, title: 'Черный рынок: Чипы', name: 'Партия чипов', diff: 'Легенда', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/p68qv2R2/2815771-C-7-AA5-45-B5-8700-F2-BD55-D19-DE0.png', reward: 750000, fuel: 2400, duration: 2100, reqLvl: 18, reqLic: 'falsified_docs' },
        { id: 16, title: 'Секретно: Оружие', name: 'Прототипы', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/Hf6fFHCL/D70-EB30-C-6520-441-B-8-D1-E-1-C9763-AB202-C.png', reward: 1300000, fuel: 3500, duration: 3000, reqLvl: 22, reqLic: 'black_market' }
    ]
};

const AIDispatcher = {
    messages: ["Следите за износом деталей!", "Цены на топливо меняются динамически.", "Прокачайте узлы тягача.", "Выполняйте квесты.", "Смените фон профиля."],
    showPopup(msg) { const el = document.getElementById('ai-dispatcher'); if (!el) return; document.getElementById('ai-message').innerText = msg; el.classList.add('show'); AudioSys.playVibrate('info'); setTimeout(() => el.classList.remove('show'), 5000); },
    randomAdvice() { if(Math.random() > 0.6) this.showPopup(this.messages[Math.floor(Math.random() * this.messages.length)]); }
};

const DB = {
    async init() {
        try {
            let { data: existingPlayer, error: searchError } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (searchError) throw searchError;
            const defQ = [{ id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false }, { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false }, { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }];
            if (!existingPlayer) await this.createNewPlayer();
            else {
                AppState.player = { ...AppState.player, ...existingPlayer };
                if (!AppState.player.pass_level) AppState.player.pass_level = 1; if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
                if (!AppState.player.quests || !Array.isArray(AppState.player.quests)) AppState.player.quests = defQ;
                if (!AppState.player.skills) AppState.player.skills = { eco: 0, luck: 0, mechanic: 0 };
                if (!AppState.player.current_background) AppState.player.current_background = 'bg_r1'; if (!AppState.player.unlocked_backgrounds) AppState.player.unlocked_backgrounds = ['bg_r1'];
                if (AppState.player.total_fuel_burned === undefined) AppState.player.total_fuel_burned = 0; if (AppState.player.playtime_minutes === undefined) AppState.player.playtime_minutes = 0;
                if (!AppState.player.reg_date) AppState.player.reg_date = new Date().toISOString();
                if (AppState.player.syndicate_data) AppState.syndicateData = { ...AppState.syndicateData, ...AppState.player.syndicate_data };
            }
            await this.loadGameData(); await this.loadLeaderboard(); AdminSys.checkAdminAccess(); UI.renderAll();
        } catch (err) { UI.showToast("Ошибка соединения: " + err.message, "error"); }
    },
    async createNewPlayer() {
        let stM = 100000, stF = 400; const refId = tg.initDataUnsafe?.start_param;
        if (refId && String(refId) !== String(telegramId)) { stM += 50000; stF += 500; this.rewardReferrer(refId); }
        let pay = { telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: stM, fuel_stock: stF, level: AppState.player.level, xp: AppState.player.xp, total_trips: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], quests: AppState.player.quests, skills: { eco: 0, luck: 0, mechanic: 0 }, total_fuel_burned: 0, playtime_minutes: 0, reg_date: new Date().toISOString(), syndicate_data: AppState.syndicateData };
        let { data: newP, error } = await supabaseClient.from('players').insert([pay]).select().single();
        if (error) { delete pay.quests; delete pay.skills; delete pay.syndicate_data; let { data: fP } = await supabaseClient.from('players').insert([pay]).select().single(); AppState.player = { ...AppState.player, ...fP, quests: AppState.player.quests, skills: { eco: 0, luck: 0, mechanic: 0 } }; }
        else if (newP) AppState.player = { ...AppState.player, ...newP };
    },
    async rewardReferrer(refId) {
        try { let { data: rU } = await supabaseClient.from('players').select('id, money, fuel_stock').eq('telegram_id', Number(refId)).single(); if (rU) await supabaseClient.from('players').update({ money: Number(rU.money) + 50000, fuel_stock: Number(rU.fuel_stock) + 500 }).eq('id', rU.id); } catch (e) {}
    },
    async loadGameData() {
        try {
            const [tRes, trRes] = await Promise.all([supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id), supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)]);
            AppState.trucks = tRes.data || []; AppState.activeTrips = trRes.data || [];
            AppState.trucks.forEach(t => { if (!t.custom_plate) t.custom_plate = '456LWO|10'; if (t.engineLvl === undefined) t.engineLvl = 100; if (t.tiresLvl === undefined) t.tiresLvl = 100; if (t.gearLvl === undefined) t.gearLvl = 100; if (t.brakesLvl === undefined) t.brakesLvl = 100; if (t.engineLvlUpgrade === undefined) t.engineLvlUpgrade = 0; if (t.tiresLvlUpgrade === undefined) t.tiresLvlUpgrade = 0; if (t.gearLvlUpgrade === undefined) t.gearLvlUpgrade = 0; if (t.brakesLvlUpgrade === undefined) t.brakesLvlUpgrade = 0; });
        } catch (e) {}
    },
    async loadLeaderboard() {
        try { const sf = AppState.leaderboardCategory === 'trips' ? 'total_trips' : 'total_profit'; const { data, error } = await supabaseClient.from('players').select('id, name, avatar, total_profit, total_trips, level, syndicate, prev_rank, current_background').order(sf, { ascending: false }).limit(50); if (!error && data) AppState.leaderboard = data; } catch (e) {}
    },
    async syncPlayer() {
        const p = AppState.player; if (!p.id) return; if (!p.skills) p.skills = { eco: 0, luck: 0, mechanic: 0 };
        let uD = { name: p.name, avatar: p.avatar, money: Number(p.money), fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price), level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), syndicate: p.syndicate, last_bonus_time: Number(p.last_bonus_time), licenses: p.licenses, pass_level: p.pass_level, pass_claimed: p.pass_claimed, current_background: p.current_background, unlocked_backgrounds: p.unlocked_backgrounds, quests: p.quests, skills: p.skills, total_fuel_burned: Number(p.total_fuel_burned || 0), playtime_minutes: Number(p.playtime_minutes || 0), reg_date: p.reg_date || new Date().toISOString(), syndicate_data: AppState.syndicateData };
        let { error } = await supabaseClient.from('players').update(uD).eq('id', p.id);
        if (error) { delete uD.quests; delete uD.skills; delete uD.syndicate_data; await supabaseClient.from('players').update(uD).eq('id', p.id); }
        this.loadLeaderboard();
    }
};

const GameLogic = {
    isFinishing: false,
    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    async addXP(amount) {
        AppState.player.xp = Number(AppState.player.xp) + Number(amount); let req = this.getReqXP(AppState.player.level), lu = false;
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; AppState.player.pass_level++; req = this.getReqXP(AppState.player.level); lu = true; }
        if (lu) UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success');
    },
    updateQuestProgress(type, amount) { if (!AppState.player.quests) return; AppState.player.quests.forEach(q => { if (q.claimed) return; if (type === 'trips' && q.id === 'q1') q.progress = Math.min(q.target, q.progress + amount); if (type === 'fuel' && q.id === 'q2') q.progress = Math.min(q.target, q.progress + amount); if (type === 'profit' && q.id === 'q3') q.progress = Math.min(q.target, q.progress + amount); }); },
    claimQuest(qId) { const q = AppState.player.quests.find(i => i.id === qId); if (!q || q.claimed || q.progress < q.target) return; q.claimed = true; AppState.player.money += q.rewardCoins; this.addXP(q.rewardXP); DB.syncPlayer(); UI.showToast(`Квест выполнен! +${q.rewardCoins.toLocaleString()} 🪙`, 'success'); UI.renderAll(); },
    async buyTruck(shopId) {
        const t = TRUCK_SHOP.find(x => x.id === shopId); if (!t) return;
        if (AppState.trucks.some(x => x.name === t.name)) return UI.showToast('Этот транспорт уже есть!', 'error');
        if (AppState.player.money < t.price) return UI.showToast(`Нужно ${t.price.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= t.price;
        let { data, error } = await supabaseClient.from('trucks').insert([{ player_id: AppState.player.id, name: t.name, capacity: t.capacity, fuel_use: t.fuel_use, rarity: t.rarity, custom_plate: '456LWO|10', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100, engineLvlUpgrade: 0, tiresLvlUpgrade: 0, gearLvlUpgrade: 0, brakesLvlUpgrade: 0 }]).select().single();
        if (error) return UI.showToast("Ошибка при покупке", "error");
        AppState.trucks.push(data); await DB.syncPlayer(); UI.showToast(`Куплен новый транспорт: ${t.name}!`, 'success'); UI.renderAll();
    },
    openPlateModal(truckId) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        let ex = document.getElementById('plate-modal'); if (ex) ex.remove();
        const cost = 25000;
        const h = `<div id="plate-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-purple);text-align:center;" onclick="event.stopPropagation()"><h3 style="color:#fff;font-size:16px;margin-bottom:8px;">Госномер</h3><input type="text" id="custom-plate-input" value="${t.custom_plate || '456LWO|10'}" maxlength="10" style="width:100%;padding:10px;background:#000;border:1px solid var(--border-color);color:#fff;text-align:center;font-size:16px;font-weight:bold;border-radius:8px;margin-bottom:12px;text-transform:uppercase;" /><div style="font-size:11px;color:var(--accent-pink);margin-bottom:14px;">Стоимость: ${cost.toLocaleString()} 🪙</div><div style="display:flex;gap:8px;"><button type="button" class="btn btn-outline" style="flex:1;font-size:12px;" onclick="document.getElementById('plate-modal').remove()">Отмена</button><button type="button" class="btn btn-primary" style="flex:1;font-size:12px;" onclick="GameLogic.saveCustomPlate('${t.id}', ${cost})">Сохранить</button></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', h);
    },
    async saveCustomPlate(truckId, cost) {
        const inp = document.getElementById('custom-plate-input'); if (!inp) return;
        const np = inp.value.trim().toUpperCase(); if (np.length < 3) return UI.showToast('Слишком короткий номер!', 'error');
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        AppState.player.money -= cost; t.custom_plate = np;
        await supabaseClient.from('trucks').update({ custom_plate: np }).eq('id', t.id);
        await DB.syncPlayer(); const m = document.getElementById('plate-modal'); if (m) m.remove();
        UI.showToast(`Госномер изменен!`, 'success'); UI.renderAll();
    },
    getRepairCost(val) { if (val >= 100) return 0; const m = 100 - val; if (val >= 50) return m * 150; if (val >= 20) return m * 250; return (m * 400); },
    async repairPart(truckId, pName) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        const cVal = Number(t[pName]) || 0; if (cVal >= 100) return UI.showToast('Идеально!', 'info');
        const rc = this.getRepairCost(cVal); if (AppState.player.money < rc) return UI.showToast(`Нужно ${rc.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= rc; t[pName] = 100;
        await supabaseClient.from('trucks').update({ [pName]: 100 }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast(`Отремонтировано за ${rc.toLocaleString()} 🪙!`, 'success'); UI.renderAll();
    },
    async repairAll(truckId) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        const pts = ['engineLvl', 'tiresLvl', 'gearLvl', 'brakesLvl']; let tc = 0, nr = false;
        pts.forEach(p => { const v = Number(t[p]) || 0; if (v < 100) { nr = true; tc += this.getRepairCost(v); } });
        if (!nr) return UI.showToast('Полностью исправен!', 'info');
        const fc = Math.floor(tc * 0.9); if (AppState.player.money < fc) return UI.showToast(`Нужно ${fc.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= fc; pts.forEach(p => t[p] = 100);
        await supabaseClient.from('trucks').update({ engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast(`Комплексное ТО выполнено! (Скидка 10%)`, 'success'); UI.renderAll();
    },
    async upgradeTruckPart(truckId, pName) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        const uk = pName + 'Upgrade'; if (t[uk] === undefined) t[uk] = 0;
        if (t[uk] >= 5) return UI.showToast('Прокачано на максимум!', 'info');
        const c = 25000 * (t[uk] + 1); if (AppState.player.money < c) return UI.showToast(`Нужно ${c.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= c; t[uk] += 1;
        await supabaseClient.from('trucks').update({ [uk]: t[uk] }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast(`Тюнинг установлен!`, 'success'); UI.renderAll();
    },
    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует лицензия!', 'error');
        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !actIds.includes(t.id));
        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягачей!', 'error');
        const idleTruck = idleTrucks.find(t => t.engineLvl > 0 && t.tiresLvl > 0 && t.gearLvl > 0 && t.brakesLvl > 0);
        if (!idleTruck) return UI.showToast('⚠️ Все свободные тягачи сломаны!', 'error');

        if (WorldState.marketEvent.effect !== 'none' && title.includes(WorldState.marketEvent.effect)) reward = Math.floor(reward * WorldState.marketEvent.multiplier);
        if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) reward = Math.floor(reward * (1 + (AppState.syndicateData.techs.logistics || 0) * 0.04));
        let ecoMod = 1.0 - (AppState.player.skills?.eco || 0) * 0.05;
        let fFuel = Math.floor(fuel * WorldState.weather.fuelMod * ecoMod);
        let fDur = Math.floor(duration * WorldState.weather.timeMod);

        if (AppState.player.fuel_stock < fFuel) return UI.showToast(`Нужно ${fFuel}л!`, 'error');
        let endTime = Date.now() + (fDur * 1000);
        let { data, error } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: idleTruck.id, title: title, reward: reward, fuel_req: fFuel, end_time: endTime }]).select().single();
        if (error) return UI.showToast("Ошибка запуска", "error");

        AppState.player.fuel_stock -= fFuel; AppState.player.total_fuel_burned += fFuel; this.updateQuestProgress('fuel', fFuel);
        AppState.activeTrips.push(data); await DB.syncPlayer();
        UI.showToast(`Рейс начат на ${idleTruck.name}!`, 'success');
        AudioSys.playSFX('engine');
        UI.renderAll();
    },
    async finishTrip(tripId) {
        if (this.isFinishing) return;
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        const trip = AppState.activeTrips[tIdx]; this.isFinishing = true;
        let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
        AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1;
        this.updateQuestProgress('trips', 1); this.updateQuestProgress('profit', p);
        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t && trip.title !== 'Аренда: Сдана в прокат') {
            let mM = 1.0 - (AppState.player.skills?.mechanic || 0) * 0.1 - (AppState.syndicateData?.techs?.mechanic || 0) * 0.05;
            const w = Math.max(1, Math.floor((Math.floor(Math.random() * 6) + 5) * WorldState.weather.wearMod * mM));
            t.engineLvl = Math.max(0, t.engineLvl - Math.max(1, w - (t.engineLvlUpgrade || 0)));
            t.tiresLvl = Math.max(0, t.tiresLvl - Math.max(1, Math.floor(w + 3) - (t.tiresLvlUpgrade || 0)));
            t.gearLvl = Math.max(0, t.gearLvl - Math.max(1, w - (t.gearLvlUpgrade || 0)));
            t.brakesLvl = Math.max(0, t.brakesLvl - Math.max(1, Math.floor(w + 2) - (t.brakesLvlUpgrade || 0)));
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
        }
        await this.addXP(exp); await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); this.isFinishing = false; await DB.syncPlayer();
        
        if (trip.title === 'Аренда: Сдана в прокат') {
            UI.showToast(`Аренда завершена! +${p} 🪙`, 'success');
            NotificationSys.sendTelegramPush(`✅ Ваша фура вернулась из аренды! Заработано: ${p} 🪙`);
        } else {
            UI.showToast(`Рейс завершен! +${p} 🪙 | +${exp} XP`, 'success');
            NotificationSys.sendTelegramPush(`✅ Рейс "${trip.title}" завершен! Заработано: ${p} 🪙 и ${exp} XP`);
        }
        AIDispatcher.randomAdvice(); UI.renderAll();
    },
    async buyFuel(amt) {
        const c = Number(amt) * AppState.player.fuel_price;
        if (AppState.player.money < c) return UI.showToast('Недостаточно монет!', 'error');
        AppState.player.money -= c; AppState.player.fuel_stock += Number(amt);
        await DB.syncPlayer(); UI.showToast(`Куплено ${amt}л`, 'success'); UI.renderAll();
    },
    async claimDailyBonus() {
        let n = Date.now();
        if (n - AppState.player.last_bonus_time < CONFIG.BONUS_COOLDOWN_MS) {
            let hrs = Math.ceil((CONFIG.BONUS_COOLDOWN_MS - (n - AppState.player.last_bonus_time)) / 3600000);
            return UI.showToast(`Будет доступен через ${hrs} ч.`, 'error');
        }
        AppState.player.last_bonus_time = n; AppState.player.money += CONFIG.DAILY_BONUS_COINS; AppState.player.fuel_stock += CONFIG.DAILY_BONUS_FUEL;
        await DB.syncPlayer(); UI.showToast(`Бонус получен!`, 'success'); UI.renderAll();
    },
    async buyLicense(licId) {
        if (AppState.player.licenses.includes(licId)) return UI.showToast('Уже приобретена!', 'info');
        const l = LICENSES_SHOP.find(x => x.id === licId); if (!l) return;
        if (AppState.player.level < l.reqLvl) return UI.showToast(`Требуется ${l.reqLvl} уровень!`, 'error');
        if (AppState.player.money < l.cost) return UI.showToast(`Нужно ${l.cost.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= l.cost; AppState.player.licenses.push(licId);
        await DB.syncPlayer(); UI.showToast(`Лицензия получена!`, 'success'); UI.renderAll();
    },
    async saveProfile() {
        let nF = document.getElementById('input-username'); let n = nF ? nF.value.trim() : '';
        if (n) { AppState.player.name = n; AdminSys.checkAdminAccess(); }
        await DB.syncPlayer(); UI.showToast('Сохранено', 'success'); UI.renderAll();
    },
    handleAvatarUpload(ev) {
        const f = ev.target.files[0]; if (!f) return;
        if (f.size > 2*1024*1024) return UI.showToast('Файл слишком большой', 'error');
        const r = new FileReader(); r.onload = async (e) => { AppState.player.avatar = e.target.result; await DB.syncPlayer(); UI.showToast('Аватар изменен!', 'success'); UI.renderAll(); }; r.readAsDataURL(f);
    },
    claimPassReward(tLvl, cRew) {
        if (!AppState.player.pass_level) AppState.player.pass_level = 1; if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
        if (AppState.player.pass_level < tLvl) return UI.showToast('Уровень не достигнут!', 'error');
        if (AppState.player.pass_claimed.includes(tLvl)) return UI.showToast('Уже получена!', 'info');
        AppState.player.pass_claimed.push(tLvl); AppState.player.money += Number(cRew); DB.syncPlayer();
        UI.showToast(`Награда получена!`, 'success'); UI.renderAll();
    },
    updateMarket() { AppState.player.fuel_price = Math.floor(Math.random() * 15) + 8; UI.renderAll(); },
    async upgradeSkill(sKey) {
        if (!AppState.player.skills) AppState.player.skills = { eco: 0, luck: 0, mechanic: 0 };
        const cL = AppState.player.skills[sKey] || 0; if (cL >= 5) return UI.showToast('Максимум!', 'info');
        const c = 50000 * (cL + 1); if (AppState.player.money < c) return UI.showToast(`Нужно ${c.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= c; AppState.player.skills[sKey] = cL + 1;
        await DB.syncPlayer(); UI.showToast('Улучшено!', 'success'); UI.renderAll();
    },
    async rentOutTruck(truckId) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        if (t.engineLvl < 100 || t.tiresLvl < 100 || t.gearLvl < 100 || t.brakesLvl < 100) return UI.showToast('Только исправные (100%)!', 'error');
        const rT = 4 * 3600000, rew = Math.floor(t.capacity * 2), eT = Date.now() + rT;
        let { data, error } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: t.id, title: 'Аренда: Сдана в прокат', reward: rew, fuel_req: 0, end_time: eT }]).select().single();
        if (error) return UI.showToast("Ошибка аренды", "error");
        AppState.activeTrips.push(data); await DB.syncPlayer(); UI.showToast(`Сдана в аренду на 4ч!`, 'success'); UI.renderAll();
    },
    inviteFriend() { tg.openTelegramLink(`https://t.me/share/url?url=https://t.me/LogisticWorldBot/app?startapp=${telegramId}&text=Го в логистику!`); },
    async createSyndicate(n) {
        n = n.trim(); if (n.length < 3) return UI.showToast('Длиннее 3 символов', 'error');
        if (AppState.player.syndicate) return UI.showToast('Уже состоите!', 'error');
        if (AppState.player.money < 500000) return UI.showToast('Нужно 500k!', 'error');
        AppState.player.money -= 500000; AppState.player.syndicate = n; AppState.syndicateData = { name: n, level: 1, treasuryFuel: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: [`Создан синдикат "${n}"`] };
        await DB.syncPlayer(); UI.showToast(`Синдикат создан!`, 'success'); UI.renderAll();
    },
    async joinSyndicate(n) {
        n = n.trim(); if (!n) return UI.showToast('Введите название', 'error');
        if (AppState.player.syndicate === n) return UI.showToast('Уже здесь', 'info');
        if (AppState.player.syndicate) return UI.showToast('Покиньте текущий', 'error');
        AppState.player.syndicate = n; AppState.syndicateData.name = n; if (!AppState.syndicateData.feed) AppState.syndicateData.feed = []; AppState.syndicateData.feed.unshift(`${AppState.player.name} вступил.`);
        await DB.syncPlayer(); UI.showToast(`Вступили в ${n}!`, 'success'); UI.renderAll();
    },
    async leaveSyndicate() { if (!AppState.player.syndicate) return; if (confirm("Покинуть?")) { AppState.player.syndicate = null; await DB.syncPlayer(); UI.showToast('Покинули.', 'info'); UI.renderAll(); } },
    upgradeTech(tK) {
        const tC = { security: 1000, logistics: 1500, mechanic: 1200 }; const cL = AppState.syndicateData.techs[tK] || 0;
        if (cL >= 5) return UI.showToast('Максимум!', 'info'); const c = tC[tK] * (cL + 1);
        if (AppState.player.fuel_stock < c) return UI.showToast(`Нужно ${c}л`, 'error');
        AppState.player.fuel_stock -= c; AppState.syndicateData.techs[tK] = cL + 1; AppState.syndicateData.treasuryFuel += c;
        const tN = { security: 'Безопасность', logistics: 'Тендерный отдел', mechanic: 'Собственная СТО' };
        if (!AppState.syndicateData.feed) AppState.syndicateData.feed = []; AppState.syndicateData.feed.unshift(`> ${AppState.player.name} улучшил "${tN[tK]}"`); if (AppState.syndicateData.feed.length > 10) AppState.syndicateData.feed.pop();
        DB.syncPlayer(); UI.showToast('Улучшено!', 'success'); UI.renderAll();
    }
};

const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        const t = document.getElementById(`tab-${tId}`); if (t) t.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(b => { if(b.getAttribute('onclick')?.includes(tId)) b.classList.add('active'); });
        AudioSys.playVibrate('click'); AudioSys.playSFX('click');
        this.renderAll();
    },
    switchLeaderboardCategory(cat) { AppState.leaderboardCategory = cat; document.getElementById('lb-tab-profit').classList.toggle('active', cat === 'profit'); document.getElementById('lb-tab-trips').classList.toggle('active', cat === 'trips'); DB.loadLeaderboard().then(() => this.renderAll()); },
    inspectPlayer(uId) {
        const u = AppState.leaderboard.find(x => String(x.id) === String(uId)); if (!u) return;
        let ex = document.getElementById('inspect-modal'); if (ex) ex.remove();
        const rT = ReputationSys.getTitle(u.level || 1), vS = AppState.leaderboardCategory === 'trips' ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`;
        const bO = BACKGROUNDS_SHOP.find(b => b.id === u.current_background) || BACKGROUNDS_SHOP[0];
        const m = `<div id="inspect-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-purple);text-align:center;position:relative;overflow:hidden;background-image:url('${bO.image}');background-size:cover;background-position:center;" onclick="event.stopPropagation()"><div style="position:absolute;inset:0;background:rgba(12,12,20,0.85);z-index:1;"></div><div style="position:relative;z-index:2;"><div style="width:70px;height:70px;margin:0 auto 10px auto;border-radius:50%;padding:2px;background:var(--gradient-primary);"><img src="${u.avatar || 'https://via.placeholder.com/80'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div><h3 style="color:#fff;font-size:18px;">${u.name}</h3><div style="font-size:12px;color:var(--accent-pink);font-weight:bold;margin-top:2px;">${rT}</div><div style="font-size:11px;color:var(--hint-color);margin-top:4px;">Синдикат: ${u.syndicate || 'Частник'}</div><div class="specs-grid" style="margin-top:14px;text-align:left;background:rgba(0,0,0,0.4);padding:10px;border-radius:8px;"><div>Уровень: <b>${u.level || 1}</b></div><div>Показатель: <b>${vS}</b></div></div><button type="button" class="btn btn-outline" style="margin-top:12px;font-size:12px;" onclick="document.getElementById('inspect-modal').remove()">Закрыть</button></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', m);
    },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container'); if (!c) return;
        const t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t);
        AudioSys.playVibrate(type); if(type === 'success') AudioSys.playSFX('success'); if(type === 'error') AudioSys.playSFX('error');
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, t) { const e = document.getElementById(id); if (e) e.innerText = t; },
    safeUpdateHTML(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; },
    renderAll() {
        const p = AppState.player;
        this.safeUpdate('profile-id-name', p.name); this.safeUpdate('profile-id-role', ReputationSys.getTitle(p.level)); this.safeUpdate('profile-id-lvl', `LVL ${p.level}`);
        const dO = new Date(p.reg_date || Date.now()); this.safeUpdate('profile-id-date', `${String(dO.getDate()).padStart(2, '0')}.${String(dO.getMonth() + 1).padStart(2, '0')}.${dO.getFullYear()}`);
        const iA = document.getElementById('profile-id-avatar'); if (iA) iA.src = p.avatar || 'https://via.placeholder.com/80';
        const cB = BACKGROUNDS_SHOP.find(b => b.id === p.current_background) || BACKGROUNDS_SHOP[0];
        const pC = document.getElementById('profile-card-main'); if (pC) { pC.style.backgroundImage = `url('${cB.image}')`; pC.style.backgroundSize = 'cover'; pC.style.backgroundPosition = 'center'; }
        this.safeUpdate('stat-total-fuel', `${Number(p.total_fuel_burned || 0).toLocaleString()} л`); this.safeUpdate('stat-playtime', `${Math.floor((p.playtime_minutes || 0) / 60)}ч ${(p.playtime_minutes || 0) % 60}м`);
        let fTS = "Нет"; if (AppState.trucks && AppState.trucks.length > 0) fTS = [...AppState.trucks].sort((a,b)=>(TRUCK_SHOP.find(s=>s.name===b.name)?.price||0)-(TRUCK_SHOP.find(s=>s.name===a.name)?.price||0))[0].name;
        this.safeUpdate('stat-fav-truck', fTS); this.safeUpdate('username', p.name); this.safeUpdate('user-title', ReputationSys.getTitle(p.level)); this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`); this.safeUpdate('user-level-badge', `LVL ${p.level}`); this.safeUpdate('current-fuel-price', `${p.fuel_price} 🪙 / л`); this.safeUpdate('pass-subtitle', `Ваш уровень: ${p.pass_level}`);
        document.querySelectorAll('#user-avatar').forEach(i => { if (p.avatar) i.src = p.avatar; });
        this.safeUpdate('stat-total-profit', `${Number(p.total_profit).toLocaleString()} 🪙`); this.safeUpdate('stat-total-trips', p.total_trips);

        this.safeUpdateHTML('backgrounds-inventory-list', BACKGROUNDS_SHOP.map(bg => {
            const u = (p.unlocked_backgrounds || ['bg_r1']).includes(bg.id), s = p.current_background === bg.id;
            return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;opacity:${u?'1':'0.5'};margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;"><img src="${bg.image}" style="width:50px;height:35px;border-radius:6px;object-fit:cover;"><div><div style="font-size:12px;font-weight:bold;">${bg.name}</div><div style="font-size:10px;color:var(--accent-pink);text-transform:uppercase;">${bg.rarity}</div></div></div><button class="btn ${s?'btn-outline':'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!u||s?'disabled':''} onclick="BackgroundCaseSys.setBackground('${bg.id}')">${s?'Активен':(u?'Установить':'Закрыто')}</button></div>`;
        }).join(''));

        this.safeUpdateHTML('background-case-section', `<div class="card" style="border-color:var(--accent-pink);text-align:center;margin-bottom:16px;"><div class="card-title"><span>🎁 Кейс фонов</span></div><p style="font-size:12px;color:var(--hint-color);margin:6px 0 12px 0;">10,000,000 🪙</p><button class="btn btn-primary" onclick="BackgroundCaseSys.openCase()">Открыть (10M 🪙)</button></div>`);

        const nS = document.getElementById('no-syndicate-panel'), aS = document.getElementById('active-syndicate-panel');
        if(p.syndicate) {
            if(nS) nS.style.display = 'none'; if(aS) aS.style.display = 'block';
            const s = AppState.syndicateData; this.safeUpdate('corp-name-title', p.syndicate); this.safeUpdate('corp-level-badge', `Ур. ${s.level || 1}`); this.safeUpdate('corp-fuel-treasury', `${(s.treasuryFuel || 0).toLocaleString()} л`); this.safeUpdate('corp-role-desc', p.name === 'TSYBUSS' ? 'Ген. Директор' : 'Логист');
            if (s.feed) this.safeUpdateHTML('corp-activity-feed', s.feed.map(i => `<div class="feed-item">${i}</div>`).join(''));
            this.safeUpdateHTML('corp-tech-tree', [{ k: 'security', n: '🛡️ Безопасность', d: 'Снижает шанс ЧП', c: 1000 }, { k: 'logistics', n: '📈 Тендеры', d: 'Доход +4%', c: 1500 }, { k: 'mechanic', n: '🔧 СТО', d: 'Износ -5%', c: 1200 }].map(t => {
                const cL = s.techs[t.k] || 0, nC = t.c * (cL + 1), m = cL >= 5;
                return `<div class="card" style="padding:10px;margin-bottom:8px;"><div class="card-title" style="font-size:12px;margin-bottom:2px;"><span>${t.n}</span><span style="color:var(--accent-purple);">Ур. ${cL}/5</span></div><p style="font-size:11px;color:var(--hint-color);margin-bottom:8px;">${t.d}</p><button class="btn ${m?'btn-outline':'btn-primary'}" style="font-size:11px;padding:6px;" ${m?'disabled':''} onclick="GameLogic.upgradeTech('${t.k}')">${m?'МАКСИМУМ':`Инвест (${nC}л)`}</button></div>`;
            }).join(''));
            this.safeUpdateHTML('corp-members-list', `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:rgba(0,0,0,0.2);border-radius:8px;"><div style="display:flex;align-items:center;gap:8px;"><img src="${p.avatar || 'https://via.placeholder.com/30'}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;"><div><div style="font-size:12px;font-weight:bold;">${p.name}</div><div style="font-size:10px;color:var(--accent-pink);">Участник</div></div></div><span style="font-size:11px;color:var(--success-color);">В сети</span></div>`);
        } else { if(nS) nS.style.display = 'block'; if(aS) aS.style.display = 'none'; }

        const l = AppState.leaderboard || [], isT = AppState.leaderboardCategory === 'trips', c = ['👑', '🥈', '🥉']; let pH = '';
        l.slice(0, 3).forEach((u, i) => {
            const v = isT ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`, bG = BACKGROUNDS_SHOP.find(b => b.id === u.current_background) || BACKGROUNDS_SHOP[0];
            pH += `<div class="podium-card rank-${i+1}" onclick="UI.inspectPlayer('${u.id}')" style="cursor:pointer;background-image:url('${bG.image}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(22,22,32,0.82);z-index:1;border-radius:14px;"></div><div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:100%;"><span class="podium-crown">${c[i]}</span><img src="${u.avatar || 'https://via.placeholder.com/80'}" class="podium-avatar" /><span class="podium-name">${u.name}</span><span style="font-size:10px;color:var(--hint-color);">Ур. ${u.level || 1}</span><span class="podium-val">${v}</span></div></div>`;
        });
        this.safeUpdateHTML('leaderboard-podium', pH);
        this.safeUpdateHTML('leaderboard-list', l.slice(3).map((u, i) => `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;margin-bottom:6px;" onclick="UI.inspectPlayer('${u.id}')"><div style="display:flex;align-items:center;gap:10px;"><div style="display:flex;flex-direction:column;align-items:center;width:22px;"><span style="font-weight:800;font-size:13px;color:var(--hint-color);">#${i+4}</span></div><img src="${u.avatar || 'https://via.placeholder.com/40'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" /><div><div style="font-weight:600;font-size:14px;color:#fff;">${u.name}</div><div style="font-size:11px;color:var(--hint-color);">Ур: ${u.level || 1}</div></div></div><div style="font-weight:bold;color:var(--accent-pink);font-size:13px;">${isT ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`}</div></div>`).join(''));
        let mI = l.findIndex(u => String(u.id) === String(p.id)); this.safeUpdate('my-rank-num', mI !== -1 ? `#${mI + 1}` : '#--'); this.safeUpdate('my-rank-val', isT ? `${p.total_trips || 0} рейсов` : `${Number(p.total_profit || 0).toLocaleString()} 🪙`);

        const aTI = AppState.activeTrips.map(t => t.truck_id);
        let fH = AppState.trucks.length > 0 ? AppState.trucks.map(t => {
            const isB = aTI.includes(t.id), sH = isB ? `<span style="font-size:12px;color:#EF4444;">🔴 В рейсе</span>` : `<span style="font-size:12px;color:#10B981;">🟢 Свободна</span>`;
            const sT = TRUCK_SHOP.find(x => x.name === t.name), cP = t.custom_plate || '456LWO|10';
            let a100 = true, tRC = 0, pts = [{ k: 'engineLvl', n: '🛠 Двс' }, { k: 'tiresLvl', n: '🛞 Шины' }, { k: 'gearLvl', n: '⚙️ КПП' }, { k: 'brakesLvl', n: '🧯 Торм' }];
            let ptH = pts.map(pt => {
                const v = Number(t[pt.k]) || 100, uL = t[pt.k + 'Upgrade'] || 0; let cl = v < 40 ? '#EF4444' : v < 75 ? '#F59E0B' : '#10B981';
                if (v < 100) a100 = false; const rc = GameLogic.getRepairCost(v); tRC += rc;
                let d = ''; for(let i=0; i<5; i++) d += `<div class="upgrade-dot ${i < uL ? 'active' : ''}"></div>`;
                return `<div class="part-card"><div class="part-header"><span>${pt.n} ${v < 20 ? `<span class="critical-alert">⚠️</span>` : ''}</span><span style="color:${cl};font-weight:800;">${v}%</span></div><div class="part-bar"><div class="part-bar-fill" style="width:${v}%;background-color:${cl};box-shadow:0 0 8px ${cl}40;"></div></div><div class="upgrade-track">${d}</div><div style="display:flex;gap:4px;margin-top:6px;"><button class="btn btn-outline btn-repair" style="flex:1;padding:4px;" ${isB || v === 100 ? 'disabled' : ''} onclick="GameLogic.repairPart('${t.id}', '${pt.k}')">${v === 100 ? 'OK' : `${(rc/1000).toFixed(1)}k`}</button><button class="btn btn-upgrade" style="flex:1;padding:4px;" ${isB || uL >= 5 ? 'disabled' : ''} onclick="GameLogic.upgradeTruckPart('${t.id}', '${pt.k}')">${uL >= 5 ? 'MAX' : 'UP'}</button></div></div>`;
            }).join('');
            return `<div class="card rarity-${t.rarity || 'common'}" style="margin-bottom:16px;position:relative;"><div class="card-title" style="margin-bottom:8px;"><span>🚚 ${t.name}</span>${sH}</div><div class="truck-specs-badge"><div>📦 <span>${sT?.capacity||0} кг</span></div><div>⛽ <span>${sT?.fuel_use||0} л</span></div></div>${sT?.image ? `<div style="text-align:center;margin:10px 0;display:flex;flex-direction:column;align-items:center;"><img src="${sT.image}" alt="${t.name}" style="max-width:100%;height:110px;object-fit:contain;filter:drop-shadow(0 10px 10px rgba(0,0,0,0.5));"><div class="plate-container"><div class="license-plate">${cP}</div><button class="plate-edit-btn" onclick="GameLogic.openPlateModal('${t.id}')">⚙️ Номер</button></div></div>` : ''}<div class="parts-grid" style="margin-top:16px;">${ptH}</div><div style="display:flex;gap:8px;margin-top:12px;"><button class="btn btn-outline" style="flex:1;font-size:11px;padding:10px;" ${isB || !a100 ? 'disabled' : ''} onclick="GameLogic.rentOutTruck('${t.id}')">${isB ? 'В рейсе' : (!a100 ? 'Нужно ТО' : 'Аренда')}</button><button class="btn ${a100 || isB ? 'btn-outline' : 'btn-full-service'}" style="flex:1;font-size:11px;padding:10px;" ${a100 || isB ? 'disabled' : ''} onclick="GameLogic.repairAll('${t.id}')">${a100 ? 'Исправна' : `ТО: ${Math.floor(tRC * 0.9).toLocaleString()}`}</button></div></div>`;
        }).join('') : `<p style="text-align:center;color:var(--hint-color);margin-bottom:16px;">Гараж пуст!</p>`;
        
        this.safeUpdateHTML('fleet-list', fH + `<h3 class="subsection-title" style="margin:20px 0 10px 0;font-size:16px;font-weight:bold;">Автосалон</h3><div class="card-grid" style="margin-bottom:70px;">${TRUCK_SHOP.map(s => { const o = AppState.trucks.some(t => t.name === s.name); return `<div class="card"><div class="card-title"><span>🚚 ${s.name}</span><span style="color:var(--accent-blue);">${s.price.toLocaleString()} 🪙</span></div>${s.image ? `<div style="text-align:center;margin:10px 0;"><img src="${s.image}" style="max-width:100%;height:90px;object-fit:contain;"></div>` : ''}<div class="truck-specs-badge" style="margin-bottom:10px;"><div>📦 <span>${s.capacity} кг</span></div><div>⛽ <span>${s.fuel_use} л</span></div></div><button class="btn ${o ? 'btn-outline' : 'btn-primary'}" ${o ? 'disabled' : ''} onclick="GameLogic.buyTruck('${s.id}')">${o ? 'Куплено' : 'Купить'}</button></div>`; }).join('')}</div>`);

        this.safeUpdateHTML('licenses-list', LICENSES_SHOP.map(l => { const h = p.licenses.includes(l.id), i = l.type === 'illegal', b = i ? 'var(--accent-pink)' : 'var(--accent-blue)'; return `<div class="card" style="border-color:${b};margin-bottom:10px;"><div class="card-title"><span>${i ? '🥷' : '📜'} ${l.name}</span><span style="color:${h ? '#10B981' : 'var(--accent-pink)'};">${h ? 'Куплено' : `${l.cost.toLocaleString()} 🪙`}</span></div><div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:4px;font-size:10px;color:var(--hint-color);margin:8px 0;text-align:center;background:rgba(0,0,0,0.2);padding:6px;border-radius:6px;"><div>${l.col1}</div><div>${l.col2}</div><div>${l.col3}</div><div>${l.col4}</div><div>${l.col5}</div></div><button class="btn ${h ? 'btn-outline' : 'btn-primary'}" ${h ? 'disabled' : ''} onclick="GameLogic.buyLicense('${l.id}')">${h ? 'Активировано' : 'Приобрести'}</button></div>`; }).join(''));

        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { let l = Math.floor((tr.end_time - Date.now()) / 1000); if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } if (tr.title !== 'Аренда: Сдана в прокат' && Math.random() < 0.008) EventSys.checkEventsForTrip(tr); const tn = AppState.trucks.find(x => String(x.id) === String(tr.truck_id))?.name || 'Фура'; return `<div class="card rarity-epic" style="margin-bottom:12px;border-color:var(--accent-blue);"><div class="card-title"><span>🚚 ${tn} в пути</span><span style="color:var(--accent-blue);">⏳ ${l} сек</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; }).join(''));
        
        const hI = AppState.trucks.some(t => !aTI.includes(t.id) && Number(t.engineLvl) > 0 && Number(t.tiresLvl) > 0 && Number(t.gearLvl) > 0 && Number(t.brakesLvl) > 0);
        this.safeUpdateHTML('contracts-list', MapSys.getFilteredContracts().map(c => {
            const lL = p.level < c.reqLvl, lLic = !p.licenses.includes(c.reqLic), iL = lL || lLic;
            let cR = c.reward; if (WorldState.marketEvent.effect !== 'none' && c.title.includes(WorldState.marketEvent.effect)) cR = Math.floor(cR * WorldState.marketEvent.multiplier);
            if (AppState.player.syndicate && AppState.syndicateData && AppState.syndicateData.techs) cR = Math.floor(cR * (1 + (AppState.syndicateData.techs.logistics || 0) * 0.04));
            let bt = lL ? `Ур. ${c.reqLvl}` : lLic ? 'Лицензия' : !hI ? 'Нет фур' : 'Начать рейс', bc = lL || lLic || !hI ? 'contract-action-btn disabled' : 'contract-action-btn active';
            let tS = c.duration >= 60 ? `${Math.floor(c.duration/60)}м ${c.duration%60 > 0 ? c.duration%60+'с' : ''}` : `${c.duration}с`;
            return `<div class="contract-card" style="${iL ? 'opacity:0.6' : ''}"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.name}</span></div><div class="contract-reward">+${cR.toLocaleString()} 🪙</div></div><div class="contract-body"><div class="contract-image"><img src="${c.image}"></div><div class="contract-specs"><div class="spec-item"><span>⏱ Время:</span><span style="color:#fff;font-weight:bold;">${tS}</span></div><div class="spec-item"><span>⛽ Топл:</span><span style="color:#fff;font-weight:bold;">${c.fuel}л</span></div></div></div><button class="${bc}" ${!hI || iL ? 'disabled' : ''} onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">${bt}</button></div>`;
        }).join(''));

        this.safeUpdateHTML('pass-tiers-list', Array.from({ length: 30 }, (_, i) => { const l = i + 1, r = 10000 + i * 20000, iR = p.pass_level >= l, iC = p.pass_claimed.includes(l); return `<div class="card bp-card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;margin-bottom:8px;"><div><div class="card-title" style="margin-bottom:2px;font-size:12px;"><span>Ур. ${l}: Cyber Tokyo</span></div><p style="font-size:11px;color:var(--hint-color);">+${r.toLocaleString()} 🪙</p></div><button class="btn ${iC ? 'btn-outline' : 'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!iR || iC ? 'disabled' : ''} onclick="GameLogic.claimPassReward(${l}, ${r})">${iC ? 'Получено' : (iR ? 'Забрать' : `Ур. ${l}`)}</button></div>`; }).join(''));
        this.safeUpdateHTML('skills-list', [{ k: 'eco', n: '🍃 Эко-драйв', d: 'Расход топлива' }, { k: 'luck', n: '🍀 Связи', d: 'Шанс форс-мажора' }, { k: 'mechanic', n: '🔧 Механик', d: 'Износ деталей' }].map(s => { const l = p.skills[s.k] || 0, c = 50000 * (l + 1), m = l >= 5; return `<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div><div style="font-size:13px;font-weight:700;">${s.n} <span style="color:var(--accent-pink);">[Ур. ${l}/5]</span></div><div style="font-size:11px;color:var(--hint-color);margin-top:2px;">${s.d}</div></div><button class="btn ${m ? 'btn-outline' : 'btn-primary'}" style="font-size:11px;padding:6px 12px;width:auto;" ${m ? 'disabled' : ''} onclick="GameLogic.upgradeSkill('${s.k}')">${m ? 'MAX' : `${c.toLocaleString()} 🪙`}</button></div>`; }).join(''));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather(); WorldState.generateMarketEvent(); let p = 0; const ld = document.getElementById('loading-screen');
    if (ld) {
        const int = setInterval(() => { p += 20; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init().then(() => { setTimeout(() => AIDispatcher.showPopup("Добро пожаловать в Logistic World!"), 1500); }); }); } }, 300);
    } else DB.init();
    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); AIDispatcher.randomAdvice(); }, 180000); setInterval(() => GameLogic.updateMarket(), 240000); setInterval(() => WorldState.generateMarketEvent(), 600000);
    setInterval(() => { if (AppState.player && AppState.player.id) { AppState.player.playtime_minutes = (AppState.player.playtime_minutes || 0) + 1; UI.safeUpdate('stat-playtime', `${Math.floor(AppState.player.playtime_minutes / 60)}ч ${AppState.player.playtime_minutes % 60}м`); if (AppState.player.playtime_minutes % 5 === 0) DB.syncPlayer(); } }, 60000);
});
window.switchTab = (id) => UI.switchTab(id); window.AudioSys = AudioSys; window.AdminSys = AdminSys; window.GameLogic = GameLogic; window.EventSys = EventSys; window.BackgroundCaseSys = BackgroundCaseSys; window.MapSys = MapSys; window.UI = UI;
