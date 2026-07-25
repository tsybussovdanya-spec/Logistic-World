// ============================================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP И БАЗЫ ДАННЫХ
// ============================================================================
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, // Опыт = 15% от прибыли
    DAILY_BONUS_COINS: 15000,
    DAILY_BONUS_FUEL: 200,
    BONUS_COOLDOWN_MS: 86400000, // 24 часа
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

// ============================================================================
// 🎵 АУДИО СИСТЕМА И ВИБРАЦИЯ
// ============================================================================
const AudioSys = {
    musicOn: false,
    sfxOn: true,
    bgm: document.getElementById('bg-music'),
    
    toggleMusic() {
        this.musicOn = !this.musicOn;
        if (this.musicOn && this.bgm) this.bgm.play().catch(()=>{});
        else if (this.bgm) this.bgm.pause();
        const btn = document.getElementById('btn-music');
        if (btn) btn.innerText = this.musicOn ? "Включено 🔊" : "Выключено 🔇";
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
// 🌍 ПОГОДА И ГЛОБАЛЬНЫЕ ИВЕНТЫ
// ============================================================================
const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    
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

// ============================================================================
// ⚙️ ГЛОБАЛЬНОЕ СОСТОЯНИЕ (STATE)
// ============================================================================
const AppState = {
    player: {
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '',
        money: 35000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0,
        total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0,
        licenses: ['basic'], pass_level: 1, pass_claimed: []
    },
    trucks: [],
    activeTrip: null,
    leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Стройматериалы', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Срочный: Медикаменты', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 3, title: 'Опасный: Химикаты', reward: 24000, fuel: 260, duration: 60, reqLvl: 5, reqLic: 'dangerous' }
    ]
};

// ============================================================================
// 🤖 ИИ ДИСПЕТЧЕР
// ============================================================================
const AIDispatcher = {
    messages: [
        "Босс, скоро сезон дождей. Подготовьте шины.",
        "Цены на бирже изменились, проверьте вкладку!",
        "Ваш водитель готов к новому контракту.",
        "Не забывайте собирать ежедневный бонус."
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

            if (!existingPlayer) {
                await this.createNewPlayer();
            } else {
                AppState.player = { ...AppState.player, ...existingPlayer };
                if (!AppState.player.pass_level) AppState.player.pass_level = 1;
                if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
            }

            await this.loadGameData();
            await this.loadLeaderboard();
            UI.renderAll();
        } catch (err) {
            UI.showToast("Ошибка соединения с БД: " + err.message, "error");
        }
    },

    async createNewPlayer() {
        let { data: newP, error: insertError } = await supabaseClient
            .from('players')
            .insert([{
                telegram_id: telegramId,
                name: AppState.player.name,
                avatar: AppState.player.avatar,
                money: AppState.player.money,
                fuel_stock: AppState.player.fuel_stock,
                level: AppState.player.level,
                xp: AppState.player.xp,
                total_trips: 0,
                licenses: ['basic'],
                pass_level: 1,
                pass_claimed: []
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        if (newP) {
            AppState.player = { ...AppState.player, ...newP };
            await supabaseClient.from('trucks').insert([{
                player_id: AppState.player.id,
                name: 'LW-CyberTruck Alpha',
                capacity: 5000,
                fuel_use: 45,
                engineLvl: 1,
                tiresLvl: 1,
                wear: 100,
                rarity: 'common'
            }]);
        }
    },

    async loadGameData() {
        try {
            const [trucksRes, tripRes] = await Promise.all([
                supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id),
                supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id).maybeSingle()
            ]);

            AppState.trucks = trucksRes.data || [];
            AppState.activeTrip = tripRes.data || null;
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

            if (!error && data) {
                AppState.leaderboard = data;
            }
        } catch (e) {
            console.error('Ошибка загрузки таблицы лидеров:', e);
        }
    },

    async syncPlayer() {
        const { id, ...updateData } = AppState.player;
        await supabaseClient.from('players').update(updateData).eq('id', id);
        this.loadLeaderboard();
    }
};

// ============================================================================
// 🎮 ИГРОВАЯ ЛОГИКА
// ============================================================================

