const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0'
};

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 99999999;
const defaultAvatar = tgUser?.photo_url || 'https://via.placeholder.com/80';

// Полноценный каталог из 60+ единиц тягачей мировой элиты
const TRUCK_CATALOG = [
    { id: 't1', name: 'ГАЗель Метеор', category: 'common', capacity: 1500, fuelUse: 15, price: 50000 },
    { id: 't2', name: 'ЗАЗ Карго Про', category: 'common', capacity: 2200, fuelUse: 20, price: 85000 },
    { id: 't3', name: 'УАЗ Профи Экспедиция', category: 'common', capacity: 2800, fuelUse: 25, price: 110000 },
    { id: 't4', name: 'Ford Transit Logistic', category: 'common', capacity: 3500, fuelUse: 28, price: 140000 },
    { id: 't5', name: 'Mercedes Sprinter Delivery', category: 'common', capacity: 4000, fuelUse: 32, price: 175000 },
    { id: 't6', name: 'IVECO Daily Box', category: 'common', capacity: 4500, fuelUse: 35, price: 210000 },
    { id: 't7', name: 'Peugeot Boxer Cargo', category: 'common', capacity: 4800, fuelUse: 38, price: 230000 },
    { id: 't8', name: 'Fiat Ducato Maxi', category: 'common', capacity: 5000, fuelUse: 40, price: 250000 },
    { id: 't9', name: 'Renault Master Pro', category: 'common', capacity: 5300, fuelUse: 42, price: 275000 },
    { id: 't10', name: 'Volkswagen Crafter Titan', category: 'common', capacity: 5800, fuelUse: 45, price: 300000 },
    { id: 't11', name: 'Hyundai Mighty Cargo', category: 'common', capacity: 6500, fuelUse: 50, price: 340000 },
    { id: 't12', name: 'Foton Aumark Express', category: 'common', capacity: 7000, fuelUse: 53, price: 380000 },
    { id: 't13', name: 'JAC N-Series Global', category: 'common', capacity: 7500, fuelUse: 56, price: 420000 },
    { id: 't14', name: 'ISUZU Elf City', category: 'common', capacity: 8000, fuelUse: 58, price: 460000 },
    { id: 't15', name: 'Hino 300 Master', category: 'common', capacity: 8500, fuelUse: 60, price: 500000 },

    { id: 't16', name: 'Volvo FH16 Classic', category: 'rare', capacity: 10000, fuelUse: 70, price: 650000 },
    { id: 't17', name: 'Scania R450 Streamline', category: 'rare', capacity: 10500, fuelUse: 72, price: 700000 },
    { id: 't18', name: 'MAN TGX EfficientLine', category: 'rare', capacity: 11000, fuelUse: 75, price: 750000 },
    { id: 't19', name: 'Mercedes-Benz Actros MP4', category: 'rare', capacity: 11500, fuelUse: 78, price: 800000 },
    { id: 't20', name: 'DAF XF 530 Super Space', category: 'rare', capacity: 12000, fuelUse: 80, price: 850000 },
    { id: 't21', name: 'Renault T-High Evolution', category: 'rare', capacity: 12500, fuelUse: 82, price: 900000 },
    { id: 't22', name: 'Iveco S-Way Natural', category: 'rare', capacity: 13000, fuelUse: 85, price: 950000 },
    { id: 't23', name: 'KAMAZ 54901 Neo', category: 'rare', capacity: 13500, fuelUse: 88, price: 1000000 },
    { id: 't24', name: 'MAZ 5440M9', category: 'rare', capacity: 14000, fuelUse: 90, price: 1050000 },
    { id: 't25', name: 'Freightliner Cascadia Evo', category: 'rare', capacity: 14500, fuelUse: 92, price: 1100000 },
    { id: 't26', name: 'Kenworth T680 Advantage', category: 'rare', capacity: 15000, fuelUse: 95, price: 1150000 },
    { id: 't27', name: 'Peterbilt 579 Epic', category: 'rare', capacity: 15500, fuelUse: 98, price: 1200000 },
    { id: 't28', name: 'Mack Anthem Highway', category: 'rare', capacity: 16000, fuelUse: 100, price: 1250000 },
    { id: 't29', name: 'Western Star 49X', category: 'rare', capacity: 16500, fuelUse: 103, price: 1300000 },
    { id: 't30', name: 'Shacman X6000 Pro', category: 'rare', capacity: 17000, fuelUse: 105, price: 1350000 },

    { id: 't31', name: 'Volvo FH Electric Nomad', category: 'epic', capacity: 18000, fuelUse: 80, price: 1600000 },
    { id: 't32', name: 'Scania 770S V8 Beast', category: 'epic', capacity: 19000, fuelUse: 120, price: 1750000 },
    { id: 't33', name: 'Tesla Semi Megacharger', category: 'epic', capacity: 20000, fuelUse: 75, price: 1900000 },
    { id: 't34', name: 'Hydrogen HyperTruck H2', category: 'epic', capacity: 21000, fuelUse: 85, price: 2050000 },
    { id: 't35', name: 'Cyber Titan 6x6', category: 'epic', capacity: 22500, fuelUse: 130, price: 2200000 },
    { id: 't36', name: 'Kenworth W900 Legend', category: 'epic', capacity: 24000, fuelUse: 140, price: 2400000 },
    { id: 't37', name: 'Peterbilt 389 Custom', category: 'epic', capacity: 25500, fuelUse: 150, price: 2600000 },
    { id: 't38', name: 'DAF XG+ Aerodynamic', category: 'epic', capacity: 27000, fuelUse: 135, price: 2800000 },
    { id: 't39', name: 'Mercedes-Benz GenH2 Truck', category: 'epic', capacity: 28500, fuelUse: 95, price: 3000000 },
    { id: 't40', name: 'MAN TGX Lion Edition', category: 'epic', capacity: 30000, fuelUse: 155, price: 3200000 },
    { id: 't41', name: 'FAW J7 Global Pioneer', category: 'epic', capacity: 31500, fuelUse: 160, price: 3400000 },
    { id: 't42', name: 'Sinotruk Sitrak C7H Max', category: 'epic', capacity: 33000, fuelUse: 165, price: 3600000 },
    { id: 't43', name: 'UD Quon Master Heavy', category: 'epic', capacity: 34500, fuelUse: 170, price: 3800000 },
    { id: 't44', name: 'Hino Profia 700 Grand', category: 'epic', capacity: 36000, fuelUse: 175, price: 4000000 },
    { id: 't45', name: 'Isuzu Giga Max Power', category: 'epic', capacity: 38000, fuelUse: 180, price: 4250000 },

    { id: 't46', name: 'Quantum Leviathan X', category: 'legendary', capacity: 42000, fuelUse: 200, price: 5000000 },
    { id: 't47', name: 'Titanium Goliath 8x8', category: 'legendary', capacity: 46000, fuelUse: 220, price: 5700000 },
    { id: 't48', name: 'Atom Megalodon Heavy', category: 'legendary', capacity: 50000, fuelUse: 250, price: 6500000 },
    { id: 't49', name: 'Apocalypse Earthshaker', category: 'legendary', capacity: 55000, fuelUse: 280, price: 7500000 },
    { id: 't50', name: 'Caterpillar 797F Heavy Haul', category: 'legendary', capacity: 62000, fuelUse: 320, price: 8800000 },
    { id: 't51', name: 'BelAZ 75710 Transcontinental', category: 'legendary', capacity: 70000, fuelUse: 360, price: 10000000 },
    { id: 't52', name: 'Komatsu 930E Titan', category: 'legendary', capacity: 78000, fuelUse: 400, price: 11500000 },
    { id: 't53', name: 'Liebherr T 284 Monster', category: 'legendary', capacity: 85000, fuelUse: 440, price: 13000000 },
    { id: 't54', name: 'XCMG XDE360 Global', category: 'legendary', capacity: 92000, fuelUse: 480, price: 14500000 },
    { id: 't55', name: 'Sany SRT95 Gigantic', category: 'legendary', capacity: 100000, fuelUse: 520, price: 16000000 },
    { id: 't56', name: 'Interstellar Star-Hauler Alpha', category: 'legendary', capacity: 115000, fuelUse: 580, price: 18500000 },
    { id: 't57', name: 'Orbital Freight Transporter', category: 'legendary', capacity: 130000, fuelUse: 650, price: 21000000 },
    { id: 't58', name: 'Cybernetic Dreadnought V', category: 'legendary', capacity: 150000, fuelUse: 750, price: 24000000 },
    { id: 't59', name: 'Omega Prime Megastructure', category: 'legendary', capacity: 180000, fuelUse: 880, price: 28000000 },
    { id: 't60', name: 'The Absolute World Emperor', category: 'legendary', capacity: 250000, fuelUse: 1200, price: 35000000 }
];

