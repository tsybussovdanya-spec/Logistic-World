const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, DAILY_BONUS_COINS: 15000, DAILY_BONUS_FUEL: 200, BONUS_COOLDOWN_MS: 86400000, 
    CASE_COST: 10000000, DUPLICATE_COINS: 1000000, DUPLICATE_XP: 10000,
    FATIGUE_MAX: 100, FATIGUE_DRAIN_RATE: 0.15, MOTEL_COST: 5000, WEATHER_FORECAST_COST: 25000,
    GARAGE_UPGRADE_COSTS: [0, 250000, 1000000, 5000000]
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
    { id: 't9', name: 'Titanium Goliath X', capacity: 40000, fuel_use: 180, rarity: 'legendary', price: 2800000, image: 'https://i.ibb.co.com/RksPdPSb/DF802-CE4-829-F-4-A68-9068-717-B406-D42-AE.png' },
    { id: 't10', name: 'КАМАЗ-Master Dakar', capacity: 6000, fuel_use: 55, rarity: 'rare', price: 320000, image: 'https://i.ibb.co.com/p6XDM2Rx/44-F0-E8-CE-1-CFA-47-E8-AAB4-8-A3-A6-B1-D0-FFD.png' },
    { id: 't11', name: 'MAZ-Euphoria', capacity: 7500, fuel_use: 65, rarity: 'rare', price: 390000, image: 'https://i.ibb.co.com/v63jh8Sw/61-FB1-D82-33-D6-4928-B3-A6-2-B5-D57-A338-FB.png' },
    { id: 't12', name: 'MAN TGX Optimized', capacity: 9500, fuel_use: 70, rarity: 'rare', price: 480000, image: 'https://i.ibb.co.com/hRVfRq6G/271-F0-AAF-8480-41-D8-BEE3-8-EC01-B5-BE97-E.png' },
    { id: 't13', name: 'Mercedes-Benz Actros Pro', capacity: 10000, fuel_use: 72, rarity: 'rare', price: 510000, image: 'https://i.ibb.co.com/C5TVRDX2/60-A0-E34-A-CE54-4243-ADBE-96-F5-A9-F96-EAF.png' },
    { id: 't14', name: 'DAF XG+ Heavy', capacity: 13000, fuel_use: 85, rarity: 'epic', price: 680000, image: 'https://i.ibb.co.com/WNd23f1s/0-E6-FEEE9-5867-4504-B095-FC5-A92-C85-F00.png' },
    { id: 't15', name: 'Renault T-High Ring', capacity: 10500, fuel_use: 74, rarity: 'epic', price: 590000, image: 'https://i.ibb.co.com/ccjV64tt/613-B8045-D8-D0-46-B4-B362-E11-F940-E6-CE5.png' },
    { id: 't16', name: 'Iveco S-Way Biomass', capacity: 9000, fuel_use: 62, rarity: 'rare', price: 440000, image: 'https://i.ibb.co.com/5x580wTg/8-AE858-A3-23-BD-477-B-A735-43-A2-C75-B7-B8-E.png' },
    { id: 't17', name: 'Kenworth W900 Legend', capacity: 18000, fuel_use: 110, rarity: 'epic', price: 1050000, image: 'https://i.ibb.co.com/6cFXLhYF/B419-FC20-BE70-4-BD0-A6-FD-2-B72-D347-C0-EB.png' },
    { id: 't18', name: 'Mack Anthem Titan', capacity: 16000, fuel_use: 95, rarity: 'epic', price: 920000, image: 'https://i.ibb.co.com/RksPdPSb/DF802-CE4-829-F-4-A68-9068-717-B406-D42-AE.png' },
    { id: 't19', name: 'Freightliner Cascadia', capacity: 14500, fuel_use: 88, rarity: 'epic', price: 780000, image: 'https://i.ibb.co.com/p6XDM2Rx/44-F0-E8-CE-1-CFA-47-E8-AAB4-8-A3-A6-B1-D0-FFD.png' },
    { id: 't20', name: 'Western Star 57X', capacity: 15500, fuel_use: 92, rarity: 'epic', price: 850000, image: 'https://i.ibb.co.com/v63jh8Sw/61-FB1-D82-33-D6-4928-B3-A6-2-B5-D57-A338-FB.png' },
    { id: 't21', name: 'Tesla Semi Electric', capacity: 22000, fuel_use: 40, rarity: 'legendary', price: 1800000, image: 'https://i.ibb.co.com/hRVfRq6G/271-F0-AAF-8480-41-D8-BEE3-8-EC01-B5-BE97-E.png' },
    { id: 't22', name: 'Hydrogen HyperTruck H2', capacity: 28000, fuel_use: 50, rarity: 'legendary', price: 2100000, image: 'https://i.ibb.co.com/C5TVRDX2/60-A0-E34-A-CE54-4243-ADBE-96-F5-A9-F96-EAF.png' },
    { id: 't23', name: 'JAC K7 Global', capacity: 11000, fuel_use: 76, rarity: 'rare', price: 530000, image: 'https://i.ibb.co.com/WNd23f1s/0-E6-FEEE9-5867-4504-B095-FC5-A92-C85-F00.png' },
    { id: 't24', name: 'FAW J7 Pioneer', capacity: 12500, fuel_use: 82, rarity: 'rare', price: 620000, image: 'https://i.ibb.co.com/ccjV64tt/613-B8045-D8-D0-46-B4-B362-E11-F940-E6-CE5.png' },
    { id: 't25', name: 'Sinotruk Sitrak C7H', capacity: 13500, fuel_use: 86, rarity: 'epic', price: 710000, image: 'https://i.ibb.co.com/5x580wTg/8-AE858-A3-23-BD-477-B-A735-43-A2-C75-B7-B8-E.png' },
    { id: 't26', name: 'Shacman X6000', capacity: 14000, fuel_use: 89, rarity: 'epic', price: 750000, image: 'https://i.ibb.co.com/6cFXLhYF/B419-FC20-BE70-4-BD0-A6-FD-2-B72-D347-C0-EB.png' },
    { id: 't27', name: 'UD Quon Master', capacity: 9500, fuel_use: 68, rarity: 'rare', price: 460000, image: 'https://i.ibb.co.com/RksPdPSb/DF802-CE4-829-F-4-A68-9068-717-B406-D42-AE.png' },
    { id: 't28', name: 'Hino Profia 700', capacity: 10500, fuel_use: 73, rarity: 'rare', price: 500000, image: 'https://i.ibb.co.com/p6XDM2Rx/44-F0-E8-CE-1-CFA-47-E8-AAB4-8-A3-A6-B1-D0-FFD.png' },
    { id: 't29', name: 'Isuzu Giga Max', capacity: 11500, fuel_use: 78, rarity: 'epic', price: 570000, image: 'https://i.ibb.co.com/v63jh8Sw/61-FB1-D82-33-D6-4928-B3-A6-2-B5-D57-A338-FB.png' },
    { id: 't30', name: 'Atom Megalodon 6x6', capacity: 35000, fuel_use: 160, rarity: 'legendary', price: 2500000, image: 'https://i.ibb.co.com/hRVfRq6G/271-F0-AAF-8480-41-D8-BEE3-8-EC01-B5-BE97-E.png' },
    { id: 't31', name: 'Apocalypse Earthshaker', capacity: 50000, fuel_use: 220, rarity: 'legendary', price: 3500000, image: 'https://i.ibb.co.com/C5TVRDX2/60-A0-E34-A-CE54-4243-ADBE-96-F5-A9-F96-EAF.png' }
];

const LICENSES_SHOP = [
    { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1 },
    { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5 },
    { id: 'oversized', name: 'Негабарит', type: 'legal', cost: 150000, reqLvl: 10 },
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12 }
];

