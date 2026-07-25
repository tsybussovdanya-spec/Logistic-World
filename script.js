const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const SUPABASE_URL = 'https://aiqlcndsayerxjtcwqbj.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tgUser = tg.initDataUnsafe?.user;
// Строго преобразуем Telegram ID в число (Number), чтобы bigint в Supabase принял его корректно
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

let player = {
    id: null,
    name: tgUser ? `${tgUser.first_name}` : 'Логист #777',
    avatar: tgUser?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    money: 35000,
    fuel_stock: 400,
    fuel_price: 12,
    syndicate: null,
    garage_level: 1,
    total_profit: 0,
    last_bonus_time: 0
};

// Исправленная инициализация с детальным логированием ошибок
async function initGameData() {
    console.log("Инициализация для Telegram ID:", telegramId);

    let { data: existingPlayer, error: searchError } = await supabaseClient
        .from('players')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

    if (searchError) {
        console.error("Ошибка поиска игрока:", searchError.message);
    }

    if (!existingPlayer) {
        console.log("Игрок не найден в базе, создаем запись для:", telegramId);
        
        let { data: newP, error: insertError } = await supabaseClient
            .from('players')
            .insert([{
                telegram_id: telegramId,
                name: player.name,
                avatar: player.avatar,
                money: player.money,
                fuel_stock: player.fuel_stock,
                garage_level: player.garage_level
            }])
            .select()
            .single();

        if (insertError) {
            console.error("ОШИБКА создания игрока в БД:", insertError.message, insertError.details);
            alert("Ошибка сохранения игрока в базу: " + insertError.message);
            return;
        }

        if (newP) {
            player = newP;
            console.log("Игрок успешно создан:", player);
            
            // Выдаем стартовый грузовик
            let { error: truckError } = await supabaseClient.from('trucks').insert([{
                player_id: player.id,
                name: 'LW-CyberTruck Alpha',
                capacity: 5000,
                fuel_use: 45,
                engine_wear: 100,
                tires_wear: 100
            }]);
            
            if (truckError) {
                console.error("Ошибка создания стартового грузовика:", truckError.message);
            }
        }
    } else {
        console.log("Игрок успешно загружен из базы:", existingPlayer);
        player = existingPlayer;
    }

    await loadUserDataFromDB();
    renderAll();
}