const GameLogic = {
    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    
    async addXP(amount) {
        AppState.player.xp += amount;
        let req = this.getReqXP(AppState.player.level);
        let leveledUp = false;

        while (AppState.player.xp >= req) {
            AppState.player.xp -= req;
            AppState.player.level++;
            AppState.player.pass_level++;
            req = this.getReqXP(AppState.player.level);
            leveledUp = true;
        }

        if (leveledUp) {
            UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}! (Пропуск обновился)`, 'success');
        }
    },

    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует нужная лицензия!', 'error');
        
        let finalFuel = Math.floor(fuel * WorldState.weather.fuelMod);
        let finalDur = Math.floor(duration * WorldState.weather.timeMod);

        if (AppState.player.fuel_stock < finalFuel) return UI.showToast(`Нужно ${finalFuel}л топлива (из-за погоды)!`, 'error');

        let endTime = Date.now() + (finalDur * 1000);
        AppState.player.fuel_stock -= finalFuel;
        
        let { data, error } = await supabaseClient.from('active_trips').insert([{
            player_id: AppState.player.id,
            title: title,
            reward: reward,
            fuel_req: finalFuel,
            end_time: endTime
        }]).select().single();

        if (error) return UI.showToast("Ошибка запуска рейса", "error");

        AppState.activeTrip = data;
        await DB.syncPlayer();
        UI.showToast('Рейс начат!', 'success');
        UI.renderAll();
    },

    async finishTrip() {
        if (!AppState.activeTrip) return;
        
        let p = AppState.activeTrip.reward;
        let earnedXP = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.money += p;
        AppState.player.total_profit += p;
        AppState.player.total_trips += 1;

        await this.addXP(earnedXP);

        await supabaseClient.from('active_trips').delete().eq('player_id', AppState.player.id);
        AppState.activeTrip = null;

        await DB.syncPlayer();
        UI.showToast(`Рейс завершен! +${p} 🪙 | +${earnedXP} XP`, 'success');
        AIDispatcher.randomAdvice();
        UI.renderAll();
    },

    async buyFuel(amount) {
        let cost = amount * AppState.player.fuel_price;
        if (AppState.player.money < cost) return UI.showToast('Недостаточно монет!', 'error');
        
        AppState.player.money -= cost;
        AppState.player.fuel_stock += amount;
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
        AppState.player.money += CONFIG.DAILY_BONUS_COINS;
        AppState.player.fuel_stock += CONFIG.DAILY_BONUS_FUEL;
        await DB.syncPlayer();
        UI.showToast(`Бонус получен: +${CONFIG.DAILY_BONUS_COINS} 🪙, +${CONFIG.DAILY_BONUS_FUEL}л`, 'success');
        UI.renderAll();
    },

    async saveProfile() {
        let name = document.getElementById('input-username').value.trim();
        if (name) AppState.player.name = name;
        await DB.syncPlayer();
        UI.showToast('Профиль успешно сохранен', 'success');
        UI.renderAll();
    },

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            return UI.showToast('Файл слишком большой (макс. 2МБ)', 'error');
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            AppState.player.avatar = e.target.result;
            await DB.syncPlayer();
            UI.showToast('Аватар успешно изменен!', 'success');
            UI.renderAll();
        };
        reader.readAsDataURL(file);
    },

    claimPassReward(tierLevel, coinReward) {
        if (AppState.player.pass_level < tierLevel) {
            return UI.showToast('Уровень пропуска еще не достигнут!', 'error');
        }
        if (AppState.player.pass_claimed.includes(tierLevel)) {
            return UI.showToast('Награда уже получена!', 'info');
        }

        AppState.player.pass_claimed.push(tierLevel);
        AppState.player.money += coinReward;
        DB.syncPlayer();

        UI.showToast(`Награда за пропуск получена: +${coinReward} 🪙!`, 'success');
        UI.renderAll();
    },

    // 📜 Покупка лицензий
    async buyLicense(licId, cost, reqLvl) {
        if (AppState.player.level < reqLvl) {
            return UI.showToast(`Нужен уровень ${reqLvl} для получения этой лицензии!`, 'error');
        }
        if (AppState.player.licenses.includes(licId)) {
            return UI.showToast('Эта лицензия уже приобретена!', 'info');
        }
        if (AppState.player.money < cost) {
            return UI.showToast('Недостаточно монет для покупки лицензии!', 'error');
        }

        AppState.player.money -= cost;
        AppState.player.licenses.push(licId);
        
        await DB.syncPlayer();
        UI.showToast('Лицензия успешно приобретена!', 'success');
        UI.renderAll();
    },

    async joinSyndicate(name) {
        if (AppState.player.syndicate === name) return UI.showToast('Вы уже в этом синдикате', 'info');
        AppState.player.syndicate = name;
        await DB.syncPlayer();
        UI.showToast(`Вы вступили в ${name}!`, 'success');
        UI.renderAll();
    },

    async upgradeTruck(id, part) {
        const t = AppState.trucks.find(x => x.id === id);
        if (!t) return;
        const cost = 5000;
        if(AppState.player.money < cost) return UI.showToast('Недостаточно средств!', 'error');
        
        AppState.player.money -= cost;
        if(part === 'engine') t.engineLvl++;
        if(part === 'tires') t.tiresLvl++;
        
        await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl }).eq('id', id);
        await DB.syncPlayer();
        
        UI.showToast(`Узел улучшен!`, 'success');
        UI.renderAll();
    },
    
    updateMarket() {
        const minPrice = 8;
        const maxPrice = 22;
        AppState.player.fuel_price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
        UI.renderAll();
    }
};


// ============================================================================
// 🎨 УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
// ============================================================================
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
        if (!c) return;
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
        
        this.safeUpdate('username', p.name);
        this.safeUpdate('user-money', `🪙 ${p.money.toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${p.fuel_stock}л`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);
        
        document.querySelectorAll('#user-avatar').forEach(img => {
            if (p.avatar) img.src = p.avatar;
        });
        
        this.safeUpdate('stat-total-profit', `${p.total_profit.toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', p.total_trips);
        this.safeUpdate('fuel-price', `🪙 ${p.fuel_price}`);
        
        if(p.syndicate) {
            this.safeUpdate('corp-name', p.syndicate);
            this.safeUpdate('corp-role', 'Ваша должность: Логист');
        }

        const xpProg = Math.min((p.xp / GameLogic.getReqXP(p.level)) * 100, 100);
        const xpFill = document.getElementById('xp-bar-fill');
        if (xpFill) xpFill.style.width = `${xpProg}%`;

        const allLic = [{id:'basic', n:'Базовая'}, {id:'dangerous', n:'Опасные грузы'}, {id:'oversized', n:'Негабарит'}];
        this.safeUpdateHTML('licenses-list', allLic.map(l => 
            `<span class="license-badge ${p.licenses.includes(l.id) ? 'active' : ''}">${l.n}</span>`
        ).join(''));

        this.safeUpdateHTML('fleet-list', AppState.trucks.map(t => `
            <div class="card rarity-${t.rarity || 'common'}">
                <div class="card-title"><span>${t.name}</span><span style="font-size:10px;text-transform:uppercase;">${t.rarity || 'common'}</span></div>
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

        this.safeUpdateHTML('contracts-list', AppState.contracts.map(c => {
            const lockedLvl = p.level < c.reqLvl;
            const lockedLic = !p.licenses.includes(c.reqLic);
            const isLocked = lockedLvl || lockedLic;
            
            return `<div class="card" style="${isLocked ? 'opacity:0.6' : ''}">
                <div class="card-title"><span>${c.title}</span><span style="color:var(--accent-pink);">+${c.reward} 🪙</span></div>
                <div class="specs-grid"><div>Время: ${c.duration}с</div><div>Топливо: ${c.fuel}л</div></div>
                <button class="btn btn-primary" ${AppState.activeTrip || isLocked ? 'disabled' : ''} 
                    onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">
                    ${lockedLvl ? `Нужен Ур. ${c.reqLvl}` : (lockedLic ? 'Нет лицензии' : (AppState.activeTrip ? 'Транспорт занят' : 'Начать рейс'))}
                </button>
            </div>`;
        }).join(''));

        this.safeUpdateHTML('leaderboard-list', AppState.leaderboard.map((user, index) => `
            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: bold; font-size: 16px; color: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--hint-color)'};">#${index + 1}</span>
                    <img src="${user.avatar || 'https://via.placeholder.com/40'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${user.name}</div>
                        <div style="font-size: 11px; color: var(--hint-color);">Уровень: ${user.level}</div>
                    </div>
                </div>
                <div style="font-weight: bold; color: var(--accent-pink); font-size: 14px;">🪙 ${user.total_profit.toLocaleString()}</div>
            </div>
        `).join(''));

        const passTiers = [
            { level: 1, reward: 10000, title: 'Уровень 1: Старт Cyber Tokyo' },
            { level: 3, reward: 25000, title: 'Уровень 3: Неоновый обвес' },
            { level: 5, reward: 60000, title: 'Уровень 5: Элитный скин фуры' }
        ];

        this.safeUpdateHTML('pass-tiers-list', passTiers.map(tier => {
            const isReached = p.pass_level >= tier.level;
            const isClaimed = p.pass_claimed.includes(tier.level);
            
            return `<div class="card" style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div class="card-title"><span>${tier.title}</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">Награда: +${tier.reward.toLocaleString()} 🪙</p>
                </div>
                <button class="btn ${isClaimed ? 'btn-outline' : 'btn-primary'}" 
                    style="font-size:12px; padding:8px 12px;"
                    ${!isReached || isClaimed ? 'disabled' : ''}
                    onclick="GameLogic.claimPassReward(${tier.level}, ${tier.reward})">
                    ${isClaimed ? 'Получено' : (isReached ? 'Забрать' : `Нужен ур. ${tier.level}`)}
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
                    
                    DB.init();
                    setTimeout(() => AIDispatcher.showPopup("Добро пожаловать в Logistic World, Босс!"), 1500);
                });
            }
        }, 300);
    } else {
        DB.init();
    }

    setInterval(() => { if (AppState.activeTrip) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); AIDispatcher.randomAdvice(); }, 60000);
    setInterval(() => { GameLogic.updateMarket(); }, 120000);
});

// Глобальные прокси для HTML onclick
window.switchTab = (id) => UI.switchTab(id);
window.AudioSys = AudioSys;
window.GameLogic = GameLogic;
window.UI = UI;