const BACKGROUNDS_SHOP = [
    { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' },
    { id: 'bg_r2', name: 'Ночной траверз', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/HLhsyRKk/IMG-4514.jpg' },
    { id: 'bg_l3', name: 'Транспортный бог', rarity: 'legendary', chance: 1.0, image: 'https://i.ibb.co.com/mV8CH1jr/IMG-4518.jpg' }
];

const DRIVERS_SHOP = [
    { id: 'rookie', name: 'Стажер', cost: 75000, incomePerHr: 15000, color: '#3B82F6' },
    { id: 'pro', name: 'Профи', cost: 250000, incomePerHr: 45000, color: '#F59E0B' },
    { id: 'ace', name: 'Ас логистики', cost: 1000000, incomePerHr: 150000, color: '#8B5CF6' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

const ServerTimeSys = {
    offset: 0,
    async init() {
        try {
            const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            const data = await res.json();
            this.offset = new Date(data.utc_datetime).getTime() - Date.now();
        } catch (e) { this.offset = 0; }
    },
    now() { return Date.now() + this.offset; }
};

const WORLD_MAP = {
    currentCity: 'mow',
    cities: {
        'ber': { name: 'Берлин', x: '18%', y: '35%', fuelPrice: 22, icon: '🏛️' },
        'mow': { name: 'Москва', x: '35%', y: '28%', fuelPrice: 12, icon: '🏙️' },
        'kst': { name: 'Костанай', x: '48%', y: '32%', fuelPrice: 8, icon: '🏭' },
        'pek': { name: 'Пекин', x: '82%', y: '48%', fuelPrice: 16, icon: '🏯' },
        'par': { name: 'Париж', x: '14%', y: '42%', fuelPrice: 24, icon: '🗼' },
        'lon': { name: 'Лондон', x: '10%', y: '30%', fuelPrice: 26, icon: '🎡' },
        'rom': { name: 'Рим', x: '22%', y: '50%', fuelPrice: 23, icon: '🏛️' },
        'mad': { name: 'Мадрид', x: '8%', y: '58%', fuelPrice: 21, icon: '🏰' },
        'war': { name: 'Варшава', x: '25%', y: '34%', fuelPrice: 17, icon: '🏰' },
        'kie': { name: 'Киев', x: '30%', y: '40%', fuelPrice: 14, icon: '⛪' },
        'stp': { name: 'Санкт-Петербург', x: '36%', y: '18%', fuelPrice: 13, icon: '⚓' },
        'kaz': { name: 'Казань', x: '42%', y: '25%', fuelPrice: 11, icon: '🕌' },
        'ekt': { name: 'Екатеринбург', x: '52%', y: '26%', fuelPrice: 10, icon: '⛰️' },
        'nsk': { name: 'Новосибирск', x: '64%', y: '30%', fuelPrice: 9, icon: '❄️' },
        'irk': { name: 'Иркутск', x: '73%', y: '35%', fuelPrice: 9, icon: '🌊' },
        'vvo': { name: 'Владивосток', x: '92%', y: '42%', fuelPrice: 11, icon: '🚢' },
        'ura': { name: 'Уральск', x: '40%', y: '36%', fuelPrice: 8, icon: '🌾' },
        'ala': { name: 'Алматы', x: '60%', y: '48%', fuelPrice: 9, icon: '🍎' },
        'ast': { name: 'Астана', x: '55%', y: '38%', fuelPrice: 8, icon: '🏙️' },
        'tas': { name: 'Ташкент', x: '58%', y: '58%', fuelPrice: 10, icon: '🕌' },
        'bak': { name: 'Баку', x: '42%', y: '55%', fuelPrice: 12, icon: '🛢️' },
        'tev': { name: 'Тегеран', x: '46%', y: '65%', fuelPrice: 10, icon: '🕌' },
        'dub': { name: 'Дубай', x: '52%', y: '78%', fuelPrice: 7, icon: '💎' },
        'mum': { name: 'Мумбаи', x: '66%', y: '75%', fuelPrice: 13, icon: '🌴' },
        'del': { name: 'Дели', x: '68%', y: '60%', fuelPrice: 12, icon: '🛕' },
        'sha': { name: 'Шанхай', x: '85%', y: '58%', fuelPrice: 15, icon: '🌆' },
        'hkong': { name: 'Гонконг', x: '82%', y: '70%', fuelPrice: 16, icon: '⚡' },
        'tok': { name: 'Токио', x: '96%', y: '45%', fuelPrice: 20, icon: '🗼' },
        'sel': { name: 'Сеул', x: '90%', y: '48%', fuelPrice: 17, icon: '🇰🇷' },
        'sin': { name: 'Сингапур', x: '78%', y: '85%', fuelPrice: 14, icon: '🦁' },
        'ban': { name: 'Бангкок', x: '76%', y: '76%', fuelPrice: 13, icon: '🛕' },
        'ist': { name: 'Стамбул', x: '28%', y: '48%', fuelPrice: 16, icon: '🌉' },
        'cai': { name: 'Каир', x: '32%', y: '68%', fuelPrice: 11, icon: '🏜️' },
        'ulb': { name: 'Улан-Батор', x: '72%', y: '28%', fuelPrice: 10, icon: '⛺' }
    },
    routes: [
        { id: 'r1', from: 'ber', to: 'mow', dist: 1800, type: 'autobahn', wearMod: 0.5, speedMod: 1.5, name: 'Европейский транзит' },
        { id: 'r2', from: 'mow', to: 'kst', dist: 2100, type: 'highway', wearMod: 1.0, speedMod: 1.0, name: 'Степной тракт' },
        { id: 'r3', from: 'kst', to: 'pek', dist: 4600, type: 'dirt', wearMod: 2.5, speedMod: 0.7, name: 'Шелковый путь' },
        { id: 'r4', from: 'ber', to: 'par', dist: 1100, type: 'autobahn', wearMod: 0.4, speedMod: 1.6, name: 'Западный экспресс' },
        { id: 'r5', from: 'mow', to: 'ast', dist: 2300, type: 'highway', wearMod: 0.9, speedMod: 1.1, name: 'Евразийский коридор' },
        { id: 'r6', from: 'kst', to: 'ala', dist: 1200, type: 'highway', wearMod: 0.8, speedMod: 1.2, name: 'Южный меридиан' }
    ],
    cargoTypes: [
        { name: 'Электроника', lic: 'basic', baseRew: 8, icon: '💻' },
        { name: 'Стройматериалы', lic: 'basic', baseRew: 5, icon: '🧱' },
        { name: 'Химикаты', lic: 'dangerous', baseRew: 18, icon: '☣️' },
        { name: 'Турбины', lic: 'oversized', baseRew: 25, icon: '🏗️' },
        { name: 'Теневой груз', lic: 'smuggling', baseRew: 40, icon: '🥷' },
        { name: 'Продовольствие', lic: 'basic', baseRew: 6, icon: '🍎' },
        { name: 'Медикаменты', lic: 'basic', baseRew: 9, icon: '💊' },
        { name: 'Спецтехника', lic: 'oversized', baseRew: 30, icon: '🚜' }
    ]
};

const MapSys = {
    selectCity(cityId) {
        WORLD_MAP.currentCity = cityId; 
        AudioSys.playSFX('click'); 
        AudioSys.playVibrate('click');
        AppState.player.fuel_price = WORLD_MAP.cities[cityId].fuelPrice;
        this.renderMapUI(); 
        UI.renderAll();
    },
    selectRegion(regionKey) {
        const mapping = { 'hub': 'mow', 'chem': 'kst', 'heavy': 'ekt', 'shadow': 'ber' };
        if (mapping[regionKey]) this.selectCity(mapping[regionKey]);
    },
    generateDynamicContracts() {
        const contracts = []; 
        const currentId = WORLD_MAP.currentCity;
        WORLD_MAP.routes.forEach(route => {
            if (route.from === currentId || route.to === currentId) {
                const targetId = route.from === currentId ? route.to : route.from;
                const targetCity = WORLD_MAP.cities[targetId];
                for(let i = 0; i < 4; i++) {
                    const cargo = WORLD_MAP.cargoTypes[Math.floor(Math.random() * WORLD_MAP.cargoTypes.length)];
                    const reward = Math.floor(route.dist * cargo.baseRew * (1 + Math.random() * 0.2));
                    const baseFuelReq = Math.floor(route.dist * 0.15); 
                    const durationSec = Math.floor((route.dist / 10) / route.speedMod); 
                    contracts.push({ 
                        id: `dyn_${targetId}_${i}`, 
                        title: `В ${targetCity.name} (${route.name})`, 
                        name: cargo.name, 
                        targetCity: targetId, 
                        diff: route.type === 'dirt' ? 'Сложно' : 'Норма', 
                        badgeClass: cargo.lic === 'smuggling' ? 'badge-illegal' : cargo.lic === 'dangerous' ? 'badge-epic' : 'badge-ordinary', 
                        reward: reward, 
                        baseFuel: baseFuelReq, 
                        duration: durationSec, 
                        reqLvl: cargo.lic === 'smuggling' ? 12 : cargo.lic === 'dangerous' ? 5 : 1, 
                        reqLic: cargo.lic, 
                        routeId: route.id, 
                        icon: cargo.icon 
                    });
                }
            }
        });
        return contracts;
    },
    renderMapUI() {
        const mapCanvas = document.querySelector('.map-canvas'); if(!mapCanvas) return;
        let svgHTML = `<svg style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;">`;
        WORLD_MAP.routes.forEach(r => { 
            const c1 = WORLD_MAP.cities[r.from]; const c2 = WORLD_MAP.cities[r.to]; 
            if(!c1 || !c2) return; 
            const strokeColor = r.type === 'autobahn' ? '#3B82F6' : r.type === 'dirt' ? '#F59E0B' : '#8B5CF6'; 
            const dash = r.type === 'dirt' ? 'stroke-dasharray="5,5"' : ''; 
            svgHTML += `<line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" stroke="${strokeColor}" stroke-width="2.5" opacity="0.6" ${dash} />`; 
        });
        svgHTML += `</svg>`;
        
        let nodesHTML = '';
        for(let key in WORLD_MAP.cities) { 
            let c = WORLD_MAP.cities[key]; 
            let isCurrent = (WORLD_MAP.currentCity === key); 
            nodesHTML += `<div class="map-node ${isCurrent ? 'active-node' : ''}" style="top:${c.y}; left:${c.x};" onclick="MapSys.selectCity('${key}')"><div class="node-pulse ${isCurrent ? 'pulse-epic' : ''}"></div><div class="node-icon">${c.icon}</div><div class="node-label">${c.name}</div></div>`; 
        }
        
        mapCanvas.innerHTML = `<div class="map-bg"></div>` + svgHTML + nodesHTML;
        const cityData = WORLD_MAP.cities[WORLD_MAP.currentCity]; 
        UI.safeUpdate('selected-region-title', `📍 ${cityData.name} | Топливо: ${cityData.fuelPrice} 🪙/л`);
    },
    initDragScroll() {
        const slider = document.getElementById('map-scroll-container');
        if(!slider) return;
        let isDown = false;
        let startX, startY, scrollLeft, scrollTop;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollTop = slider.scrollTop;
        });
        slider.addEventListener('mouseleave', () => { isDown = false; });
        slider.addEventListener('mouseup', () => { isDown = false; });
        slider.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const y = e.pageY - slider.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;
            slider.scrollLeft = scrollLeft - walkX;
            slider.scrollTop = scrollTop - walkY;
        });
    }
};