const WorldMapSys = {
    currentCity: 'mow',
    cities: {
        'ber': { name: 'Берлин', x: 300, y: 320, fuelPrice: 22, icon: '🏛️' },
        'mow': { name: 'Москва', x: 500, y: 240, fuelPrice: 12, icon: '🏙️' },
        'kst': { name: 'Костанай', x: 680, y: 280, fuelPrice: 8, icon: '🏭' },
        'pek': { name: 'Пекин', x: 1150, y: 420, fuelPrice: 16, icon: '🏯' },
        'par': { name: 'Париж', x: 220, y: 380, fuelPrice: 24, icon: '🗼' },
        'lon': { name: 'Лондон', x: 160, y: 260, fuelPrice: 26, icon: '🎡' },
        'ast': { name: 'Астана', x: 800, y: 320, fuelPrice: 8, icon: '🏙️' },
        'dxb': { name: 'Дубай', x: 720, y: 680, fuelPrice: 7, icon: '💎' },
        'nyc': { name: 'Нью-Йорк', x: 180, y: 320, fuelPrice: 18, icon: '🗽' },
        'tyo': { name: 'Токио', x: 1350, y: 400, fuelPrice: 20, icon: '🗼' },
        'ala': { name: 'Алматы', x: 830, y: 420, fuelPrice: 9, icon: '🍎' },
        'ist': { name: 'Стамбул', x: 380, y: 480, fuelPrice: 16, icon: '🌉' }
    },
    getRoutes() {
        return [
            { from: 'ber', to: 'mow', dist: 1800 },
            { from: 'mow', to: 'kst', dist: 2100 },
            { from: 'kst', to: 'ast', dist: 900 },
            { from: 'ast', to: 'pek', dist: 3800 },
            { from: 'lon', to: 'par', dist: 450 },
            { from: 'par', to: 'ber', dist: 1150 },
            { from: 'kst', to: 'dxb', dist: 4500 },
            { from: 'pek', to: 'tyo', dist: 2200 },
            { from: 'ast', to: 'ala', dist: 1050 },
            { from: 'ber', to: 'ist', dist: 2000 },
            { from: 'ist', to: 'mow', dist: 1750 }
        ];
    },
    renderMap() {
        const canvas = document.getElementById('map-canvas');
        if(!canvas) return;
        let svg = `<svg style="position:absolute;top:0;left:0;width:2600px;height:1800px;z-index:1;pointer-events:none;">`;
        this.getRoutes().forEach(r => {
            let c1 = this.cities[r.from], c2 = this.cities[r.to];
            if(c1 && c2) svg += `<line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" stroke="#0070F3" stroke-width="2.5" opacity="0.5"/>`;
        });
        svg += `</svg>`;

        let nodes = '';
        for(let k in this.cities) {
            let c = this.cities[k], active = this.currentCity === k;
            nodes += `<div class="map-node ${active?'active-node':''}" style="top:${c.y}px;left:${c.x}px;" onclick="WorldMapSys.selectCity('${k}')">
                <div class="node-icon">${c.icon}</div><div class="node-label">${c.name}</div>
            </div>`;
        }
        canvas.innerHTML = `<div class="map-bg"></div>` + svg + nodes;
        UI.safeUpdate('selected-region-title', `📍 Узел: ${this.cities[this.currentCity].name} | Топливо: ${this.cities[this.currentCity].fuelPrice} 🪙/л`);
    },
    selectCity(id) {
        this.currentCity = id;
        AppState.player.fuel_price = this.cities[id].fuelPrice;
        this.renderMap();
        UI.renderAll();
    },
    initDrag() {
        const c = document.getElementById('map-scroll-container');
        if(!c) return;
        let isDown = false, startX, startY, sl, st;
        c.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - c.offsetLeft; startY = e.pageY - c.offsetTop; sl = c.scrollLeft; st = c.scrollTop; });
        window.addEventListener('mouseup', () => isDown = false);
        c.addEventListener('mousemove', e => { if(!isDown) return; c.scrollLeft = sl - (e.pageX - c.offsetLeft - startX); c.scrollTop = st - (e.pageY - c.offsetTop - startY); });
        
        c.addEventListener('touchstart', e => { isDown = true; startX = e.touches[0].pageX - c.offsetLeft; startY = e.touches[0].pageY - c.offsetTop; sl = c.scrollLeft; st = c.scrollTop; });
        window.addEventListener('touchend', () => isDown = false);
        c.addEventListener('touchmove', e => { if(!isDown) return; c.scrollLeft = sl - (e.touches[0].pageX - c.offsetLeft - startX); c.scrollTop = st - (e.touches[0].pageY - c.offsetTop - startY); }, {passive:true});
    }
};

