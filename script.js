const tg = window.Telegram.WebApp; // Исправлено: const с маленькой буквы
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, DAILY_BONUS_COINS: 15000, DAILY_BONUS_FUEL: 200, BONUS_COOLDOWN_MS: 86400000, 
    CASE_COST: 10000000, DUPLICATE_COINS: 1000000, DUPLICATE_XP: 10000,
    FATIGUE_MAX: 100, FATIGUE_DRAIN_RATE: 0.15, MOTEL_COST: 5000, WEATHER_FORECAST_COST: 25000,
    GARAGE_UPGRADE_COSTS: [0, 250000, 1000000, 5000000],
    TIPS: [
        "Дождь и шторм увеличивают износ шин и тормозов.",
        "Следите за бодростью: при усталости ниже 20% скорость рейсов падает, а шанс ЧП растет!",
        "Ремонтируйте узлы вовремя, чтобы избежать поломки в пути.",
        "Покупайте прогноз погоды в Центре для стратегического планирования."
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
                this.bgm.play().then(() => { if (btn) btn.innerText = "Включено 🔊"; }).catch(() => {
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
            sound.play().catch(() => {});
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

/* ===== МЕХАНИКА 1: УСТАЛОСТЬ ВОДИТЕЛЯ И МОТЕЛИ (`FatigueSys`) ===== */
const FatigueSys = {
    init() {
        setInterval(() => {
            if (AppState.player.fatigue > 0) {
                AppState.player.fatigue = Math.max(0, AppState.player.fatigue - CONFIG.FATIGUE_DRAIN_RATE);
                UI.safeUpdate('user-fatigue-bar', `🔋 ${Math.floor(AppState.player.fatigue)}%`);
                if (AppState.player.fatigue <= 20 && Math.random() < 0.05) {
                    UI.showToast("⚠️ Водитель засыпает за рулем! Скорость рейсов упала, риск ЧП вырос.", "error");
                }
            }
        }, 60000);
    },
    async restAtMotel() {
        if (AppState.player.money < CONFIG.MOTEL_COST) return UI.showToast(`Нужно ${CONFIG.MOTEL_COST.toLocaleString()} 🪙 для ночлега`, 'error');
        AppState.player.money -= CONFIG.MOTEL_COST;
        AppState.player.fatigue = 100;
        await DB.syncPlayer();
        UI.showToast("🛏️ Водитель выспался и полон сил! Бодрость: 100%", "success");
        AudioSys.playSFX('success');
        UI.renderAll();
    },
    async useEnergyDrink() {
        AppState.player.fatigue = Math.min(100, AppState.player.fatigue + 40);
        await DB.syncPlayer();
        UI.showToast("⚡ Энергетик выпитой порцией восстановил силы! Бодрость +40%", "success");
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

/* ===== МЕХАНИКА 2: ПОГОДА И МЕТЕОСТАНЦИЯ (`WeatherSys`) ===== */
const WeatherSys = {
    updateDynamicWeather() {
        const severeTypes = [
            { name: '⛈️ Шторм', timeMod: 1.6, fuelMod: 1.3, wearMod: 2.2, block: ['oversized', 'dangerous'] },
            { name: '🌫 Густой туман', timeMod: 1.4, fuelMod: 1.1, wearMod: 1.3, block: ['smuggling', 'black_market'] },
            { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0, block: [] },
            { name: '🌨 Метель', timeMod: 1.5, fuelMod: 1.25, wearMod: 1.8, block: ['oversized'] },
            { name: '🌧 Ливень', timeMod: 1.2, fuelMod: 1.1, wearMod: 1.5, block: [] }
        ];
        WorldState.weather = severeTypes[Math.floor(Math.random() * severeTypes.length)];
        AppState.worldExtra.lockedCategories = WorldState.weather.block;
        UI.safeUpdate('weather-info', WorldState.weather.name);
    },
    async buyForecast() {
        if (AppState.player.money < CONFIG.WEATHER_FORECAST_COST) return UI.showToast(`Нужно ${CONFIG.WEATHER_FORECAST_COST.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= CONFIG.WEATHER_FORECAST_COST;
        AppState.player.weather_forecast_expiry = Date.now() + 7200000;
        await DB.syncPlayer();
        UI.showToast("📡 Прогноз погоды на 2 часа успешно куплен!", "success");
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0, block: [] },
    marketEvent: { name: 'Стабильность', effect: 'none', multiplier: 1.0 },
    generateWeather() {
        WeatherSys.updateDynamicWeather();
    },
    generateMarketEvent() {
        const events = [
            { name: '⚖️ Стабильность', effect: 'none', multiplier: 1.0, desc: "Рынок стабилен." },
            { name: '📈 Строительный бум', effect: 'Строймат', multiplier: 1.6, desc: "Спрос на стройматериалы вырос!" },
            { name: '⚡ Кризис чипов', effect: 'Электроника', multiplier: 1.9, desc: "Дефицит электроники!" },
            { name: '🛢 Топливный кризис', effect: 'fuel_price', multiplier: 2.1, desc: "Цены на топливо взлетели!" }
        ];
        this.marketEvent = events[Math.floor(Math.random() * events.length)];
        const banner = document.getElementById('global-event-banner'), title = document.getElementById('global-event-title'), desc = document.getElementById('global-event-desc');
        if (banner && desc && title) {
            if (this.marketEvent.effect === 'none') banner.style.display = 'none';
            else { banner.style.display = 'block'; title.innerText = this.marketEvent.name; desc.innerText = this.marketEvent.desc; AIDispatcher.showPopup(`Внимание: ${this.marketEvent.name}!`); }
        }
        if (this.marketEvent.effect === 'fuel_price') { AppState.player.fuel_price = Math.floor(AppState.player.fuel_price * this.marketEvent.multiplier); UI.renderAll(); }
    }
};

/* ===== МЕХАНИКА 3: РЫНОЧНАЯ СПЕКУЛЯЦИЯ И ДЕФИЦИТ (`MarketSys`) ===== */
const MarketSys = {
    rotateDemand() {
        const sectors = ['hub', 'chem', 'heavy', 'shadow'];
        const commodities = ['Доски', 'Химикаты', 'Спецтехника', 'Контрабанда'];
        sectors.forEach((sec, idx) => {
            if (Math.random() > 0.3) {
                AppState.worldExtra.sectorDemand[sec] = {
                    item: commodities[idx],
                    multiplier: 1.3 + Math.random() * 0.5
                };
            } else {
                AppState.worldExtra.sectorDemand[sec] = null;
            }
        });
    }
};

/* ===== МЕХАНИКА 4: ЧЕРНЫЙ РЫНОК И СИСТЕМА РОЗЫСКА (`UnderworldSys`) ===== */
const UnderworldSys = {
    async addWanted(amount) {
        AppState.player.wanted_level = Math.min(5, (AppState.player.wanted_level || 0) + amount);
        if (AppState.player.wanted_level > 0) {
            UI.showToast(`🚨 Внимание! Уровень розыска ФСБ повышен: ${AppState.player.wanted_level} ⭐`, "error");
            const wB = document.getElementById('user-wanted-badge');
            if(wB) { wB.style.display = 'inline-block'; wB.innerText = `⭐ ${AppState.player.wanted_level}`; }
        }
        await DB.syncPlayer();
    },
    async hireLawyer() {
        const cost = 150000 * Math.max(1, AppState.player.wanted_level);
        if (AppState.player.wanted_level === 0) return UI.showToast("У вас нет активного розыска ФСБ!", "info");
        if (AppState.player.money < cost) return UI.showToast(`Услуги адвоката стоят ${cost.toLocaleString()} 🪙`, "error");
        
        AppState.player.money -= cost;
        AppState.player.wanted_level = 0;
        const wB = document.getElementById('user-wanted-badge');
        if(wB) wB.style.display = 'none';

        await DB.syncPlayer();
        UI.showToast("⚖️ Досье аннулировано адвокатом синдиката. Розыск снят!", "success");
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

/* ===== МЕХАНИКА 5: QTE МИНИ-ИГРА ФОРС-МАЖОРОВ (`QTEEventSys`) ===== */
const QTEEventSys = {
    qteInterval: null,
    triggerQTE(tripId, eventType) {
        EventSys.closeEventModal();
        let ex = document.getElementById('qte-modal'); if (ex) ex.remove();
        
        const qteHtml = `
            <div id="qte-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;">
                <h3 style="color:#EF4444;margin-bottom:10px;font-size:20px;">⚠️ ЧП НА ДОРОГЕ: РЕАКЦИЯ!</h3>
                <p style="color:var(--hint-color);font-size:12px;margin-bottom:20px;text-align:center;">Успейте нажать на цель до истечения времени!</p>
                <div id="qte-target-zone" style="width:260px;height:120px;background:rgba(255,255,255,0.05);border:2px dashed var(--accent-pink);border-radius:12px;position:relative;cursor:pointer;" onclick="QTEEventSys.successQTE()">
                    <div id="qte-btn" style="position:absolute;top:35px;left:70px;background:var(--gradient-primary);color:#fff;padding:12px 20px;border-radius:8px;font-weight:900;font-size:14px;box-shadow:0 0 20px var(--accent-pink);">СРОЧНО ЖМИ!</div>
                </div>
                <div id="qte-timer" style="margin-top:20px;font-size:16px;font-weight:bold;color:#F59E0B;">⏳ 3.0с</div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', qteHtml);
        AudioSys.playVibrate('error');

        let timeLeft = 30;
        this.qteInterval = setInterval(() => {
            timeLeft--;
            UI.safeUpdate('qte-timer', `⏳ ${(timeLeft / 10).toFixed(1)}с`);
            if (timeLeft <= 0) {
                clearInterval(this.qteInterval);
                QTEEventSys.failQTE();
            }
        }, 100);
    },
    successQTE() {
        if (this.qteInterval) clearInterval(this.qteInterval);
        const m = document.getElementById('qte-modal'); if (m) m.remove();
        UI.showToast("🎯 Блестящая реакция! ЧП предотвращено, получен бонус XP.", "success");
        GameLogic.addXP(600);
        AudioSys.playSFX('success');
    },
    failQTE() {
        const m = document.getElementById('qte-modal'); if (m) m.remove();
        UI.showToast("💥 Вы не успели среагировать! Тягач получил сильный урон и штраф.", "error");
        AppState.player.money = Math.max(0, AppState.player.money - 25000);
        DB.syncPlayer();
        AudioSys.playSFX('error');
    }
};

const EventSys = {
    activeEvent: null, timerInterval: null,
    checkEventsForTrip(trip) {
        if (this.activeEvent) return;
        let luckMod = 1.0;
        if (AppState.player.skills && AppState.player.skills.luck) luckMod -= AppState.player.skills.luck * 0.1;
        if (AppState.player.fatigue < 20) luckMod *= 3.0; // Если водитель уснул — шанс ЧП х3
        
        const chance = Math.random() / Math.max(0.1, luckMod);
        if (chance < 0.15) {
            QTEEventSys.triggerQTE(trip.id, 'qte_accident');
        } else if (chance < 0.28) {
            this.triggerEvent(trip, 'breakdown');
        } else if (chance < 0.42) {
            this.triggerEvent(trip, 'customs');
        }
    },
    triggerEvent(trip, type) {
        const tripTruck = AppState.trucks.find(t => String(t.id) === String(trip.truck_id));
        const truckName = tripTruck ? tripTruck.name : 'Тягач';
        let eventData = { tripId: trip.id, type: type, timeLeft: 30, title: '', desc: '', choices: [] };
        switch(type) {
            case 'breakdown': eventData.title = `🛠 Поломка: ${truckName}`; eventData.desc = `Узел машины не выдержал нагрузок.`; eventData.choices = [{ id: 1, text: 'Ремкомплект (Беспл)', action: () => EventSys.resolveEvent('breakdown_kit') }, { id: 2, text: 'Эвакуатор (-15k 🪙)', action: () => EventSys.resolveEvent('breakdown_tow') }]; break;
            case 'customs': eventData.title = `🚨 Таможенный пост`; eventData.desc = `Требуется проверка груза и документов.`; eventData.choices = [{ id: 1, text: 'Взятка (-25k 🪙)', action: () => EventSys.resolveEvent('customs_bribe') }, { id: 2, text: 'Пройти досмотр', action: () => EventSys.resolveEvent('customs_legal') }]; break;
        }
        this.activeEvent = eventData; this.renderEventModal(); this.startEventTimer(); AIDispatcher.showPopup(`⚠️ Внимание! Внештатная ситуация!`);
    },
    startEventTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.activeEvent) { clearInterval(this.timerInterval); return; }
            this.activeEvent.timeLeft--; UI.safeUpdate('event-timer-badge', `⏳ ${this.activeEvent.timeLeft}с`);
            if (this.activeEvent.timeLeft <= 0) { clearInterval(this.timerInterval); this.handleTimeout(); }
        }, 1000);
    },
    handleTimeout() { UI.showToast('Время на принятие решения истекло!', 'error'); this.closeEventModal(); AppState.player.money = Math.max(0, AppState.player.money - 15000); DB.syncPlayer(); UI.renderAll(); },
    resolveEvent(actionId) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        switch(actionId) {
            case 'breakdown_kit': UI.showToast('Ремонт в пути успешен!', 'success'); break;
            case 'breakdown_tow': if (AppState.player.money >= 15000) { AppState.player.money -= 15000; UI.showToast('Эвакуатор успешно вызван', 'info'); } else UI.showToast('Нет средств!', 'error'); break;
            case 'customs_bribe': if (AppState.player.money >= 25000) { AppState.player.money -= 25000; UI.showToast('Патруль откуплен.', 'success'); } else { UI.showToast('Мало денег! Штраф и розыск.', 'error'); UnderworldSys.addWanted(1); } break;
            case 'customs_legal': UI.showToast('Проверка успешно пройдена.', 'success'); break;
        }
        this.closeEventModal(); DB.syncPlayer(); UI.renderAll();
    },
    renderEventModal() {
        let ex = document.getElementById('event-modal'); if (ex) ex.remove();
        const ev = this.activeEvent; if (!ev) return;
        const modalHtml = `<div id="event-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);"><div class="card" style="width:100%;max-width:400px;border-color:var(--accent-pink);box-shadow:0 0 30px rgba(236,72,153,0.3);"><div class="card-title" style="display:flex;justify-content:space-between;align-items:center;"><span style="color:var(--accent-pink);">${ev.title}</span><span id="event-timer-badge" style="background:rgba(236,72,153,0.2);padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold;">⏳ ${ev.timeLeft}с</span></div><p style="font-size:13px;color:var(--hint-color);margin:12px 0 16px 0;line-height:1.4;">${ev.desc}</p><div style="display:flex;flex-direction:column;gap:8px;">${ev.choices.map((choice, idx) => `<button type="button" class="btn btn-outline" style="text-align:left;font-size:12px;padding:10px;border-color:var(--accent-blue);color:#fff;" onclick="EventSys.resolveEvent('${idx === 0 ? 'breakdown_kit' : 'customs_bribe'}')">👉 ${choice.text}</button>`).join('')}</div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    closeEventModal() { const modal = document.getElementById('event-modal'); if (modal) modal.remove(); this.activeEvent = null; if (this.timerInterval) clearInterval(this.timerInterval); }
};

/* ===== МЕХАНИКА 6: ЛИЧНЫЙ ГАРАЖ-СКЛАД (`GarageSys`) ===== */
const GarageSys = {
    async upgradeGarage() {
        const nextLvl = AppState.player.garage_level + 1;
        if (nextLvl > 3) return UI.showToast("У вас максимальный уровень гаража!", "info");
        const cost = CONFIG.GARAGE_UPGRADE_COSTS[nextLvl];
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');

        AppState.player.money -= cost;
        AppState.player.garage_level = nextLvl;
        await DB.syncPlayer();
        UI.showToast(`🏠 Гараж улучшен до Уровня ${nextLvl}! Стоимость ТО снижена.`, "success");
        AudioSys.playSFX('success');
        UI.renderAll();
    }
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
    },
    showCaseResultModal(bg, isDup, text) {
        let ex = document.getElementById('case-modal'); if (ex) ex.remove();
        let glow = bg.rarity==='legendary'?'rgba(245,158,11,0.6)':bg.rarity==='mythic'?'rgba(139,92,246,0.6)':bg.rarity==='rare'?'rgba(59,130,246,0.5)':'rgba(236,72,153,0.4)';
        const m = `<div id="case-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(12px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-pink);text-align:center;box-shadow:0 0 50px ${glow};" onclick="event.stopPropagation()"><h3 style="color:#fff;font-size:20px;margin-bottom:15px;font-weight:900;">${isDup ? '🔄 ДУБЛИКАТ' : '✨ НОВЫЙ ФОН!'}</h3><div style="width:100%;height:160px;border-radius:12px;overflow:hidden;margin-bottom:16px;border:2px solid rgba(255,255,255,0.1);position:relative;"><img src="${bg.image}" style="width:100%;height:100%;object-fit:cover;"></div><h4 style="color:var(--accent-pink);font-size:18px;margin-bottom:8px;">${bg.name}</h4><p style="font-size:13px;color:var(--hint-color);margin-bottom:20px;">${text}</p><button class="btn btn-primary" onclick="document.getElementById('case-modal').remove()">Отлично</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', m);
    },
    setBackground(bgId) { if (!AppState.player.unlocked_backgrounds.includes(bgId)) return; AppState.player.current_background = bgId; DB.syncPlayer(); UI.showToast('Фон профиля изменен!', 'success'); UI.renderAll(); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { 
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, 
        fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0, syndicate: null, 
        last_bonus_time: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', 
        unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, weather_forecast_expiry: 0,
        quests: [{ id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false }], 
        skills: { eco: 0, luck: 0, mechanic: 0 }, total_fuel_burned: 0, playtime_minutes: 0, reg_date: new Date().toISOString() 
    },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: ["Системный лог инициализирован..."] },
    worldExtra: { lockedCategories: [], sectorDemand: { hub: null, chem: null, heavy: null, shadow: null } },
    trucks: [], activeTrips: [], leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/nxzLBSw/0-B0-F3-ED8-68-F9-4-D11-9455-63-CEE59-DEC70.png', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic', sector: 'hub' },
        { id: 2, title: 'Обычный: Продукты', name: 'Продукты', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/YBMmXNHj/74065-E6-B-D63-E-446-D-A8-E1-95492-C930-D70.png', reward: 8900, fuel: 100, duration: 22, reqLvl: 2, reqLic: 'basic', sector: 'hub' },
        { id: 3, title: 'Опасный: Химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/DPLBSsd9/80-EEB782-572-C-402-C-B9-A2-AD4-DBFC19357.png', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous', sector: 'chem' },
        { id: 4, title: 'Негабарит: Спецтехника', name: 'Спецтехника', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/WvL7611N/9-BFBF2-DE-90-B2-4970-84-CC-C3-A98248-B0-CE.png', reward: 150000, fuel: 1000, duration: 600, reqLvl: 12, reqLic: 'oversized', sector: 'heavy' },
        { id: 5, title: 'Теневой: Контрабанда', name: 'Контрабанда', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/1GcDdFJ9/D19-A33-BF-999-E-4-B0-F-8-D66-C3714-FCA6163.png', reward: 220000, fuel: 1200, duration: 900, reqLvl: 12, reqLic: 'smuggling', sector: 'shadow' }
    ]
};

const AIDispatcher = {
    messages: ["Следите за бодростью водителя!", "Цены на топливо меняются динамически.", "Используйте метеостанцию перед штормом.", "Своевременно сжигайте уровень розыска адвокатом."],
    showPopup(msg) { const el = document.getElementById('ai-dispatcher'); if (!el) return; document.getElementById('ai-message').innerText = msg; el.classList.add('show'); AudioSys.playVibrate('info'); setTimeout(() => el.classList.remove('show'), 5000); },
    randomAdvice() { if(Math.random() > 0.6) this.showPopup(this.messages[Math.floor(Math.random() * this.messages.length)]); }
};

const DB = {
    async init() {
        try {
            let { data: existingPlayer, error: searchError } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (searchError) throw searchError;
            if (!existingPlayer) await this.createNewPlayer();
            else {
                AppState.player = { ...AppState.player, ...existingPlayer };
                if (AppState.player.fatigue === undefined) AppState.player.fatigue = 100;
                if (AppState.player.wanted_level === undefined) AppState.player.wanted_level = 0;
                if (AppState.player.garage_level === undefined) AppState.player.garage_level = 1;
            }
            await this.loadGameData(); await this.loadLeaderboard(); AdminSys.checkAdminAccess();
            FatigueSys.init(); UI.renderAll();
        } catch (err) { UI.showToast("Ошибка соединения: " + err.message, "error"); }
    },
    async createNewPlayer() {
        let stM = 100000, stF = 400;
        // Добавлены поля, которые нужно сохранять с самого начала
        let pay = { 
            telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, 
            money: stM, fuel_stock: stF, level: AppState.player.level, xp: AppState.player.xp, 
            total_trips: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], 
            current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, 
            wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }
        };
        let { data: newP, error } = await supabaseClient.from('players').insert([pay]).select().single();
        if (!error && newP) AppState.player = { ...AppState.player, ...newP };
    },
    async loadGameData() {
        try {
            const [tRes, trRes] = await Promise.all([supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id), supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)]);
            AppState.trucks = tRes.data || []; AppState.activeTrips = trRes.data || [];
        } catch (e) {}
    },
    async loadLeaderboard() {
        try { const sf = AppState.leaderboardCategory === 'trips' ? 'total_trips' : 'total_profit'; const { data, error } = await supabaseClient.from('players').select('id, name, avatar, total_profit, total_trips, level, syndicate, current_background').order(sf, { ascending: false }).limit(50); if (!error && data) AppState.leaderboard = data; } catch (e) {}
    },
    async syncPlayer() {
        const p = AppState.player; if (!p.id) return;
        // Исправлено: Добавлены недостающие массивы и объекты, чтобы данные не терялись при перезагрузке
        let uD = { 
            name: p.name, avatar: p.avatar, money: Number(p.money), fuel_stock: Number(p.fuel_stock), 
            fuel_price: Number(p.fuel_price), level: Number(p.level), xp: Number(p.xp), 
            total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), 
            fatigue: Number(p.fatigue), wanted_level: Number(p.wanted_level), 
            garage_level: Number(p.garage_level),
            licenses: p.licenses, current_background: p.current_background,
            unlocked_backgrounds: p.unlocked_backgrounds, pass_level: p.pass_level,
            pass_claimed: p.pass_claimed, skills: p.skills
        };
        await supabaseClient.from('players').update(uD).eq('id', p.id);
        this.loadLeaderboard();
    }
};

