const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15,
    TIPS: [
        "Дождь увеличивает износ шин.",
        "Лицензия на опасные грузы приносит больше дохода.",
        "Ремонтируйте фуру вовремя, чтобы избежать штрафов.",
        "Следите за биржей, цены меняются!"
    ]
};

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

// --- АУДИО СИСТЕМА ---
const AudioSys = {
    musicOn: false,
    sfxOn: true,
    bgm: document.getElementById('bg-music'),
    
    toggleMusic() {
        this.musicOn = !this.musicOn;
        if (this.musicOn) this.bgm.play().catch(()=>{});
        else this.bgm.pause();
        document.getElementById('btn-music').innerText = this.musicOn ? "Включено 🔊" : "Выключено 🔇";
        if (this.sfxOn && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    },
    toggleSFX() {
        this.sfxOn = !this.sfxOn;
        document.getElementById('btn-sfx').innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇";
        if (this.sfxOn && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    },
    playVibrate(type = 'success') {
        if (!this.sfxOn || !tg.HapticFeedback) return;
        if(type === 'success') tg.HapticFeedback.notificationOccurred('success');
        if(type === 'error') tg.HapticFeedback.notificationOccurred('error');
        if(type === 'click') tg.HapticFeedback.impactOccurred('medium');
    }
};

// --- ПОГОДА И ИВЕНТЫ ---
const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    globalEvent: null,
    
    generateWeather() {
        const types = [
            { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
            { name: '🔥 Жара', timeMod: 1.0, fuelMod: 1.2, wearMod: 1.1 },
            { name: '🌨 Снег', timeMod: 1.3, fuelMod: 1.1, wearMod: 1.2 },
            { name: '🌧 Ливень', timeMod: 1.1, fuelMod: 1.0, wearMod: 1.3 }
        ];
        this.weather = types[Math.floor(Math.random() * types.length)];
        UI.safeUpdate('weather-info', this.weather.name);
    }
};

// --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---
const AppState = {
    player: {
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '',
        money: 35000, fuel_stock: 400, level: 1, xp: 0,
        total_profit: 0, total_trips: 0, syndicate: null,
        licenses: ['basic'] // basic, dangerous, oversized
    },
    trucks: [],
    activeTrip: null,
    contracts: [
        { id: 1, title: 'Обычный: Стройматериалы', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Срочный: Медикаменты', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 3, title: 'Опасный: Химикаты', reward: 24000, fuel: 260, duration: 60, reqLvl: 5, reqLic: 'dangerous' }
    ]
};

// --- ИИ ДИСПЕТЧЕР ---
const AIDispatcher = {
    messages: [
        "Босс, советую прокачать шины, скоро сезон дождей.",
        "Цены на бирже упали, самое время закупить топливо!",
        "Ваш водитель готов к новому контракту."
    ],
    showPopup(msg) {
        const el = document.getElementById('ai-dispatcher');
        document.getElementById('ai-message').innerText = msg;
        el.classList.add('show');
        AudioSys.playVibrate('click');
        setTimeout(() => el.classList.remove('show'), 5000);
    },
    randomAdvice() {
        if(Math.random() > 0.7) this.showPopup(this.messages[Math.floor(Math.random() * this.messages.length)]);
    }
};

const DB = {
    async init() {
        // Упрощенная инициализация для демо (в реальности тут Supabase fetch)
        if(!AppState.player.id) {
            AppState.player.id = 1;
            AppState.trucks.push({
                id: 1, name: 'LW-CyberTruck Alpha', rarity: 'epic',
                capacity: 5000, fuel_use: 45, 
                engineLvl: 1, tiresLvl: 1, wear: 100
            });
        }
        UI.renderAll();
    }
};

const GameLogic = {
    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    
    async addXP(amount) {
        AppState.player.xp += amount;
        let req = this.getReqXP(AppState.player.level);
        while (AppState.player.xp >= req) {
            AppState.player.xp -= req;
            AppState.player.level++;
            req = this.getReqXP(AppState.player.level);
            UI.showToast(`🎉 УРОВЕНЬ ПОВЫШЕН: ${AppState.player.level}!`, 'success');
        }
    },

    startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast('Уровень слишком мал!', 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Нужна лицензия!', 'error');
        
        // Влияние погоды
        let finalFuel = Math.floor(fuel * WorldState.weather.fuelMod);
        let finalDur = Math.floor(duration * WorldState.weather.timeMod);

        if (AppState.player.fuel_stock < finalFuel) return UI.showToast(`Нужно ${finalFuel}л топлива (из-за погоды)!`, 'error');

        AppState.player.fuel_stock -= finalFuel;
        AppState.activeTrip = { title, reward, end_time: Date.now() + (finalDur * 1000) };
        AudioSys.playVibrate('success');
        UI.renderAll();
    },

    finishTrip() {
        if (!AppState.activeTrip) return;
        let p = AppState.activeTrip.reward;
        AppState.player.money += p;
        AppState.player.total_profit += p;
        AppState.player.total_trips += 1;
        
        this.addXP(Math.floor(p * CONFIG.XP_MULTIPLIER));
        AppState.activeTrip = null;
        
        UI.showToast(`Рейс завершен! +${p} 🪙`, 'success');
        AudioSys.playVibrate('success');
        AIDispatcher.randomAdvice();
        UI.renderAll();
    },

    upgradeTruck(id, part) {
        const t = AppState.trucks.find(x => x.id === id);
        const cost = 5000;
        if(AppState.player.money < cost) return UI.showToast('Недостаточно средств!', 'error');
        AppState.player.money -= cost;
        if(part === 'engine') t.engineLvl++;
        if(part === 'tires') t.tiresLvl++;
        AudioSys.playVibrate('success');
        UI.showToast(`Деталь обновлена!`, 'success');
        UI.renderAll();
    }
};

const UI = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(b => { if(b.getAttribute('onclick')?.includes(tabId)) b.classList.add('active'); });
        AudioSys.playVibrate('click');
        this.renderAll();
    },

    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = `toast ${type}`; t.innerText = msg;
        c.appendChild(t);
        AudioSys.playVibrate(type);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },

    safeUpdate(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; },
    safeUpdateHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; },

    renderAll() {
        const p = AppState.player;
        this.safeUpdate('user-money', `🪙 ${p.money.toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${p.fuel_stock}л`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);
        this.safeUpdate('stat-total-profit', `${p.total_profit.toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', p.total_trips);
        
        if(p.syndicate) {
            this.safeUpdate('corp-name', p.syndicate);
            this.safeUpdate('corp-role', 'Ваша должность: Водитель');
        }

        const xpProg = Math.min((p.xp / GameLogic.getReqXP(p.level)) * 100, 100);
        document.getElementById('xp-bar-fill').style.width = `${xpProg}%`;

        // Рендер лицензий
        const allLic = [{id:'basic', n:'Базовая'}, {id:'dangerous', n:'Опасные грузы'}, {id:'oversized', n:'Негабарит'}];
        this.safeUpdateHTML('licenses-list', allLic.map(l => 
            `<span class="license-badge ${p.licenses.includes(l.id) ? 'active' : ''}">${l.n}</span>`
        ).join(''));

        // Рендер Флота (с прокачкой)
        this.safeUpdateHTML('fleet-list', AppState.trucks.map(t => `
            <div class="card rarity-${t.rarity}">
                <div class="card-title"><span>${t.name}</span><span style="font-size:10px;text-transform:uppercase;">${t.rarity}</span></div>
                <div class="specs-grid">
                    <div>Двигатель: Ур.${t.engineLvl}</div>
                    <div>Шины: Ур.${t.tiresLvl}</div>
                    <div>Состояние: ${t.wear}%</div>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-outline" style="font-size:11px;padding:8px;" onclick="GameLogic.upgradeTruck(${t.id}, 'engine')">Двигатель (5k)</button>
                    <button class="btn btn-outline" style="font-size:11px;padding:8px;" onclick="GameLogic.upgradeTruck(${t.id}, 'tires')">Шины (5k)</button>
                </div>
            </div>
        `).join(''));

        // Рендер Активного рейса
        let tripHtml = '';
        if (AppState.activeTrip) {
            let left = Math.floor((AppState.activeTrip.end_time - Date.now()) / 1000);
            if (left > 0) {
                tripHtml = `<div class="card rarity-epic">
                    <div class="card-title"><span>🚚 В рейсе...</span><span style="color:var(--accent-pink);">⏳ ${left} сек</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">${AppState.activeTrip.title}</p>
                </div>`;
            } else GameLogic.finishTrip();
        }
        this.safeUpdateHTML('active-trip-panel', tripHtml);

        // Рендер Контрактов
        this.safeUpdateHTML('contracts-list', AppState.contracts.map(c => {
            const locked = p.level < c.reqLvl;
            return `<div class="card" style="${locked ? 'opacity:0.6' : ''}">
                <div class="card-title"><span>${c.title}</span><span style="color:var(--accent-pink);">+${c.reward} 🪙</span></div>
                <div class="specs-grid"><div>Время: ${c.duration}с</div><div>Топливо: ${c.fuel}л</div></div>
                <button class="btn btn-primary" ${AppState.activeTrip || locked ? 'disabled' : ''} 
                    onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">
                    ${locked ? `Нужен Ур. ${c.reqLvl}` : 'Начать рейс'}
                </button>
            </div>`;
        }).join(''));
    }
};

// Параллакс эффект для фона
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById('parallax-bg');
    const x = (window.innerWidth - e.pageX * 2) / 90;
    const y = (window.innerHeight - e.pageY * 2) / 90;
    bg.style.transform = `translate(${x}px, ${y}px)`;
});

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather();
    
    // Имитация загрузки
    let p = 0;
    const loader = document.getElementById('loading-screen');
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
                DB.init();
                setTimeout(() => AIDispatcher.showPopup("Добро пожаловать в Logistic World, Босс!"), 1500);
            });
        }
    }, 300);

    setInterval(() => { if (AppState.activeTrip) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); AIDispatcher.randomAdvice(); }, 60000);
});

// Глобальные прокси
window.switchTab = (id) => UI.switchTab(id);
window.AudioSys = AudioSys;
window.GameLogic = GameLogic;
window.UI = UI;