const AppState = {
    player: { id: null, name: tgUser?.first_name || 'Магнат', avatar: defaultAvatar, money: 10000000, fuel_stock: 50000, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0 },
    stocks: [
        { id: 'st1', name: 'Global Trans Inc.', price: 1200, owned: 0, div: 45 },
        { id: 'st2', name: 'EuroFreight Group', price: 3400, owned: 0, div: 130 },
        { id: 'st3', name: 'Pacific Logistics', price: 8900, owned: 0, div: 350 }
    ],
    activeTrips: [],
    fleet: [
        { id: 't1', name: 'ГАЗель Метеор', capacity: 1500, engineWear: 100, tiresWear: 100, gearboxWear: 100, brakesWear: 100 }
    ],
    driversPool: [
        { id: 'd1', name: 'Алексей Смирнов', skill: 'Ас логистики', salary: 25000, hired: true },
        { id: 'd2', name: 'Дмитрий Васильев', skill: 'Профи', salary: 12000, hired: false },
        { id: 'd3', name: 'Иван Петров', skill: 'Стажер', salary: 5000, hired: false }
    ],
    fleetFilter: 'my',
    leaderboardCategory: 'profit',
    leaderboardData: []
};

const DB = {
    async init() {
        try {
            let { data, error } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if(!data) {
                let { data: newP } = await supabaseClient.from('players').insert([{ telegram_id: telegramId, name: AppState.player.name, avatar: defaultAvatar, money: 10000000, fuel_stock: 50000, level: 1 }]).select().single();
                if(newP) AppState.player = { ...AppState.player, ...newP };
            } else {
                AppState.player = { ...AppState.player, ...data };
                if(!AppState.player.avatar) AppState.player.avatar = defaultAvatar;
            }
            WorldMapSys.renderMap();
            WorldMapSys.initDrag();
            await LeaderboardSys.load();
            UI.renderAll();
        } catch(e) { UI.showToast("Ошибка сети: " + e.message, "error"); }
    },
    async sync() {
        if(!AppState.player.id) return;
        await supabaseClient.from('players').update({ 
            name: AppState.player.name, 
            avatar: AppState.player.avatar, 
            money: AppState.player.money, 
            fuel_stock: AppState.player.fuel_stock, 
            level: AppState.player.level, 
            xp: AppState.player.xp, 
            total_profit: AppState.player.total_profit, 
            total_trips: AppState.player.total_trips 
        }).eq('id', AppState.player.id);
        LeaderboardSys.load();
    }
};