const GameLogic = {
    isFinishing: false,
    
    // Исправлено: Добавлена отсутствующая функция прокачки навыков!
    async upgradeSkill(skillKey) {
        const currentLvl = AppState.player.skills[skillKey] || 0;
        if (currentLvl >= 5) return UI.showToast('Навык достиг максимального уровня!', 'info');
        
        const cost = 25000 * (currentLvl + 1); // Формула цены прокачки (можешь настроить сам)
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙 для улучшения`, 'error');
        
        AppState.player.money -= cost;
        AppState.player.skills[skillKey] = currentLvl + 1;
        await DB.syncPlayer();
        
        UI.showToast('Навык успешно улучшен!', 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    },

    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    async addXP(amount) {
        AppState.player.xp = Number(AppState.player.xp) + Number(amount); let req = this.getReqXP(AppState.player.level), lu = false;
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; AppState.player.pass_level++; req = this.getReqXP(AppState.player.level); lu = true; }
        if (lu) UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success');
    },
    async buyTruck(shopId) {
        const t = TRUCK_SHOP.find(x => x.id === shopId); if (!t) return;
        if (AppState.trucks.some(x => x.name === t.name)) return UI.showToast('Этот транспорт уже есть!', 'error');
        if (AppState.player.money < t.price) return UI.showToast(`Нужно ${t.price.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= t.price;
        let { data, error } = await supabaseClient.from('trucks').insert([{ player_id: AppState.player.id, name: t.name, capacity: t.capacity, fuel_use: t.fuel_use, rarity: t.rarity, custom_plate: '456LWO|10', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }]).select().single();
        if (error) return UI.showToast("Ошибка при покупке", "error");
        AppState.trucks.push(data); await DB.syncPlayer(); UI.showToast(`Куплен новый транспорт: ${t.name}!`, 'success'); UI.renderAll();
    },
    getRepairCost(val) { 
        if (val >= 100) return 0; 
        let base = (100 - val) * 200;
        let gLvl = AppState.player.garage_level || 1;
        let discount = (gLvl - 1) * 0.15; // Гараж дает скидку 15% за уровень
        return Math.floor(base * (1 - discount));
    },
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
        let gLvl = AppState.player.garage_level || 1;
        const fc = Math.floor(tc * (0.9 - (gLvl - 1) * 0.05));
        if (AppState.player.money < fc) return UI.showToast(`Нужно ${fc.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= fc; pts.forEach(p => t[p] = 100);
        await supabaseClient.from('trucks').update({ engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast(`Комплексное ТО выполнено с учетом бонуса гаража!`, 'success'); UI.renderAll();
    },
    async startTrip(reward, fuel, duration, title, reqLvl, reqLic, sector) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует лицензия!', 'error');
        
        // Проверка блокировки погодой
        if (AppState.worldExtra.lockedCategories.includes(reqLic)) {
            return UI.showToast(`⚠️ Погодные условия блокируют этот класс грузов!`, 'error');
        }

        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !actIds.includes(t.id));
        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягачей!', 'error');
        const idleTruck = idleTrucks[0];

        // Учет рыночного дефицита
        let demandData = AppState.worldExtra.sectorDemand[sector];
        if (demandData && title.includes(demandData.item)) {
            reward = Math.floor(reward * demandData.multiplier);
        }

        let timeMod = WorldState.weather.timeMod;
        if (AppState.player.fatigue < 20) timeMod *= 1.3; // Усталый водитель едет дольше на 30%

        let fFuel = Math.floor(fuel * WorldState.weather.fuelMod);
        let fDur = Math.floor(duration * timeMod);

        if (AppState.player.fuel_stock < fFuel) return UI.showToast(`Нужно ${fFuel}л топлива!`, 'error');
        let endTime = Date.now() + (fDur * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: idleTruck.id, title: title, reward: reward, fuel_req: fFuel, end_time: endTime }]).select().single();
        if (error) return UI.showToast("Ошибка запуска рейса", "error");

        AppState.player.fuel_stock -= fFuel;
        AppState.activeTrips.push(data); 
        await DB.syncPlayer();

        UI.showToast(`Рейс успешно начат на ${idleTruck.name}!`, 'success');
        AudioSys.playSFX('engine');
        UI.renderAll();
    },
    async finishTrip(tripId) {
        if (this.isFinishing) return;
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        const trip = AppState.activeTrips[tIdx]; this.isFinishing = true;
        let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
        AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1;
        
        // Если рейс нелегал — повышаем уровень розыска
        if (trip.title.includes('Теневой')) {
            UnderworldSys.addWanted(1);
        }

        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t) {
            const w = Math.max(1, Math.floor(8 * WorldState.weather.wearMod));
            t.engineLvl = Math.max(0, t.engineLvl - w);
            t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
            t.gearLvl = Math.max(0, t.gearLvl - w);
            t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
        }

        await this.addXP(exp); 
        await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); 
        this.isFinishing = false; 
        await DB.syncPlayer();

        UI.showToast(`Рейс завершен! +${p.toLocaleString()} 🪙 | +${exp} XP`, 'success');
        NotificationSys.sendTelegramPush(`✅ Рейс завершен! Заработано: ${p.toLocaleString()} 🪙`);
        AIDispatcher.randomAdvice(); UI.renderAll();
    },
    async buyFuel(amt) {
        const c = Number(amt) * AppState.player.fuel_price;
        if (AppState.player.money < c) return UI.showToast('Недостаточно монет!', 'error');
        AppState.player.money -= c; AppState.player.fuel_stock += Number(amt);
        await DB.syncPlayer(); UI.showToast(`Куплено ${amt}л топлива`, 'success'); UI.renderAll();
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
        await DB.syncPlayer(); UI.showToast('Профиль сохранен', 'success'); UI.renderAll();
    },
    handleAvatarUpload(ev) {
        const f = ev.target.files[0]; if (!f) return;
        const r = new FileReader(); r.onload = async (e) => { AppState.player.avatar = e.target.result; await DB.syncPlayer(); UI.showToast('Аватар изменен!', 'success'); UI.renderAll(); }; r.readAsDataURL(f);
    },
    claimPassReward(tLvl, cRew) {
        if (!AppState.player.pass_level) AppState.player.pass_level = 1; if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
        if (AppState.player.pass_level < tLvl) return UI.showToast('Уровень не достигнут!', 'error');
        if (AppState.player.pass_claimed.includes(tLvl)) return UI.showToast('Уже получена!', 'info');
        AppState.player.pass_claimed.push(tLvl); AppState.player.money += Number(cRew); DB.syncPlayer();
        UI.showToast(`Награда получена!`, 'success'); UI.renderAll();
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
        AppState.player.syndicate = n; AppState.syndicateData.name = n;
        await DB.syncPlayer(); UI.showToast(`Вступили в ${n}!`, 'success'); UI.renderAll();
    },
    async leaveSyndicate() { if (!AppState.player.syndicate) return; if (confirm("Покинуть?")) { AppState.player.syndicate = null; await DB.syncPlayer(); UI.showToast('Покинули.', 'info'); UI.renderAll(); } },
    upgradeTech(tK) {
        const tC = { security: 1000, logistics: 1500, mechanic: 1200 }; const cL = AppState.syndicateData.techs[tK] || 0;
        if (cL >= 5) return UI.showToast('Максимум!', 'info'); const c = tC[tK] * (cL + 1);
        if (AppState.player.fuel_stock < c) return UI.showToast(`Нужно ${c}л`, 'error');
        AppState.player.fuel_stock -= c; AppState.syndicateData.techs[tK] = cL + 1;
        DB.syncPlayer(); UI.showToast('Технология улучшена!', 'success'); UI.renderAll();
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
        const m = `<div id="inspect-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-purple);text-align:center;position:relative;overflow:hidden;background-image:url('${bO.image}');background-size:cover;background-position:center;" onclick="event.stopPropagation()"><div style="position:absolute;inset:0;background:rgba(12,12,20,0.85);z-index:1;"></div><div style="position:relative;z-index:2;"><div style="width:70px;height:70px;margin:0 auto 10px auto;border-radius:50%;padding:2px;background:var(--gradient-primary);"><img src="${u.avatar || 'https://via.placeholder.com/80'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div><h3 style="color:#fff;font-size:18px;">${u.name}</h3><div style="font-size:12px;color:var(--accent-pink);font-weight:bold;margin-top:2px;">${rT}</div><div style="font-size:11px;color:var(--hint-color);margin-top:4px;">Синдикат: ${u.syndicate || 'Частник'}</div><button type="button" class="btn btn-outline" style="margin-top:12px;font-size:12px;" onclick="document.getElementById('inspect-modal').remove()">Закрыть</button></div></div></div>`;
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
        this.safeUpdate('username', p.name); this.safeUpdate('user-title', ReputationSys.getTitle(p.level)); 
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`); 
        this.safeUpdate('user-fatigue-bar', `🔋 ${Math.floor(p.fatigue || 100)}%`);
        this.safeUpdate('garage-lvl-badge', `Ур. ${p.garage_level || 1}`);

        if (p.wanted_level > 0) {
            const wB = document.getElementById('user-wanted-badge');
            if (wB) { wB.style.display = 'inline-block'; wB.innerText = `⭐ ${p.wanted_level}`; }
        }

        if (p.weather_forecast_expiry && p.weather_forecast_expiry > Date.now()) {
            this.safeUpdate('forecast-status-div', `✅ Прогноз активен: ${WorldState.weather.name} (Влияние на износ х${WorldState.weather.wearMod})`);
        } else {
            this.safeUpdate('forecast-status-div', '');
        }

        this.safeUpdateHTML('backgrounds-inventory-list', BACKGROUNDS_SHOP.map(bg => {
            const u = (p.unlocked_backgrounds || ['bg_r1']).includes(bg.id), s = p.current_background === bg.id;
            return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;opacity:${u?'1':'0.5'};margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;"><img src="${bg.image}" style="width:50px;height:35px;border-radius:6px;object-fit:cover;"><div><div style="font-size:12px;font-weight:bold;">${bg.name}</div><div style="font-size:10px;color:var(--accent-pink);text-transform:uppercase;">${bg.rarity}</div></div></div><button class="btn ${s?'btn-outline':'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!u||s?'disabled':''} onclick="BackgroundCaseSys.setBackground('${bg.id}')">${s?'Активен':(u?'Установить':'Закрыто')}</button></div>`;
        }).join(''));

        this.safeUpdateHTML('background-case-section', `<div class="card" style="border-color:var(--accent-pink);text-align:center;margin-bottom:16px;"><div class="card-title"><span>🎁 Кейс фонов</span></div><p style="font-size:12px;color:var(--hint-color);margin:6px 0 12px 0;">10,000,000 🪙</p><button class="btn btn-primary" onclick="BackgroundCaseSys.openCase()">Открыть (10M 🪙)</button></div>`);

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
                const v = Number(t[pt.k]) || 100; let cl = v < 40 ? '#EF4444' : v < 75 ? '#F59E0B' : '#10B981';
                if (v < 100) a100 = false; const rc = GameLogic.getRepairCost(v); tRC += rc;
                return `<div class="part-card"><div class="part-header"><span>${pt.n}</span><span style="color:${cl};font-weight:800;">${v}%</span></div><div class="part-bar"><div class="part-bar-fill" style="width:${v}%;background-color:${cl};"></div></div><div style="display:flex;gap:4px;margin-top:6px;"><button class="btn btn-outline btn-repair" style="flex:1;padding:4px;" ${isB || v === 100 ? 'disabled' : ''} onclick="GameLogic.repairPart('${t.id}', '${pt.k}')">${v === 100 ? 'OK' : `${(rc/1000).toFixed(1)}k`}</button></div></div>`;
            }).join('');
            return `<div class="card" style="margin-bottom:16px;"><div class="card-title" style="margin-bottom:8px;"><span>🚚 ${t.name}</span>${sH}</div><div class="truck-specs-badge"><div>📦 <span>${sT?.capacity||0} кг</span></div><div>⛽ <span>${sT?.fuel_use||0} л</span></div></div>${sT?.image ? `<div style="text-align:center;margin:10px 0;"><img src="${sT.image}" style="max-width:100%;height:110px;object-fit:contain;"></div>` : ''}<div class="parts-grid" style="margin-top:16px;">${ptH}</div><button class="btn ${a100 || isB ? 'btn-outline' : 'btn-full-service'}" style="width:100%;margin-top:10px;font-size:11px;padding:10px;" ${a100 || isB ? 'disabled' : ''} onclick="GameLogic.repairAll('${t.id}')">${a100 ? 'Исправна' : `ТО со скидкой гаража: ${Math.floor(tRC * 0.9).toLocaleString()}`}</button></div>`;
        }).join('') : `<p style="text-align:center;color:var(--hint-color);margin-bottom:16px;">Гараж пуст!</p>`;
        
        this.safeUpdateHTML('fleet-list', fH);

        this.safeUpdateHTML('licenses-list', LICENSES_SHOP.map(l => { const h = p.licenses.includes(l.id), i = l.type === 'illegal', b = i ? 'var(--accent-pink)' : 'var(--accent-blue)'; return `<div class="card" style="border-color:${b};margin-bottom:10px;"><div class="card-title"><span>${i ? '🥷' : '📜'} ${l.name}</span><span style="color:${h ? '#10B981' : 'var(--accent-pink)'};">${h ? 'Куплено' : `${l.cost.toLocaleString()} 🪙`}</span></div><button class="btn ${h ? 'btn-outline' : 'btn-primary'}" ${h ? 'disabled' : ''} onclick="GameLogic.buyLicense('${l.id}')">${h ? 'Активировано' : 'Приобрести'}</button></div>`; }).join(''));

        // Исправлено: Убрал вызов игровой логики событий отсюда, оставил только рендер
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { 
            let l = Math.floor((tr.end_time - Date.now()) / 1000); 
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } 
            return `<div class="card" style="margin-bottom:12px;border-color:var(--accent-blue);"><div class="card-title"><span>🚚 Рейс в пути</span><span style="color:var(--accent-blue);">⏳ ${l} сек</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; 
        }).join(''));
        
        const hI = AppState.trucks.some(t => !aTI.includes(t.id));
        this.safeUpdateHTML('contracts-list', MapSys.getFilteredContracts().map(c => {
            const lL = p.level < c.reqLvl, lLic = !p.licenses.includes(c.reqLic), iL = lL || lLic;
            let cR = c.reward;
            let demandData = AppState.worldExtra.sectorDemand[c.sector];
            if (demandData && c.title.includes(demandData.item)) cR = Math.floor(cR * demandData.multiplier);

            let bt = lL ? `Ур. ${c.reqLvl}` : lLic ? 'Лицензия' : !hI ? 'Нет фур' : 'Начать рейс';
            return `<div class="contract-card" style="${iL ? 'opacity:0.6' : ''}"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.name}</span></div><div class="contract-reward">+${cR.toLocaleString()} 🪙</div></div><div class="contract-body"><div class="contract-image"><img src="${c.image}"></div><div class="contract-specs"><div class="spec-item"><span>⏱ Время:</span><span style="color:#fff;font-weight:bold;">${c.duration}с</span></div><div class="spec-item"><span>⛽ Топл:</span><span style="color:#fff;font-weight:bold;">${c.fuel}л</span></div></div></div><button class="contract-action-btn ${!hI || iL ? 'disabled' : 'active'}" ${!hI || iL ? 'disabled' : ''} onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}', '${c.sector}')">${bt}</button></div>`;
        }).join(''));

        this.safeUpdateHTML('pass-tiers-list', Array.from({ length: 15 }, (_, i) => { const l = i + 1, r = 10000 + i * 15000, iR = p.pass_level >= l, iC = p.pass_claimed.includes(l); return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;margin-bottom:8px;"><div><div class="card-title" style="font-size:12px;"><span>Ур. ${l}</span></div><p style="font-size:11px;color:var(--hint-color);">+${r.toLocaleString()} 🪙</p></div><button class="btn ${iC ? 'btn-outline' : 'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!iR || iC ? 'disabled' : ''} onclick="GameLogic.claimPassReward(${l}, ${r})">${iC ? 'Получено' : (iR ? 'Забрать' : `Ур. ${l}`)}</button></div>`; }).join(''));
        this.safeUpdateHTML('skills-list', [{ k: 'eco', n: '🍃 Эко-драйв', d: 'Расход топлива' }, { k: 'luck', n: '🍀 Связи', d: 'Шанс форс-мажора' }, { k: 'mechanic', n: '🔧 Механик', d: 'Износ деталей' }].map(s => { const l = p.skills[s.k] || 0, m = l >= 5; return `<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div><div style="font-size:13px;font-weight:700;">${s.n} <span style="color:var(--accent-pink);">[Ур. ${l}/5]</span></div></div><button class="btn ${m ? 'btn-outline' : 'btn-primary'}" style="font-size:11px;padding:6px 12px;width:auto;" ${m ? 'disabled' : ''} onclick="GameLogic.upgradeSkill('${s.k}')">${m ? 'MAX' : 'Улучшить'}</button></div>`; }).join(''));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather(); WorldState.generateMarketEvent(); MarketSys.rotateDemand();
    let p = 0; const ld = document.getElementById('loading-screen');
    if (ld) {
        const int = setInterval(() => { p += 20; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init().then(() => { setTimeout(() => AIDispatcher.showPopup("Добро пожаловать в Logistic World!"), 1500); }); }); } }, 300);
    } else DB.init();

    // Исправлено: Добавлена проверка ивентов в общий таймер, чтобы она не зависела от рендера UI
    setInterval(() => { 
        if (AppState.activeTrips.length > 0) {
            AppState.activeTrips.forEach(tr => {
                if (Math.random() < 0.005) EventSys.checkEventsForTrip(tr);
            });
            UI.renderAll(); 
        }
    }, 1000);
    
    setInterval(() => { WorldState.generateWeather(); MarketSys.rotateDemand(); AIDispatcher.randomAdvice(); }, 180000);
});
window.switchTab = (id) => UI.switchTab(id); window.AudioSys = AudioSys; window.AdminSys = AdminSys; window.GameLogic = GameLogic; window.EventSys = EventSys; window.BackgroundCaseSys = BackgroundCaseSys; window.MapSys = MapSys; window.WeatherSys = WeatherSys; window.FatigueSys = FatigueSys; window.UnderworldSys = UnderworldSys; window.QTEEventSys = QTEEventSys; window.GarageSys = GarageSys; window.UI = UI;