const AudioSys = {
    musicOn: false, sfxOn: true, bgm: document.getElementById('bg-music'),
    sfxElements: { click: document.getElementById('sfx-click'), success: document.getElementById('sfx-success'), error: document.getElementById('sfx-error'), engine: document.getElementById('sfx-engine') },
    toggleMusic() { this.musicOn = !this.musicOn; const btn = document.getElementById('btn-music'); if (this.musicOn) { if (this.bgm) { this.bgm.volume = 0.3; this.bgm.play().then(() => { if (btn) btn.innerText = "Музыка 🔊"; }).catch(() => { this.musicOn = false; if (btn) btn.innerText = "Музыка 🔇"; }); } } else { if (this.bgm) this.bgm.pause(); if (btn) btn.innerText = "Музыка 🔇"; } this.playVibrate('click'); this.playSFX('click'); },
    toggleSFX() { this.sfxOn = !this.sfxOn; const btn = document.getElementById('btn-sfx'); if (btn) btn.innerText = this.sfxOn ? "Эффекты 🔊" : "Эффекты 🔇"; this.playVibrate('click'); this.playSFX('click'); },
    playSFX(type) { if (!this.sfxOn) return; const sound = this.sfxElements[type]; if (sound) { sound.currentTime = 0; sound.volume = 0.6; sound.play().catch(() => {}); } },
    playVibrate(type = 'success') { if (!this.sfxOn || !tg.HapticFeedback) return; if(type === 'success') tg.HapticFeedback.notificationOccurred('success'); if(type === 'error') tg.HapticFeedback.notificationOccurred('error'); if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium'); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { 
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, 
        fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0, syndicate: null, 
        last_bonus_time: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', 
        unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, 
        total_fuel_burned: 0, playtime_minutes: 0, hired_drivers: [], last_passive_collect: 0,
        daily_streak: 0, last_daily_claim: 0, syndicate_role: 'member', syndicate_contribution: 0
    },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, treasuryCoins: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: [], membersCount: 1 },
    worldExtra: { lockedCategories: [], sectorDemand: {} },
    trucks: [], activeTrips: [], leaderboard: []
};

const DB = {
    async init() {
        try {
            await ServerTimeSys.init();
            let { data: existingPlayer, error: searchError } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (searchError) throw searchError;
            if (!existingPlayer) await this.createNewPlayer();
            else { 
                AppState.player = { ...AppState.player, ...existingPlayer }; 
                if(!AppState.player.hired_drivers) AppState.player.hired_drivers = [];
                if(!AppState.player.last_passive_collect) AppState.player.last_passive_collect = ServerTimeSys.now();
                if(!AppState.player.daily_streak) AppState.player.daily_streak = 0;
                if(!AppState.player.last_daily_claim) AppState.player.last_daily_claim = 0;
            }
            await this.loadGameData(); await this.loadLeaderboard(); 
            MapSys.renderMapUI();
            MapSys.initDragScroll();
            OfflineProgressSys.process();
            UI.renderAll();
        } catch (err) { UI.showToast("Ошибка соединения: " + err.message, "error"); }
    },
    async createNewPlayer() {
        let pay = { 
            telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: 100000, 
            fuel_stock: 400, level: 1, xp: 0, total_trips: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], 
            current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, 
            skills: { eco: 0, luck: 0, mechanic: 0 }, total_profit: 0, total_fuel_burned: 0, playtime_minutes: 0, 
            hired_drivers: [], last_passive_collect: ServerTimeSys.now(), daily_streak: 0, last_daily_claim: 0 
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
        let uD = { 
            name: p.name, avatar: p.avatar, money: Number(p.money), fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price), 
            level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), 
            fatigue: Number(p.fatigue), wanted_level: Number(p.wanted_level), garage_level: Number(p.garage_level), licenses: p.licenses, 
            current_background: p.current_background, unlocked_backgrounds: p.unlocked_backgrounds, pass_level: p.pass_level, 
            pass_claimed: p.pass_claimed, skills: p.skills, total_fuel_burned: Number(p.total_fuel_burned), playtime_minutes: Number(p.playtime_minutes), 
            hired_drivers: p.hired_drivers, last_passive_collect: p.last_passive_collect, daily_streak: p.daily_streak, 
            last_daily_claim: p.last_daily_claim, syndicate: p.syndicate === 'null' ? null : p.syndicate, syndicate_role: p.syndicate_role, syndicate_contribution: p.syndicate_contribution 
        };
        await supabaseClient.from('players').update(uD).eq('id', p.id);
        this.loadLeaderboard();
    }
};

