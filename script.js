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

Const DB = {
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