const LeaderboardSys = {
    async load() {
        try {
            const sortField = AppState.leaderboardCategory === 'trips' ? 'total_trips' : 'total_profit';
            let { data, error } = await supabaseClient.from('players').select('id, name, avatar, total_profit, total_trips, level').order(sortField, { ascending: false }).limit(60);
            if(!error && data) {
                AppState.leaderboardData = data;
                UI.renderLeaderboard();
            }
        } catch(e) {}
    },
    switchCategory(cat) {
        AppState.leaderboardCategory = cat;
        document.getElementById('lb-tab-profit').classList.toggle('active', cat === 'profit');
        document.getElementById('lb-tab-trips').classList.toggle('active', cat === 'trips');
        this.load();
    }
};

const GameLogic = {
    buyFuel(amt) {
        let cost = amt * AppState.player.fuel_price;
        if(AppState.player.money < cost) return UI.showToast("Недостаточно средств", "error");
        AppState.player.money -= cost;
        AppState.player.fuel_stock += amt;
        DB.sync();
        UI.showToast(`Приобретено ${amt}л топлива!`, "success");
        UI.renderAll();
    },
    takeLoan() {
        AppState.player.money += 5000000;
        DB.sync();
        UI.showToast("Кредит в 5,000,000 🪙 зачислен на счет!", "success");
        UI.renderAll();
    },
    buyTruck(truckId) {
        let truck = TRUCK_CATALOG.find(t => t.id === truckId);
        if(!truck) return;
        if(AppState.player.money < truck.price) return UI.showToast("Недостаточно средств в казне", "error");
        AppState.player.money -= truck.price;
        AppState.fleet.push({ 
            id: truck.id + '_' + Date.now(), 
            name: truck.name, 
            capacity: truck.capacity, 
            engineWear: 100, 
            tiresWear: 100, 
            gearboxWear: 100, 
            brakesWear: 100 
        });
        DB.sync();
        UI.showToast(`Приобретен тягач: ${truck.name}!`, "success");
        UI.renderAll();
    },
    repairNode(truckId, nodeType) {
        let t = AppState.fleet.find(x => x.id === truckId);
        if(!t) return;
        let cost = 15000;
        if(AppState.player.money < cost) return UI.showToast("Нужно 15,000 🪙 для ремонта узла", "error");
        AppState.player.money -= cost;
        if(nodeType === 'engine') t.engineWear = 100;
        if(nodeType === 'tires') t.tiresWear = 100;
        if(nodeType === 'gearbox') t.gearboxWear = 100;
        if(nodeType === 'brakes') t.brakesWear = 100;
        DB.sync();
        UI.showToast(`Узел успешно обслужен на СТО!`, "success");
        UI.renderAll();
    },
    hireDriver(driverId) {
        let d = AppState.driversPool.find(x => x.id === driverId);
        if(!d || d.hired) return;
        if(AppState.player.money < 100000) return UI.showToast("Нужно 100,000 🪙 для найма профи", "error");
        AppState.player.money -= 100000;
        d.hired = true;
        DB.sync();
        UI.showToast(`Водитель ${d.name} нанят в штат!`, "success");
        UI.renderAll();
    },
    saveProfile() {
        const inp = document.getElementById('input-username');
        if(inp && inp.value.trim().length >= 2) {
            AppState.player.name = inp.value.trim();
            DB.sync();
            UI.showToast("Имя профиля обновлено!", "success");
            UI.renderAll();
        } else {
            UI.showToast("Введите корректное имя", "error");
        }
    },
    startContract(reward, fuel, duration, title) {
        if(AppState.player.fuel_stock < fuel) return UI.showToast("Недостаточно топлива в парке!", "error");
        AppState.player.fuel_stock -= fuel;
        let endTime = Date.now() + duration * 1000;
        AppState.activeTrips.push({ id: Date.now(), reward, title, endTime });
        DB.sync();
        UI.showToast("Спот-контракт подписан, рейс запущен!", "success");
        UI.renderAll();
    },
    finishTrip(tripId) {
        let idx = AppState.activeTrips.findIndex(t => t.id === tripId);
        if(idx === -1) return;
        let t = AppState.activeTrips[idx];
        AppState.player.money += t.reward;
        AppState.player.total_profit += t.reward;
        AppState.player.total_trips++;
        AppState.activeTrips.splice(idx, 1);
        DB.sync();
        UI.showToast(`Рейс завершен! Получено +${t.reward.toLocaleString()} 🪙`, "success");
        UI.renderAll();
    }
};