const FatigueSys = {
    useEnergyDrink() {
        if (AppState.player.money < 2000) return UI.showToast('Нужно 2,000 🪙 для покупки энергетика', 'error');
        AppState.player.money -= 2000;
        AppState.player.fatigue = Math.min(100, AppState.player.fatigue + 40);
        DB.syncPlayer();
        UI.showToast('⚡ Вы выпили энергетик! Бодрость +40%', 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    },
    restAtMotel() {
        if (AppState.player.money < CONFIG.MOTEL_COST) return UI.showToast(`Нужно ${CONFIG.MOTEL_COST.toLocaleString()} 🪙 для ночлега`, 'error');
        AppState.player.money -= CONFIG.MOTEL_COST;
        AppState.player.fatigue = 100;
        DB.syncPlayer();
        UI.showToast('🛏️ Вы отдохнули в мотеле. Бодрость восстановлена до 100%!', 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

const WeatherSys = {
    buyForecast() {
        if (AppState.player.money < CONFIG.WEATHER_FORECAST_COST) return UI.showToast(`Нужно ${CONFIG.WEATHER_FORECAST_COST.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= CONFIG.WEATHER_FORECAST_COST;
        DB.syncPlayer();
        const el = document.getElementById('forecast-status-div');
        if(el) el.innerText = "✅ Прогноз погоды: На всех трассах ясное небо и идеальное сцепление на ближайшие 2 часа.";
        UI.showToast('📡 Метеопрогноз приобретен!', 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

const GarageSys = {
    upgradeGarage() {
        const lvl = AppState.player.garage_level || 1;
        if(lvl >= 4) return UI.showToast('Гараж максимального уровня!', 'info');
        const cost = CONFIG.GARAGE_UPGRADE_COSTS[lvl] || 500000;
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= cost;
        AppState.player.garage_level = lvl + 1;
        DB.syncPlayer();
        UI.showToast(`🏠 Гараж улучшен до Уровня ${AppState.player.garage_level}!`, 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

const UnderworldSys = {
    hireLawyer() {
        if(AppState.player.wanted_level <= 0) return UI.showToast('Ваше досье и так чисто!', 'info');
        if (AppState.player.money < 150000) return UI.showToast('Нужно 150,000 🪙 для услуг адвоката', 'error');
        AppState.player.money -= 150000;
        AppState.player.wanted_level = 0;
        DB.syncPlayer();
        UI.showToast('⚖️ Адвокат очистил ваше досье в ФСБ!', 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

const AdminSys = {
    addMoney(amt) { AppState.player.money += amt; DB.syncPlayer(); UI.showToast(`+${amt.toLocaleString()} 🪙 (Админ)`, 'success'); UI.renderAll(); },
    addFuel(amt) { AppState.player.fuel_stock += amt; DB.syncPlayer(); UI.showToast(`+${amt}л Топлива (Админ)`, 'success'); UI.renderAll(); },
    setLevel(lvl) { AppState.player.level = lvl; DB.syncPlayer(); UI.showToast(`Установлен Уровень ${lvl} (Админ)`, 'success'); UI.renderAll(); },
    unlockAll() { 
        AppState.player.licenses = ['basic', 'dangerous', 'oversized', 'smuggling']; 
        AppState.player.unlocked_backgrounds = BACKGROUNDS_SHOP.map(b => b.id);
        DB.syncPlayer(); UI.showToast('Разблокировано ВСЁ (Админ)', 'success'); UI.renderAll(); 
    }
};

const DriverSys = {
    async hireDriver(truckId, driverId) {
        const d = DRIVERS_SHOP.find(x => x.id === driverId); if (!d) return;
        if (AppState.player.money < d.cost) return UI.showToast(`Нужно ${d.cost.toLocaleString()} 🪙`, 'error');
        if (AppState.player.hired_drivers.some(x => x.truck_id === truckId)) return UI.showToast('Для этой фуры уже нанят водитель!', 'error');

        await this.collectPassive(ServerTimeSys.now());
        AppState.player.money -= d.cost;
        AppState.player.hired_drivers.push({ truck_id: truckId, driver_id: driverId });
        await DB.syncPlayer();
        UI.showToast(`Водитель "${d.name}" успешно нанят!`, 'success'); AudioSys.playSFX('success');
        UI.renderAll();
    },
    async fireDriver(truckId) {
        if(!AppState.player.hired_drivers) return;
        await this.collectPassive(ServerTimeSys.now());
        AppState.player.hired_drivers = AppState.player.hired_drivers.filter(x => x.truck_id !== truckId);
        await DB.syncPlayer();
        UI.showToast('Водитель уволен.', 'info');
        UI.renderAll();
    },
    calculatePassiveIncome(now) {
        if(!AppState.player.hired_drivers || AppState.player.hired_drivers.length === 0) return 0;
        let last = AppState.player.last_passive_collect || now;
        let hrs = (now - last) / 3600000;
        if (hrs < 0) hrs = 0;
        let income = 0;
        AppState.player.hired_drivers.forEach(hd => {
            const d = DRIVERS_SHOP.find(x => x.id === hd.driver_id);
            if(d) income += d.incomePerHr * hrs;
        });
        return Math.floor(income);
    },
    async collectPassive(now) {
        let inc = this.calculatePassiveIncome(now);
        if (inc > 0) {
            AppState.player.money += inc;
            AppState.player.total_profit += inc;
            AppState.player.last_passive_collect = now;
        }
        return inc;
    }
};

const OfflineProgressSys = {
    async process() {
        const now = ServerTimeSys.now();
        let offlineEarnings = 0; let offlineTripsCompleted = 0; const tripsToDelete = [];

        let passiveIncome = await DriverSys.collectPassive(now);
        offlineEarnings += passiveIncome;

        for (let i = AppState.activeTrips.length - 1; i >= 0; i--) {
            const trip = AppState.activeTrips[i];
            if (trip.end_time <= now) {
                let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
                offlineEarnings += p; offlineTripsCompleted += 1;
                AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1; AppState.player.total_fuel_burned += trip.fuel_req;
                GameLogic.addXP_silent(exp); 
                
                const t = AppState.trucks.find(x => x.id === trip.truck_id);
                if (t) {
                    const rData = WORLD_MAP.routes.find(r => r.id === trip.route_id) || { wearMod: 1.0 };
                    const w = Math.floor(8 * rData.wearMod); 
                    t.engineLvl = Math.max(0, t.engineLvl - w); t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
                    t.gearLvl = Math.max(0, t.gearLvl - w); t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
                    await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
                }
                tripsToDelete.push(trip.id); AppState.activeTrips.splice(i, 1);
            }
        }
        if (tripsToDelete.length > 0 || passiveIncome > 0) {
            for (let id of tripsToDelete) await supabaseClient.from('active_trips').delete().eq('id', id);
            await DB.syncPlayer(); this.showOfflineModal(offlineTripsCompleted, offlineEarnings, passiveIncome);
        }
    },
    showOfflineModal(tripsCount, earnings, passive) {
        let ex = document.getElementById('offline-modal'); if (ex) ex.remove();
        const m = `<div id="offline-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(10px);"><div class="card" style="width:100%;max-width:360px;border-color:var(--success-color);text-align:center;box-shadow:0 0 40px rgba(16, 185, 129, 0.4);"><div style="font-size:40px;margin-bottom:10px;">📈</div><h3 style="color:#fff;font-size:20px;margin-bottom:8px;font-weight:900;">ОТЧЕТ КОРПОРАЦИИ</h3><p style="font-size:13px;color:var(--hint-color);margin-bottom:20px;">Пока вы отсутствовали, корпорация продолжала работать.</p><div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:12px;margin-bottom:20px;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:var(--hint-color);">Ручных рейсов:</span><span style="color:#fff;font-weight:bold;">${tripsCount}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:var(--hint-color);">Доход автопилота:</span><span style="color:var(--accent-blue);font-weight:bold;">+${passive.toLocaleString()} 🪙</span></div><hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;"><div style="display:flex;justify-content:space-between;"><span style="color:var(--hint-color);">Итого прибыль:</span><span style="color:var(--success-color);font-weight:bold;font-size:16px;">+${earnings.toLocaleString()} 🪙</span></div></div><button class="btn btn-primary" style="width:100%;" onclick="document.getElementById('offline-modal').remove(); AudioSys.playSFX('success');">Забрать выручку</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', m); AudioSys.playVibrate('success');
    }
};

const GameLogic = {
    isFinishing: false,
    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    
    async addXP(amount) {
        AppState.player.xp += Number(amount); let req = this.getReqXP(AppState.player.level), lu = false;
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; AppState.player.pass_level++; req = this.getReqXP(AppState.player.level); lu = true; }
        if (lu) UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success');
    },

    addXP_silent(amount) {
        AppState.player.xp += Number(amount); let req = this.getReqXP(AppState.player.level);
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; AppState.player.pass_level++; req = this.getReqXP(AppState.player.level); }
    },
    
    async buyTruck(shopId) {
        const t = TRUCK_SHOP.find(x => x.id === shopId); if (!t) return;
        if (AppState.player.money < t.price) return UI.showToast(`Нужно ${t.price.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= t.price;
        let { data, error } = await supabaseClient.from('trucks').insert([{ player_id: AppState.player.id, name: t.name, capacity: t.capacity, fuel_use: t.fuel_use, rarity: t.rarity, custom_plate: '456LWO|10', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }]).select().single();
        if (error) return;
        AppState.trucks.push(data); await DB.syncPlayer(); UI.showToast(`Куплен новый транспорт: ${t.name}!`, 'success'); UI.renderAll();
    },

    getRepairCost(val) { 
        if (val >= 100) return 0; 
        let base = (100 - val) * 200;
        let gLvl = AppState.player.garage_level || 1;
        return Math.floor(base * (1 - ((gLvl - 1) * 0.15)));
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
        await DB.syncPlayer(); UI.showToast(`Комплексное ТО выполнено!`, 'success'); UI.renderAll();
    },
    
    async startTrip(reward, baseFuel, duration, title, reqLvl, reqLic, targetCity, routeId) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует лицензия!', 'error');

        if (AppState.player.fatigue <= 10) {
            return UI.showToast('🛑 Водитель полностью истощен! Отдохните в мотеле или выпейте энергетик.', 'error');
        }

        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const autopilotIds = AppState.player.hired_drivers.map(d => d.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !actIds.includes(t.id) && !autopilotIds.includes(t.id));
        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягачей (без водителей)!', 'error');
        
        const idleTruck = idleTrucks[0];

        const avgCondition = ((idleTruck.engineLvl + idleTruck.tiresLvl + idleTruck.gearLvl + idleTruck.brakesLvl) / 4);
        if (avgCondition < 30) {
            return UI.showToast(`⚠️ Тягач "${idleTruck.name}" слишком изношен (состояние <30%). Требуется срочное ТО!`, 'error');
        }

        const shopTruckData = TRUCK_SHOP.find(x => x.name === idleTruck.name);

        let timeMod = 1.0; 
        let rewardBonusMod = 1.0;
        if (AppState.player.fatigue < 40) {
            timeMod *= 1.4;
            UI.showToast('⚠️ Внимание: Низкая бодрость увеличивает время в пути!', 'info');
        }

        if(AppState.player.syndicate) {
            const logTech = AppState.syndicateData.techs.logistics || 0;
            rewardBonusMod += logTech * 0.05;
        }

        let fuelMod = (shopTruckData ? shopTruckData.fuel_use : 50) / 30; 
        let fFuel = Math.floor(baseFuel * fuelMod);
        let fDur = Math.floor(duration * timeMod);
        let finalReward = Math.floor(reward * rewardBonusMod);

        if (AppState.player.fuel_stock < fFuel) return UI.showToast(`Нужно ${fFuel}л топлива!`, 'error');
        
        AppState.player.fatigue = Math.max(0, AppState.player.fatigue - 15);

        let endTime = ServerTimeSys.now() + (fDur * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{ 
            player_id: AppState.player.id, truck_id: idleTruck.id, title: title, 
            reward: finalReward, fuel_req: fFuel, end_time: endTime, route_id: routeId 
        }]).select().single();
        
        if (error) return UI.showToast("Ошибка запуска рейса", "error");

        AppState.player.fuel_stock -= fFuel; 
        AppState.activeTrips.push(data); 
        await DB.syncPlayer();

        UI.showToast(`Рейс успешно отправлен на ${idleTruck.name}!`, 'success'); 
        AudioSys.playSFX('engine'); 
        UI.renderAll();
    },
    
    async finishTrip(tripId) {
        if (this.isFinishing) return;
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        
        const trip = AppState.activeTrips[tIdx];
        if (trip.end_time > ServerTimeSys.now()) return; 

        this.isFinishing = true;
        let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.total_fuel_burned = (AppState.player.total_fuel_burned || 0) + trip.fuel_req;
        AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1;

        if(AppState.player.syndicate) {
            let syndTax = Math.floor(p * 0.02);
            AppState.syndicateData.treasuryCoins = (AppState.syndicateData.treasuryCoins || 0) + syndTax;
            AppState.player.syndicate_contribution = (AppState.player.syndicate_contribution || 0) + syndTax;
        }

        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t) {
            const rData = WORLD_MAP.routes.find(r => r.id === trip.route_id) || { wearMod: 1.0 };
            
            let mechMod = 1.0;
            if(AppState.player.syndicate) {
                let mechTech = AppState.syndicateData.techs.mechanic || 0;
                mechMod -= mechTech * 0.08;
            }

            const w = Math.floor(8 * rData.wearMod * Math.max(0.2, mechMod)); 
            t.engineLvl = Math.max(0, t.engineLvl - w); t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
            t.gearLvl = Math.max(0, t.gearLvl - w); t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
        }

        await this.addXP(exp); 
        await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); 
        this.isFinishing = false; await DB.syncPlayer();

        UI.showToast(`Рейс завершен! +${p.toLocaleString()} 🪙`, 'success'); UI.renderAll();
    },

    async buyFuel(amt) {
        const c = Number(amt) * AppState.player.fuel_price;
        if (AppState.player.money < c) return UI.showToast('Недостаточно монет!', 'error');
        AppState.player.money -= c; AppState.player.fuel_stock += Number(amt);
        await DB.syncPlayer(); UI.showToast(`Куплено ${amt}л топлива`, 'success'); UI.renderAll();
    },

    async createSyndicate(nameInput) {
        let name = (nameInput || '').trim();
        if(name.length < 3) return UI.showToast('Название от 3 символов', 'error');
        if(AppState.player.money < 500000) return UI.showToast('Нужно 500,000 🪙 для создания синдиката', 'error');
        AppState.player.money -= 500000;
        AppState.player.syndicate = name;
        AppState.player.syndicate_role = 'leader';
        AppState.syndicateData.name = name;
        AppState.syndicateData.treasuryCoins = 0;
        AppState.syndicateData.treasuryFuel = 0;
        await DB.syncPlayer();
        UI.showToast(`Синдикат "${name}" успешно создан! Вы лидер.`, 'success');
        UI.renderAll();
    },

    async joinSyndicate(nameInput) {
        let name = (nameInput || '').trim();
        if(!name) return UI.showToast('Введите название синдиката', 'error');
        AppState.player.syndicate = name;
        AppState.player.syndicate_role = 'member';
        AppState.syndicateData.name = name;
        await DB.syncPlayer();
        UI.showToast(`Вы присоединились к "${name}"!`, 'success');
        UI.renderAll();
    },

    async leaveSyndicate() {
        if(!confirm('Покинуть синдикат? Вы потеряете накопленный вклад.')) return;
        AppState.player.syndicate = null;
        AppState.player.syndicate_role = 'member';
        AppState.player.syndicate_contribution = 0;
        AppState.syndicateData.name = null;
        await DB.syncPlayer();
        UI.showToast('Вы покинули синдикат.', 'info');
        UI.renderAll();
    },

    async upgradeSyndicateTech(techKey) {
        const cost = 50000;
        let treasury = AppState.syndicateData.treasuryCoins || 0;
        if(treasury < cost) return UI.showToast(`В кассе синдиката недостаточно монет (нужно ${cost.toLocaleString()} 🪙)`, 'error');
        
        AppState.syndicateData.treasuryCoins -= cost;
        if(!AppState.syndicateData.techs[techKey]) AppState.syndicateData.techs[techKey] = 0;
        AppState.syndicateData.techs[techKey]++;
        await DB.syncPlayer();
        UI.showToast('Корпоративная технология успешно улучшена!', 'success');
        UI.renderAll();
    },

    async claimPassReward(tierLevel, rewardAmount) {
        const currentTier = AppState.player.pass_level || 1;
        if (currentTier < tierLevel) return UI.showToast('Этот уровень еще не разблокирован!', 'error');
        
        if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
        if (AppState.player.pass_claimed.includes(tierLevel)) return UI.showToast('Награда уже получена!', 'error');

        AppState.player.pass_claimed.push(tierLevel);
        AppState.player.money += rewardAmount;
        await DB.syncPlayer();
        UI.showToast(`🎁 Получена награда Season Pass Ур. ${tierLevel}: +${rewardAmount.toLocaleString()} 🪙`, 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    },

    async claimDailyBonus() {
        DailySys.claimReward();
    },

    saveProfile() {
        const inputName = document.getElementById('input-username');
        if(inputName && inputName.value.trim().length >= 2) {
            AppState.player.name = inputName.value.trim();
            DB.syncPlayer();
            UI.showToast('Профиль успешно сохранен!', 'success');
            UI.renderAll();
        } else {
            UI.showToast('Введите корректное имя (от 2 символов)', 'error');
        }
    },

    inviteFriend() {
        const refLink = `https://t.me/share/url?url=https://t.me/LogisticWorldBot?start=${telegramId}&text=Присоединяйся%20к%20моей%20транспортной%20империи%20в%20Logistic%20World!`;
        if(tg.openTelegramLink) tg.openTelegramLink(refLink);
        else window.open(refLink, '_blank');
    },

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.player.avatar = e.target.result;
            DB.syncPlayer();
            UI.showToast('Аватар обновлен!', 'success');
            UI.renderAll();
        };
        reader.readAsDataURL(file);
    }
};

const DailySys = {
    async claimReward() {
        const now = ServerTimeSys.now();
        const oneDay = 86400000;
        const lastClaim = AppState.player.last_daily_claim || 0;
        
        if (now - lastClaim < oneDay) {
            if (now - lastClaim > oneDay * 2) {
                AppState.player.daily_streak = 0;
            } else {
                return UI.showToast("Награда уже получена сегодня! Ждите сброса таймера.", "error");
            }
        }

        AppState.player.daily_streak = (AppState.player.daily_streak || 0) + 1;
        if(AppState.player.daily_streak > 7) AppState.player.daily_streak = 1;

        const day = AppState.player.daily_streak;
        const rewardCoins = day * 15000;
        const rewardFuel = day * 200;

        AppState.player.money += rewardCoins;
        AppState.player.fuel_stock += rewardFuel;
        AppState.player.last_daily_claim = now;

        await DB.syncPlayer();
        UI.showToast(`🎁 Награда за День ${day} получена! +${rewardCoins.toLocaleString()} 🪙, +${rewardFuel}л`, 'success');
        AudioSys.playSFX('success');
        UI.renderAll();
    }
};

const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        const t = document.getElementById(`tab-${tId}`); if (t) t.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(b => { if(b.getAttribute('onclick')?.includes(tId)) b.classList.add('active'); });
        AudioSys.playVibrate('click'); AudioSys.playSFX('click'); this.renderAll();
    },
    switchLeaderboardCategory(cat) {
        AppState.leaderboardCategory = cat;
        document.getElementById('lb-tab-profit').classList.toggle('active', cat === 'profit');
        document.getElementById('lb-tab-trips').classList.toggle('active', cat === 'trips');
        DB.loadLeaderboard().then(() => this.renderAll());
    },
    inspectPlayer(uId) {
        const u = AppState.leaderboard.find(x => String(x.id) === String(uId)); if (!u) return;
        let ex = document.getElementById('inspect-modal'); if (ex) ex.remove();
        const bO = BACKGROUNDS_SHOP.find(b => b.id === u.current_background) || BACKGROUNDS_SHOP[0];
        const m = `<div id="inspect-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-purple);text-align:center;position:relative;overflow:hidden;background-image:url('${bO.image}');background-size:cover;background-position:center;" onclick="event.stopPropagation()"><div style="position:absolute;inset:0;background:rgba(12,12,20,0.85);z-index:1;"></div><div style="position:relative;z-index:2;"><div style="width:70px;height:70px;margin:0 auto 10px auto;border-radius:50%;padding:2px;background:var(--gradient-primary);"><img src="${u.avatar || 'https://via.placeholder.com/80'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div><h3 style="color:#fff;font-size:18px;">${u.name}</h3><div style="font-size:12px;color:var(--accent-pink);font-weight:bold;margin-top:2px;">Уровень ${u.level || 1}</div><div style="font-size:11px;color:var(--hint-color);margin-top:4px;">Синдикат: ${u.syndicate || 'Частник'}</div><button type="button" class="btn btn-outline" style="margin-top:12px;font-size:12px;" onclick="document.getElementById('inspect-modal').remove()">Закрыть</button></div></div></div>`;
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
        
        const headerAvatar = document.getElementById('user-avatar'); if (headerAvatar && p.avatar) headerAvatar.src = p.avatar;
        const profileAvatar = document.getElementById('profile-id-avatar'); if (profileAvatar && p.avatar) profileAvatar.src = p.avatar;

        this.safeUpdate('profile-id-name', p.name); 
        this.safeUpdate('username', p.name);
        this.safeUpdate('profile-id-lvl', `LVL ${p.level}`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); 
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`); 
        this.safeUpdate('user-fatigue-bar', `🔋 ${p.fatigue}%`);
        this.safeUpdate('current-fuel-price', `${p.fuel_price || 12} 🪙 / л`);
        this.safeUpdate('stat-total-profit', `${Number(p.total_profit || 0).toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', `${p.total_trips || 0}`);
        this.safeUpdate('stat-total-fuel', `${p.total_fuel_burned || 0} л`);
        this.safeUpdate('stat-playtime', `${Math.floor((p.playtime_minutes||0)/60)}ч ${(p.playtime_minutes||0)%60}м`);

        let reqXp = GameLogic.getReqXP(p.level);
        let xpPercent = Math.min(100, Math.floor((p.xp / reqXp) * 100));
        let xpBarHtml = `
            <div style="width:100%; background:rgba(255,255,255,0.1); border-radius:6px; height:8px; overflow:hidden; margin-top:6px;">
                <div style="width:${xpPercent}%; background:var(--gradient-primary); height:100%; transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:10px; color:var(--hint-color); display:flex; justify-content:space-between; margin-top:2px;">
                <span>XP: ${p.xp} / ${reqXp}</span>
                <span>${xpPercent}%</span>
            </div>`;
        this.safeUpdateHTML('user-level-progress-container', xpBarHtml);

        let detailedStatsHtml = `
            <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; margin-top:10px;">
                <div style="display:flex; justify-content:space-between;"><span>Общий капитал:</span><strong style="color:var(--accent-pink);">${Number(p.money).toLocaleString()} 🪙</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Всего заработано:</span><strong>${Number(p.total_profit || 0).toLocaleString()} 🪙</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Завершенных рейсов:</span><strong>${p.total_trips || 0}</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Сожжено топлива:</span><strong>${p.total_fuel_burned || 0} л</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Синдикатный вклад:</span><strong style="color:var(--success-color);">${Number(p.syndicate_contribution || 0).toLocaleString()} 🪙</strong></div>
                <div style="display:flex; justify-content:space-between;"><span>Время в игре:</span><strong>${Math.floor((p.playtime_minutes||0)/60)}ч ${(p.playtime_minutes||0)%60}м</strong></div>
            </div>`;
        this.safeUpdateHTML('profile-detailed-stats', detailedStatsHtml);

        const noSyn = document.getElementById('no-syndicate-panel');
        const actSyn = document.getElementById('active-syndicate-panel');
        if (p.syndicate && p.syndicate !== 'null') {
            if (noSyn) noSyn.style.display = 'none';
            if (actSyn) actSyn.style.display = 'block';
            this.safeUpdate('corp-name-title', p.syndicate);
            this.safeUpdate('corp-treasury-coins', `${(AppState.syndicateData.treasuryCoins || 0).toLocaleString()} 🪙`);
            this.safeUpdate('corp-fuel-treasury', `${(AppState.syndicateData.treasuryFuel || 0).toLocaleString()} л`);
            this.safeUpdate('corp-role-desc', p.syndicate_role === 'leader' ? '👑 Лидер' : '⭐ Участник');
        } else {
            if (noSyn) noSyn.style.display = 'block';
            if (actSyn) actSyn.style.display = 'none';
        }

        let techHtml = '';
        const techsDef = [
            { key: 'security', name: '🛡️ Охрана грузов (Защита от штрафов)' },
            { key: 'logistics', name: '📈 Логистическая оптимизация (+5% бонус к награде)' },
            { key: 'mechanic', name: '🛠️ Синдикатный механик (-8% износ деталей)' }
        ];
        techsDef.forEach(td => {
            let lvl = AppState.syndicateData.techs[td.key] || 0;
            techHtml += `<div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:10px;">
                <div><div style="font-size:12px; font-weight:bold;">${td.name}</div><div style="font-size:10px; color:var(--hint-color);">Уровень: ${lvl}</div></div>
                <button class="btn btn-primary" style="font-size:11px; padding:6px 10px; width:auto;" onclick="GameLogic.upgradeSyndicateTech('${td.key}')">Улучшить (50k 🪙)</button>
            </div>`;
        });
        this.safeUpdateHTML('corp-tech-tree', techHtml);

        this.safeUpdate('pass-subtitle', `Ваш текущий уровень пропуска: ${p.pass_level || 1}`);
        this.safeUpdateHTML('pass-tiers-list', Array.from({ length: 15 }, (_, i) => { 
            const lvl = i + 1, rew = 15000 + i * 20000; 
            const isUnlocked = (p.pass_level || 1) >= lvl; 
            const isClaimed = (p.pass_claimed || []).includes(lvl); 
            return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;margin-bottom:8px;">
                <div><div class="card-title" style="font-size:12px;"><span>Уровень ${lvl}</span></div><p style="font-size:11px;color:var(--hint-color);">+${rew.toLocaleString()} 🪙</p></div>
                <button class="btn ${isClaimed ? 'btn-outline' : 'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!isUnlocked || isClaimed ? 'disabled' : ''} onclick="GameLogic.claimPassReward(${lvl}, ${rew})">${isClaimed ? 'Получено' : (isUnlocked ? 'Забрать' : `Ур. ${lvl}`)}</button>
            </div>`; 
        }).join(''));

        let streakHtml = ``;
        for(let i = 1; i <= 7; i++) {
            let isCurrent = (p.daily_streak || 0) === i;
            let isPassed = (p.daily_streak || 0) > i;
            streakHtml += `
                <div style="flex:1; background:${isCurrent?'var(--accent-blue)':'rgba(0,0,0,0.3)'}; border:1px solid ${isCurrent?'var(--accent-pink)':'var(--border-color)'}; padding:8px 4px; border-radius:8px; text-align:center;">
                    <div style="font-size:10px; color:var(--hint-color);">День ${i}</div>
                    <div style="font-size:12px; font-weight:bold; color:#fff; margin:4px 0;">+${i*15}k</div>
                    <div style="font-size:9px; color:${isPassed?'var(--success-color)':'var(--hint-color)'};">${isPassed?'Получено':(isCurrent?'Доступно':'Ожидание')}</div>
                </div>`;
        }
        this.safeUpdateHTML('daily-streak-grid', `<div style="display:flex; gap:6px; margin-bottom:12px;">${streakHtml}</div>`);

        const l = AppState.leaderboard || [], isT = AppState.leaderboardCategory === 'trips', c = ['👑', '🥈', '🥉']; let pH = '';
        l.slice(0, 3).forEach((u, i) => {
            const v = isT ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`;
            const bG = BACKGROUNDS_SHOP.find(b => b.id === u.current_background) || BACKGROUNDS_SHOP[0];
            pH += `<div class="podium-card rank-${i+1}" onclick="UI.inspectPlayer('${u.id}')" style="cursor:pointer;background-image:url('${bG.image}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(22,22,32,0.82);z-index:1;border-radius:14px;"></div><div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:100%;"><span class="podium-crown">${c[i]}</span><img src="${u.avatar || 'https://via.placeholder.com/80'}" class="podium-avatar" /><span class="podium-name">${u.name}</span><span style="font-size:10px;color:var(--hint-color);">Ур. ${u.level || 1}</span><span class="podium-val">${v}</span></div></div>`;
        });
        this.safeUpdateHTML('leaderboard-podium', pH);
        this.safeUpdateHTML('leaderboard-list', l.slice(3).map((u, i) => `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;margin-bottom:6px;" onclick="UI.inspectPlayer('${u.id}')"><div style="display:flex;align-items:center;gap:10px;"><div style="display:flex;flex-direction:column;align-items:center;width:22px;"><span style="font-weight:800;font-size:13px;color:var(--hint-color);">#${i+4}</span></div><img src="${u.avatar || 'https://via.placeholder.com/40'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" /><div><div style="font-weight:600;font-size:14px;color:#fff;">${u.name}</div><div style="font-size:11px;color:var(--hint-color);">Ур: ${u.level || 1}</div></div></div><div style="font-weight:bold;color:var(--accent-pink);font-size:13px;">${isT ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`}</div></div>`).join(''));
        let mI = l.findIndex(u => String(u.id) === String(p.id)); this.safeUpdate('my-rank-num', mI !== -1 ? `#${mI + 1}` : '#--'); this.safeUpdate('my-rank-val', isT ? `${p.total_trips || 0} рейсов` : `${Number(p.total_profit || 0).toLocaleString()} 🪙`);

        this.safeUpdateHTML('backgrounds-inventory-list', BACKGROUNDS_SHOP.map(bg => {
            const u = (p.unlocked_backgrounds || ['bg_r1']).includes(bg.id), s = p.current_background === bg.id;
            return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;opacity:${u?'1':'0.5'};margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;"><img src="${bg.image}" style="width:50px;height:35px;border-radius:6px;object-fit:cover;"><div><div style="font-size:12px;font-weight:bold;">${bg.name}</div><div style="font-size:10px;color:var(--accent-pink);text-transform:uppercase;">${bg.rarity}</div></div></div><button class="btn ${s?'btn-outline':'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!u||s?'disabled':''} onclick="BackgroundCaseSys.setBackground('${bg.id}')">${s?'Активен':(u?'Установить':'Закрыто')}</button></div>`;
        }).join(''));

        const aTI = AppState.activeTrips.map(t => t.truck_id);
        const autopilotIds = p.hired_drivers.map(d => d.truck_id);
        
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { 
            let l = Math.floor((tr.end_time - ServerTimeSys.now()) / 1000); 
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } 
            return `<div class="card" style="margin-bottom:12px;border-color:var(--accent-blue);"><div class="card-title"><span>🚚 Рейс в пути</span><span style="color:var(--accent-blue);">⏳ ${l} сек</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; 
        }).join(''));
        
        const hI = AppState.trucks.some(t => !aTI.includes(t.id) && !autopilotIds.includes(t.id));
        const dynamicContracts = MapSys.generateDynamicContracts();
        
        this.safeUpdateHTML('contracts-list', dynamicContracts.map(c => {
            const lL = p.level < c.reqLvl, lLic = !p.licenses.includes(c.reqLic), iL = lL || lLic;
            let bt = lL ? `Ур. ${c.reqLvl}` : lLic ? 'Лицензия' : !hI ? 'Нет фур' : 'Начать рейс';
            return `<div class="contract-card" style="${iL ? 'opacity:0.6' : ''}"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.icon} ${c.name}</span></div><div class="contract-reward">+${c.reward.toLocaleString()} 🪙</div></div><div class="contract-body" style="padding-top:10px;"><div style="font-size:12px; color:var(--hint-color); margin-bottom:8px;">Маршрут: <span style="color:#fff;font-weight:bold;">${c.title}</span></div><div class="contract-specs"><div class="spec-item"><span>⏱ Время:</span><span style="color:#fff;font-weight:bold;">${c.duration}с</span></div><div class="spec-item"><span>⛽ Б. Топл:</span><span style="color:#fff;font-weight:bold;">${c.baseFuel}л</span></div></div></div><button class="contract-action-btn ${!hI || iL ? 'disabled' : 'active'}" ${!hI || iL ? 'disabled' : ''} onclick="GameLogic.startTrip(${c.reward}, ${c.baseFuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}', '${c.targetCity}', '${c.routeId}')">${bt}</button></div>`;
        }).join(''));

        let fH = AppState.trucks.length > 0 ? AppState.trucks.map(t => {
            const isB = aTI.includes(t.id);
            const driverInfo = p.hired_drivers.find(d => d.truck_id === t.id);
            
            let sH = driverInfo ? `<span style="font-size:12px;color:#10B981;font-weight:bold;">🟢 Автопилот</span>` : (isB ? `<span style="font-size:12px;color:#EF4444;">🔴 В рейсе</span>` : `<span style="font-size:12px;color:var(--hint-color);">⚪ Свободна</span>`);
            const sT = TRUCK_SHOP.find(x => x.name === t.name);
            let a100 = true, tRC = 0, pts = [{ k: 'engineLvl', n: '🛠 Двс' }, { k: 'tiresLvl', n: '🛞 Шины' }, { k: 'gearLvl', n: '⚙️ КПП' }, { k: 'brakesLvl', n: '🧯 Торм' }];
            let ptH = pts.map(pt => {
                const v = Number(t[pt.k]) || 100; let cl = v < 40 ? '#EF4444' : v < 75 ? '#F59E0B' : '#10B981';
                if (v < 100) a100 = false; tRC += GameLogic.getRepairCost(v);
                return `<div class="part-card"><div class="part-header"><span>${pt.n}</span><span style="color:${cl};font-weight:800;">${v}%</span></div><div class="part-bar"><div class="part-bar-fill" style="width:${v}%;background-color:${cl};"></div></div></div>`;
            }).join('');
            
            let driverUI = driverInfo ? `
                <div style="margin-top:10px; padding:10px; background:rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius:8px; text-align:center;">
                    <div style="font-size:13px; color:#10B981; font-weight:bold; margin-bottom:4px;">👤 Водитель: ${DRIVERS_SHOP.find(x=>x.id===driverInfo.driver_id)?.name}</div>
                    <button class="btn btn-outline" style="width:100%; font-size:11px; padding:6px; border-color:#EF4444; color:#EF4444;" onclick="DriverSys.fireDriver('${t.id}')">Уволить</button>
                </div>` : (!isB ? `
                <div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;">
                    <div style="font-size:11px; margin-bottom:8px; color:var(--hint-color);">👤 Нанять водителя:</div>
                    <div style="display:flex; gap:6px;">
                        ${DRIVERS_SHOP.map(d => `<button class="btn btn-outline" style="flex:1; font-size:10px; padding:6px; color:${d.color}; border-color:${d.color};" onclick="DriverSys.hireDriver('${t.id}', '${d.id}')">${d.name}<br>${(d.cost/1000).toFixed(0)}k</button>`).join('')}
                    </div>
                </div>` : '');

            return `<div class="card" style="margin-bottom:16px;"><div class="card-title" style="margin-bottom:8px;"><span>🚚 ${t.name}</span>${sH}</div><div class="truck-specs-badge"><div>📦 <span>${sT?.capacity||0} кг</span></div><div>⛽ <span>${sT?.fuel_use||0} л</span></div></div><div class="parts-grid" style="margin-top:16px;">${ptH}</div><button class="btn ${a100 || isB ? 'btn-outline' : 'btn-full-service'}" style="width:100%;margin-top:10px;font-size:11px;padding:10px;" ${a100 || isB ? 'disabled' : ''} onclick="GameLogic.repairAll('${t.id}')">${a100 ? 'Исправна' : `ТО: ${Math.floor(tRC * 0.9).toLocaleString()} 🪙`}</button>${driverUI}</div>`;
        }).join('') : `<p style="text-align:center;color:var(--hint-color);margin-bottom:16px;">Гараж пуст!</p>`;
        
        const fleetList = document.getElementById('fleet-list');
        if(fleetList) fleetList.innerHTML = fH;
    }
};

const BackgroundCaseSys = {
    setBackground(bgId) {
        if (!AppState.player.unlocked_backgrounds.includes(bgId)) return;
        AppState.player.current_background = bgId;
        DB.syncPlayer();
        UI.showToast('Фон профиля успешно изменен!', 'success');
        UI.renderAll();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let p = 0; const ld = document.getElementById('loading-screen');
    if (ld) {
        const int = setInterval(() => { p += 20; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init(); MapSys.initDragScroll(); }); } }, 300);
    } else { DB.init(); MapSys.initDragScroll(); }

    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    setInterval(async () => { 
        AppState.player.playtime_minutes = (AppState.player.playtime_minutes || 0) + 1; 
        let passiveIncome = await DriverSys.collectPassive(ServerTimeSys.now());
        if(passiveIncome > 0) UI.showToast(`Автопилот заработал +${passiveIncome.toLocaleString()} 🪙`, 'success');
        DB.syncPlayer(); UI.renderAll();
    }, 60000);
});

window.switchTab = (id) => UI.switchTab(id); 
window.AudioSys = AudioSys; 
window.GameLogic = GameLogic; 
window.MapSys = MapSys; 
window.DriverSys = DriverSys; 
window.DailySys = DailySys;
window.FatigueSys = FatigueSys;
window.WeatherSys = WeatherSys;
window.GarageSys = GarageSys;
window.UnderworldSys = UnderworldSys;
window.AdminSys = AdminSys;
window.UI = UI;
window.BackgroundCaseSys = BackgroundCaseSys;