const AdminSys = {
    addMoney(amt) { AppState.player.money += amt; DB.sync(); UI.renderAll(); UI.showToast("Выдан капитал", "success"); },
    addFuel(amt) { AppState.player.fuel_stock += amt; DB.sync(); UI.renderAll(); UI.showToast("Выдано топливо", "success"); }
};

const UI = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        event.currentTarget.classList.add('active');
        this.renderAll();
    },
    switchFleetTab(category, btnElem) {
        AppState.fleetFilter = category;
        document.querySelectorAll('#tab-fleet .btn-outline').forEach(b => b.classList.remove('active'));
        if(btnElem) btnElem.classList.add('active');
        this.renderAll();
    },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container');
        if(!c) return;
        let t = document.createElement('div');
        t.className = `toast`;
        t.style.borderColor = type === 'success' ? 'var(--success-color)' : '#EF4444';
        t.innerText = msg;
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, val) { const e = document.getElementById(id); if(e) e.innerText = val; },
    renderLeaderboard() {
        const listEl = document.getElementById('leaderboard-list');
        if(!listEl) return;
        listEl.innerHTML = AppState.leaderboardData.map((user, index) => {
            let rankBadge = `#${index + 1}`;
            if(index === 0) rankBadge = '👑 1';
            else if(index === 1) rankBadge = '🥈 2';
            else if(index === 2) rankBadge = '🥉 3';
            
            let val = AppState.leaderboardCategory === 'trips' ? `${user.total_trips || 0} рейсов` : `${Number(user.total_profit || 0).toLocaleString()} 🪙`;
            let avatar = user.avatar || 'https://via.placeholder.com/40';

            return `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; margin-bottom:6px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:900; font-size:12px; width:28px; color:var(--accent-pink);">${rankBadge}</span>
                        <img src="${avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-purple);">
                        <div>
                            <div style="font-size:12px; font-weight:bold;">${user.name}</div>
                            <div style="font-size:9px; color:var(--hint-color);">Уровень ${user.level || 1}</div>
                        </div>
                    </div>
                    <div style="font-size:12px; font-weight:800; color:var(--success-color);">${val}</div>
                </div>
            `;
        }).join('');
    },
    renderAll() {
        let p = AppState.player;
        this.safeUpdate('username', p.name);
        this.safeUpdate('profile-name-text', p.name);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${p.fuel_stock}л`);
        this.safeUpdate('current-fuel-price', `${p.fuel_price} 🪙/л`);
        this.safeUpdate('profile-level-text', `Уровень ${p.level}`);

        const avatarImg = document.getElementById('user-avatar');
        const profileAvatarImg = document.getElementById('profile-avatar-img');
        if(avatarImg) avatarImg.src = p.avatar;
        if(profileAvatarImg) profileAvatarImg.src = p.avatar;

        let activeHtml = AppState.activeTrips.map(tr => {
            let left = Math.floor((tr.endTime - Date.now()) / 1000);
            if(left <= 0) { GameLogic.finishTrip(tr.id); return ''; }
            return `<div class="card" style="border-color:var(--accent-blue);"><div class="card-title"><span>🚚 Доставка в пути</span><span style="color:var(--accent-blue);">⏳ ${left}с</span></div><p style="font-size:11px;color:var(--hint-color);">${tr.title}</p></div>`;
        }).join('');
        const tripPanel = document.getElementById('active-trip-panel');
        if(tripPanel) tripPanel.innerHTML = activeHtml;

        let curCityKey = WorldMapSys.currentCity;
        let cityName = WorldMapSys.cities[curCityKey].name;
        let contractsHtml = '';
        const cargoTypes = ['Электроника', 'Тяжелое оборудование', 'Химикаты', 'Скоропортящийся груз', 'Секретный груз', 'Медикаменты', 'Золотые слитки', 'Космические модули', 'Квантовые процессоры'];
        
        for(let i = 0; i < 6; i++) {
            let cargo = cargoTypes[(i + curCityKey.length) % cargoTypes.length];
            let rew = (i + 1) * 95000 + (curCityKey.length * 15000);
            let fuel = (i + 1) * 190;
            let dur = (i + 1) * 5;
            contractsHtml += `<div class="contract-card">
                <div class="card-title"><span>📦 ${cargo} из ${cityName}</span><span style="color:var(--success-color);">+${rew.toLocaleString()} 🪙</span></div>
                <div style="font-size:11px;color:var(--hint-color);margin-bottom:6px;">Топливо: ${fuel}л | Время в пути: ${dur}с</div>
                <button class="btn btn-primary" onclick="GameLogic.startContract(${rew}, ${fuel}, ${dur}, '${cargo} (${cityName})')">Подписать спот-контракт</button>
            </div>`;
        }
        const cList = document.getElementById('contracts-list');
        if(cList) cList.innerHTML = contractsHtml;

        const fleetArea = document.getElementById('fleet-content-area');
        if(fleetArea) {
            if(AppState.fleetFilter === 'my') {
                fleetArea.innerHTML = AppState.fleet.map(t => `
                    <div class="card" style="border-color:var(--accent-purple);">
                        <div class="card-title"><span>🚛 ${t.name}</span></div>
                        <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Грузоподъемность: ${t.capacity.toLocaleString()} кг</div>
                        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px; margin-bottom:8px; font-size:10px;">
                            <div style="background:rgba(0,0,0,0.3); padding:4px; border-radius:4px;">Двигатель: <strong style="color:var(--success-color);">${t.engineWear}%</strong> <button onclick="GameLogic.repairNode('${t.id}', 'engine')" style="float:right; background:none; border:none; color:var(--accent-pink); cursor:pointer;">[СТО]</button></div>
                            <div style="background:rgba(0,0,0,0.3); padding:4px; border-radius:4px;">Шины: <strong style="color:var(--success-color);">${t.tiresWear}%</strong> <button onclick="GameLogic.repairNode('${t.id}', 'tires')" style="float:right; background:none; border:none; color:var(--accent-pink); cursor:pointer;">[СТО]</button></div>
                            <div style="background:rgba(0,0,0,0.3); padding:4px; border-radius:4px;">КПП: <strong style="color:var(--success-color);">${t.gearboxWear}%</strong> <button onclick="GameLogic.repairNode('${t.id}', 'gearbox')" style="float:right; background:none; border:none; color:var(--accent-pink); cursor:pointer;">[СТО]</button></div>
                            <div style="background:rgba(0,0,0,0.3); padding:4px; border-radius:4px;">Тормоза: <strong style="color:var(--success-color);">${t.brakesWear}%</strong> <button onclick="GameLogic.repairNode('${t.id}', 'brakes')" style="float:right; background:none; border:none; color:var(--accent-pink); cursor:pointer;">[СТО]</button></div>
                        </div>
                    </div>
                `).join('');
            } else if(AppState.fleetFilter === 'drivers') {
                fleetArea.innerHTML = AppState.driversPool.map(d => `
                    <div class="card" style="border-color:var(--accent-blue);">
                        <div class="card-title"><span>👨‍✈️ ${d.name}</span><span style="color:var(--accent-pink);">${d.skill}</span></div>
                        <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Зарплата: ${d.salary.toLocaleString()} 🪙/ч | Статус: ${d.hired ? 'В штате' : 'На рынке'}</div>
                        ${d.hired ? '<button class="btn btn-outline" style="font-size:10px;" disabled>Уже в штате</button>' : '<button class="btn btn-primary" onclick="GameLogic.hireDriver(\'' + d.id + '\')">Нанять (100k 🪙)</button>'}
                    </div>
                `).join('');
            } else {
                let filtered = TRUCK_CATALOG.filter(t => t.category === AppState.fleetFilter);
                fleetArea.innerHTML = filtered.map(t => `
                    <div class="card">
                        <div class="card-title"><span>🚛 ${t.name}</span><span style="color:var(--accent-pink);">${t.price.toLocaleString()} 🪙</span></div>
                        <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Грузоподъемность: ${t.capacity.toLocaleString()} кг | Расход: ${t.fuelUse}л</div>
                        <button class="btn btn-primary" onclick="GameLogic.buyTruck('${t.id}')">Купить в автопарк</button>
                    </div>
                `).join('');
            }
        }

        let stockHtml = AppState.stocks.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid var(--border-color);">
                <div><div style="font-size:12px; font-weight:bold;">${s.name}</div><div style="font-size:10px; color:var(--hint-color);">Цена: ${s.price} 🪙 | Портфель: ${s.owned}</div></div>
                <button class="btn btn-primary" style="width:auto; padding:6px 12px; font-size:10px;" onclick="UI.showToast('Акция приобретена', 'success')">Купить</button>
            </div>
        `).join('');
        const sList = document.getElementById('stock-market-list');
        if(sList) sList.innerHTML = stockHtml;

        const statsEl = document.getElementById('profile-detailed-stats');
        if(statsEl) {
            statsEl.innerHTML = `
                <div style="display:flex;justify-content:space-between;"><span>Общая прибыль:</span><strong style="color:var(--success-color);">${Number(p.total_profit || 0).toLocaleString()} 🪙</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Завершенных рейсов:</span><strong>${p.total_trips || 0}</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Тягачей в гараже:</span><strong>${AppState.fleet.length} ед.</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Водителей в штате:</span><strong>${AppState.driversPool.filter(d=>d.hired).length} чел.</strong></div>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let p = 0;
    const ld = document.getElementById('loading-screen');
    const int = setInterval(() => {
        p += 25;
        document.getElementById('loader-progress').style.width = `${p}%`;
        document.getElementById('loader-percent').innerText = `${p}%`;
        if(p >= 100) {
            clearInterval(int);
            document.getElementById('loader-tap').style.display = 'block';
            ld.addEventListener('click', () => {
                ld.style.opacity = '0';
                document.getElementById('app-content').style.opacity = '1';
                setTimeout(() => ld.remove(), 500);
                DB.init();
            });
        }
    }, 200);

    setInterval(() => { if(AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
});

window.UI = UI;
window.GameLogic = GameLogic;
window.WorldMapSys = WorldMapSys;
window.AdminSys = AdminSys;
window.LeaderboardSys = LeaderboardSys;
