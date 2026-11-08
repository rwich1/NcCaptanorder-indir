// Newcastle menü verisi.
// Yeni ürün eklemek için ilgili kategorinin items listesine {n:'Ürün adı'} ekleyin.
//   o  : seçenek grupları (V(başlık, seçenekler, 1=zorunlu / 0=isteğe bağlı))
//   fx : sabit bilgi, kayda ürünle birlikte yazılır (örn. '70 cl')
//   s  : listede ürün adının altında görünen kısa açıklama
//   tag: kayıtta ürünün yanına yazılan etiket (örn. 'Shot 3 cl')
//   k  : not türü (food / drink / cocktail / wine / hot)
// Tek zorunlu seçeneği olan ürünlerde (örn. 5 cl / 8 cl) seçenekler satırın içinde buton olarak çıkar.
// Yemeklerde aynı isim birden fazla kategoride olabilir; uygulama bunları tek ürün sayar.
(function () {
  const V = (t, c, r = 1, h) => ({ t, c, r, h });
  const CL = V('Ölçü', ['5 cl', '8 cl']);
  const SISE = V('Şişe', ['35 cl', '70 cl']);
  const PISME = V('Pişme', ['Az', 'Az-Orta', 'Orta', 'Orta-İyi', 'İyi'], 1, 'pişme derecesi');
  const TONIK = V('Tonik', ['Tonikli', 'Toniksiz']);
  const SURAHI = V('Servis', ['Kadeh', 'Sürahi']);
  const SEKER = V('Şeker', ['Sade', 'Az Şekerli', 'Orta', 'Şekerli']);
  const BAHARAT = V('Baharat', ['Baharatlı', 'Baharatsız'], 0);
  // Bira: fıçı ve şişe boyları tek seçimde ("Fıçı 50 cl", "Şişe 33 cl"); sub=1 → satırda FIÇI / ŞİŞE diye iki sıra
  const FB = (fici, sise) => ({ t: 'Fıçı / Şişe', c: fici.map(x => 'Fıçı ' + x).concat(sise.map(x => 'Şişe ' + x)), r: 1, sub: 1 });
  const ABS = ['Blue', 'Raspberry', 'Citron', 'Vanilla', 'Pears'];
  const OLM = ['Blanco', 'Dark Chocolate', 'Gold'];
  const AMER = ["Jack Daniel's", 'Jim Beam'];
  const K34 = '3-4 kişilik';

  window.MENU = [
    // ======================= BAŞLANGIÇ =======================
    {
      id: 'baslangic', name: 'Başlangıç', kind: 'food', cats: [
        { id: 'corba', name: 'Çorbalar', items: [
          { n: 'Günün Çorbası' }, { n: 'Günün Çorbası (Yarım)' },
          { n: 'Minestrone Çorbası' }, { n: 'Minestrone Çorbası (Yarım)' },
        ] },
        { id: 'baslangiclar', name: 'Başlangıçlar', items: [
          { n: 'Mozzarella Caprese' }, { n: 'Kızarmış Hellim Tabağı' },
          { n: 'Ezine Peynir Tabağı' }, { n: 'Peynir Tabağı' },
        ] },
        { id: 'salata', name: 'Salatalar', items: [
          { n: 'Sezar Salata' }, { n: 'Kızarmış Hellim Peynirli Salata' }, { n: 'Çıtır Levrek Salata' },
          { n: 'Çıtır Tavuklu Salata' }, { n: 'Ilık Peynirli Salata' }, { n: 'Ankara Salata' },
          { n: 'Izgara Etli Salata', o: [PISME] }, { n: 'Asya Esintili Salata' }, { n: 'Ilık Tavuklu Bademli Salata' },
          { n: 'Tavuklu Diyet Salata' }, { n: 'Acılı Izgara Tavuk Salata' },
        ] },
        { id: 'arasicak', name: 'Ara Sıcaklar', items: [
          { n: 'Sıcak Sepeti' }, { n: 'Sigara Böreği' }, { n: 'Paçanga Böreği' },
          { n: 'Halka Kalamar' }, { n: 'Çıtır Levrek' },
          { n: 'Çıtır Tavuk' }, { n: 'Glütensiz Çıtır Tavuk' }, { n: 'BBQ Soslu Çıtır Tavuk' },
          { n: 'Acılı Buffalo Soslu Tavuk' }, { n: 'Cajun Baharatlı Çıtır Tavuk' },
          { n: 'Çıtır Tavuk Sepeti' }, { n: 'Fish and Chips' },
        ] },
        { id: 'patates', name: 'Patatesler', items: [
          { n: 'Anne Usulü Patates', o: [BAHARAT] }, { n: 'Parmak Patates', o: [BAHARAT] },
          { n: 'Churros Patates' }, { n: 'Gurme Patates' }, { n: 'Peynirli Baharatlı Patates Tava' },
          { n: 'Cheddar Soslu & Hellim Peynirli Patates Tava' },
        ] },
        { id: 'ortaya', name: 'Ortaya Karışık', items: [
          { n: 'Gurme Tavuklar', s: K34 }, { n: 'Gökkuşağı', s: K34 }, { n: 'Sohbet Arası', s: K34 },
        ] },
        { id: 'nachos', name: 'Nachos', items: [
          { n: 'Nacho Chips' }, { n: 'Nachos de Cheese' }, { n: 'Nachos de Mince' }, { n: 'Nachos de Beef' },
        ] },
        { id: 'taco', name: 'Soft Taco', items: [
          { n: 'Tavuklu Taco' }, { n: 'Kıymalı Taco' }, { n: 'Etli Taco' },
        ] },
        { id: 'quesadilla', name: 'Quesadilla', items: [
          { n: 'Tavuklu Quesadilla' }, { n: 'Etli Quesadilla' },
        ] },
        { id: 'cerez', name: 'Çerezler', items: [
          { n: 'Antep Fıstığı' }, { n: 'Badem' }, { n: 'Fındık' }, { n: 'Fıstık' }, { n: 'Karışık Çerez' }, { n: 'Leblebi' },
        ] },
        { id: 'sos', name: 'İlave Soslar', items: [
          { n: 'Sweet Chili Sos' }, { n: 'Garlic Sos' }, { n: 'Tartar Sos' }, { n: 'Salsa Sos' },
          { n: 'Avokado Sos' }, { n: 'Acılı Buffalo Sos' }, { n: 'Sour Cream Sos' }, { n: 'Cheddar Sos' },
        ] },
      ],
    },
    // ======================= ANA YEMEK =======================
    {
      id: 'ana', name: 'Ana Yemek', kind: 'food', cats: [
        { id: 'burger', name: 'Burgerler', items: [
          { n: 'Burger' }, { n: 'Cheeseburger' }, { n: 'Mantarlı ve Kıtır Soğanlı Burger' },
          { n: 'Hot Chili Burger' }, { n: 'Gurme Burger' }, { n: 'Tavuk Burger' },
          { n: 'Trüf Soslu Mantarlı Burger' }, { n: 'Trio Burger' }, { n: 'Islak Burger' },
          { n: 'Texas Burger' }, { n: 'Vegan Burger' },
        ] },
        { id: 'pizza', name: 'Pizzalar', items: [
          { n: 'Margherita Pizza' }, { n: 'İstiridye Mantarlı Pizza' }, { n: 'Alfredo Soslu Tavuk Pizza' },
          { n: 'Calzone' }, { n: 'Kıtır Tavuk Pizza' }, { n: 'Vejetaryen Pizza' }, { n: 'Ispanaklı Lor Peynirli Pizza' },
          { n: 'Formaggi Pizza' }, { n: 'A la Turca' }, { n: 'Robes Pierre' },
        ] },
        { id: 'makarna', name: 'Makarnalar', items: [
          { n: "Penne All'arrabbiata" }, { n: 'Çıtır Tavuklu Penne' }, { n: 'Spagetti Napoliten' }, { n: 'Spagetti Bolonez' },
          { n: 'Mac & Cheese' }, { n: 'Çıtır Tavuklu Mac & Cheese' }, { n: 'Patlıcanlı Ravioli' },
          { n: 'Sinop Mantısı' }, { n: 'Fettuccine Alfredo' }, { n: 'Glütensiz Pirinç Makarna' },
        ] },
        { id: 'et', name: 'Et Yemekleri', items: [
          { n: 'Izgara Köfte' }, { n: 'Bonfile Fileminyon', o: [PISME] }, { n: 'Kekikli Dana Külbastı', o: [PISME] },
          { n: 'Café De Paris Soslu Bonfile', o: [PISME] }, { n: 'Izgara Antrikot', o: [PISME] }, { n: 'Pepper Steak', o: [PISME] },
        ] },
        { id: 'tavuk', name: 'Tavuk Yemekleri', items: [
          { n: 'Buharda Tavukgöğsü' }, { n: 'Tavuk Şinitzel' }, { n: 'Cornflakes Şinitzel' },
          { n: 'Bademli Fesleğenli Tavuk' }, { n: 'Kekikli Tavuk Külbastı' }, { n: 'Izgara Tavuk Şiş' }, { n: 'Tavuk Kulesi' },
        ] },
        { id: 'deniz', name: 'Denizden', items: [
          { n: 'Somon Izgara' }, { n: 'Fish and Chips' }, { n: 'Çıtır Levrek' },
        ] },
        { id: 'uzakdogu', name: 'Uzakdoğu', items: [
          { n: 'Asya Usulü Tavuk' }, { n: 'Köri Soslu Tavuk' }, { n: 'Teriyaki Soslu Tavuk' }, { n: 'Kore Usulü Kızarmış Tavuk' },
          { n: 'Çıtır Tavuklu Noodle' }, { n: 'Köri Tavuklu Noodle' }, { n: 'Sebzeli Noodle' },
        ] },
        { id: 'durum', name: 'Dürümler', items: [
          { n: 'Izgara Tavuklu Dürüm' }, { n: 'Acılı Çıtır Tavuklu Dürüm' }, { n: 'Izgara Etli Dürüm' },
        ] },
        { id: 'krep', name: 'Krepler', items: [
          { n: 'Tavuklu Krep' }, { n: 'Etli Krep' }, { n: 'Ispanaklı Lor Peynirli Krep' },
        ] },
        { id: 'sokak', name: 'Sokak Lezzetleri', items: [
          { n: 'Bagette Kokoreç' }, { n: 'Bagette Sebzeli Kokoreç' }, { n: 'Bagette Levrek' },
          { n: 'Bagette Köfte' }, { n: 'Bagette Tavuk Şiş' }, { n: 'Tavuk-Pilav' },
        ] },
        { id: 'kase', name: 'Sağlıklı Kaseler', items: [
          { n: 'Çıtır Tavuklu Kase' }, { n: 'Köfteli Kase' }, { n: 'Çıtır Levrek Kase' },
          { n: 'Somonlu Kase' }, { n: 'Dana Etli Kase', o: [PISME] },
        ] },
        { id: 'diyet', name: 'Diyet', items: [
          { n: 'Mozzarella Caprese' }, { n: 'Buharda Tavukgöğsü' }, { n: 'Tavuklu Diyet Salata' },
          { n: 'Glütensiz Çıtır Tavuk' }, { n: 'Glütensiz Pirinç Makarna' },
        ] },
        { id: 'tatli', name: 'Tatlılar', items: [
          { n: 'Ilık Çikolatalı Kek', s: '20 dk servis' }, { n: 'San Sebastian' }, { n: 'Profiterol' },
          { n: 'Orman Meyveli Beyaz Çikolatalı Profiterol' }, { n: 'Tiramisu' },
          { n: 'Cheesecake', o: [V('Sos', ['Limon', 'Frambuaz', 'Çikolata'])] }, { n: 'Diyabetik Cheesecake' },
          { n: 'Kahveli Creme Brulee' }, { n: 'Churros (Tatlı)' }, { n: 'Meyve Tabağı' },
        ] },
      ],
    },
    // ======================= ALKOLSÜZ =======================
    {
      id: 'alkolsuz', name: 'Alkolsüz', kind: 'drink', cats: [
        { id: 'cay', name: 'Çay', k: 'hot', items: [
          { n: 'Demleme Çay (Cam Bardak)' }, { n: 'Demleme Çay (Kupa / Fincan)' },
          { n: 'Earl Grey Çay', s: 'Kupada makas demleme' },
          { n: 'Doğal Bitki Çayı', o: [V('Çeşit', ['Papatya', 'Ihlamur', 'Yaseminli Yeşil Çay', 'Nane-Limon', 'Ada Çayı', 'Kış Çayı'])] },
          { n: 'Organik Meyve Çayı', o: [V('Çeşit', ['Elma-Tarçın', 'Orman Meyveli', 'Kuşburnu', 'Portakal'])] },
        ] },
        { id: 'kahve', name: 'Kahve · Sıcak', k: 'hot', items: [
          { n: 'Türk Kahvesi', o: [SEKER] }, { n: 'Double Türk Kahvesi', o: [SEKER] },
          { n: 'Nescafe' }, { n: 'Filtre Kahve' }, { n: 'Espresso' }, { n: 'Double Espresso' }, { n: 'Americano' },
          { n: 'Cappuccino' }, { n: 'Coffee Latte' }, { n: 'Espresso Macchiato' }, { n: 'Mocca' }, { n: 'Chai Tea Latte' },
          { n: 'Coffee Baileys' }, { n: 'Irish Coffee' }, { n: 'Coffee Cognac' },
          { n: 'Sıcak Şarap' }, { n: 'Sıcak Çikolata', s: 'Marshmallow ile' },
        ] },
        { id: 'mesrubat', name: 'Meşrubat', items: [
          { n: 'Coca-Cola' }, { n: 'Coca-Cola Light' }, { n: 'Coca-Cola Şekersiz' },
          { n: 'Fanta' }, { n: 'Sprite' }, { n: 'Schweppes' }, { n: 'Fuse Tea' },
          { n: 'Cappy Meyve Suyu' }, { n: 'Ayran', s: 'Sütaş cam şişe 300 ml' },
          { n: 'Red Bull', o: [V('Çeşit', ['Energy Drink', 'Sugarfree', 'Peach', 'Red', 'White', 'Blue'])] },
          { n: 'Red Bull Twist', o: [V('Çeşit', ['White', 'Blue'])] },
          { n: 'Stay Classic', s: 'Red Bull + Votka' },
        ] },
        { id: 'su', name: 'Su · Soda · Meyve Suyu', items: [
          { n: 'Su', s: 'Damla 330 ml' }, { n: 'Premium Soda', o: [V('Boy', ['250 ml', '750 ml'])] },
          { n: 'Meyveli Soda' }, { n: 'Soda Limon' }, { n: 'Soda Vişne' },
          { n: 'Limonata' }, { n: 'Meyveli Limonata' }, { n: 'Alkolsüz Meyve Kokteyli' },
          { n: 'Portakal Suyu', s: 'Exotic' }, { n: 'Portakallı Havuç Suyu', s: 'Exotic' },
          { n: 'Portakallı Nar Suyu', s: 'Exotic' }, { n: 'Nar Suyu', s: 'Exotic' },
        ] },
      ],
    },
    // ======================= KOKTEYL =======================
    {
      id: 'kokteyl', name: 'Kokteyl', kind: 'cocktail', cats: [
        { id: 'sig1', name: 'Signature 1', items: [
          { n: 'Reyhan Gin Sour' }, { n: 'Red Hand' }, { n: 'Gold Irish' }, { n: 'Baileys Espresso Martini' },
          { n: 'Exotic Lady' }, { n: 'Gin Fresh', o: [SURAHI] }, { n: 'Chilli Pasion' }, { n: 'Pixie' },
          { n: 'Kuzukulağı Gin Sour' }, { n: 'Moonlight' }, { n: 'Peach Heredot' },
        ] },
        { id: 'sig2', name: 'Signature 2', items: [
          { n: 'Pink Spritz' }, { n: 'Kuzu Kulağı Apple Sour' }, { n: 'La Perla' }, { n: 'Mr. Boss' },
          { n: 'Siesta' }, { n: 'Del Corno' }, { n: 'Elixir' }, { n: 'Chili Berry' },
          { n: 'Whisper' }, { n: 'Smoke Honey Sour' }, { n: 'Cosmo Magic' }, { n: 'Red', o: [SURAHI] },
          { n: 'XL Negroni' }, { n: 'Texas Tea', o: [SURAHI] }, { n: 'Berry Club' },
        ] },
        { id: 'intl', name: 'International', items: [
          { n: 'Long Island Ice Tea', o: [SURAHI] }, { n: 'Lynchburg Lemonade', o: [SURAHI] },
          { n: 'Aperol Spritz', o: [SURAHI] }, { n: 'Black Jack', o: [SURAHI] },
          { n: 'Old Fashioned' }, { n: 'Whisky Sour' }, { n: 'Cosmopolitan' }, { n: 'Pina Colada' },
          { n: 'Negroni' }, { n: 'Espresso Martini' },
          { n: 'Mojito', o: [V('Çeşit', ['Classic', 'Satsuma', 'Raspberry'])] },
          { n: 'Apple Mojito' }, { n: 'Mango Mojito' }, { n: 'Cool Lime Mojito' }, { n: 'Strawberry Coconut Mojito' },
        ] },
        { id: 'margarita', name: 'Tequila Specials', items: [
          { n: 'Margarita Classic' }, { n: 'Margarita Lime' }, { n: 'Blue Margarita' }, { n: 'Chili Pasion Margarita' },
          { n: 'Strawberry Margarita' }, { n: 'Satsuma Margarita' }, { n: 'Mango Margarita' },
        ] },
        { id: 'gintonic', name: 'Gin Tonic', items: [
          { n: 'Basil Gin Tonic' }, { n: 'Cool Lime Gin Tonic' }, { n: 'Satsuma Gin Tonic' },
          { n: 'Satsuma Berry Gin Tonic' }, { n: 'Ginger Berry Gin Tonic' }, { n: 'Berry Gin Tonic' },
        ] },
        { id: 'sangria', name: 'Sangria', o: [SURAHI], items: [
          { n: 'Classic Sangria' }, { n: 'White Sangria' }, { n: 'Rose Sangria' }, { n: 'Blush Sangria' },
        ] },
      ],
    },
    // ======================= BİRA · ŞARAP =======================
    {
      id: 'bira', name: 'Bira · Şarap', kind: 'drink', cats: [
        // Fıçı ve şişe aynı üründe: satırda "FIÇI [25][33][50][1 lt] / ŞİŞE [33][50]" olarak seçilir.
        // Tek seçeneği olan biralar (örn. sadece şişe 33 cl) satıra dokununca doğrudan eklenir.
        { id: 'biralar', name: 'Biralar', items: [
          { n: 'Tuborg Gold', o: [FB(['25 cl', '33 cl', '50 cl', '1 lt'], ['33 cl', '50 cl'])] },
          { n: 'Carlsberg', o: [FB(['25 cl', '33 cl', '50 cl', '1 lt'], ['33 cl', '50 cl'])] },
          { n: 'Guinness', o: [FB(['25 cl', '50 cl'], [])] },
          { n: 'Weihenstephan Hefeweissbier', o: [FB(['33 cl', '50 cl'], ['33 cl'])] },
          { n: '1664 Blanc', o: [FB(['25 cl', '33 cl', '50 cl'], ['33 cl'])] },
          { n: "5'li Tadım Seti", fx: ['Fıçı 25 cl × 5'] },
          { n: 'Tuborg Ice', fx: ['Şişe 33 cl'] }, { n: 'Tuborg Smooth', fx: ['Şişe 33 cl'] },
          { n: 'Tuborg Filtresiz', fx: ['Şişe 50 cl'] }, { n: 'Carlsberg Luna', fx: ['Şişe 50 cl'] },
          { n: 'Carlsberg Elephant', fx: ['Kutu 50 cl'] },
          { n: 'Weihenstephan Vitus', fx: ['Şişe 33 cl'] },
          { n: 'Sol', fx: ['Şişe 33 cl'] }, { n: 'Desperados', fx: ['Şişe 33 cl'] },
          { n: 'Budweiser', fx: ['Şişe 33 cl'] }, { n: 'Heineken', fx: ['Şişe 33 cl'] }, { n: 'Daura (Glutensiz)', fx: ['Şişe 33 cl'] },
          { n: 'Frederik Brown Ale', fx: ['Şişe 35 cl'] }, { n: 'Frederik Marzen Lager', fx: ['Şişe 35 cl'] },
          { n: 'Frederik India Pale Ale', fx: ['Şişe 35 cl'] }, { n: 'Frederik Wheat IPA', fx: ['Şişe 35 cl'] },
          { n: 'Frederik Yakima IPA', fx: ['Şişe 35 cl'] }, { n: 'Frederik Local', fx: ['Şişe 35 cl'] },
          { n: 'Frederik NEIPA', fx: ['Şişe 35 cl'] }, { n: 'Frederik Tropic IPA', fx: ['Şişe 35 cl'] },
        ] },
        { id: 'kadeh', name: 'Kadeh Şarap', tag: 'Kadeh 15 cl', k: 'wine', items: [
          { n: 'Angora Beyaz' }, { n: 'Ancyra Narince', s: 'Beyaz' }, { n: 'Santa Helena S. Blanc', s: 'Beyaz' },
          { n: 'Angora Kırmızı' }, { n: 'Ancyra Öküzgözü', s: 'Kırmızı' }, { n: 'Ancyra Kalecik Karası', s: 'Kırmızı' },
          { n: 'Ancyra Boğazkere', s: 'Kırmızı' }, { n: 'Ancyra Merlot', s: 'Kırmızı' },
          { n: 'Angora Roze' }, { n: 'Lal', s: 'Roze' }, { n: 'Ancyra Blush', s: 'Roze' },
        ] },
        { id: 'kirmizi', name: 'Kırmızı Şarap', tag: 'Şişe', fx: ['75 cl'], k: 'wine', items: [
          { n: 'Angora Kırmızı' }, { n: 'Yakut', fx: [], o: [V('Şişe', ['37,5 cl', '75 cl'])] },
          { n: 'Ancyra Kalecik Karası' }, { n: 'Ancyra Öküzgözü' }, { n: 'Ancyra Boğazkere' }, { n: 'Ancyra Merlot' },
          { n: 'Ancyra Cabernet Sav. Syrah' }, { n: 'Vin-Art Kalecik Karası-Syrah' }, { n: 'Selection Öküzgözü-Boğazkere' },
          { n: 'Egeo Merlot Syrah Cabernet Sav.' }, { n: 'Egeo Syrah' }, { n: 'Egeo Cabernet Sav.' }, { n: 'Egeo Merlot' },
          { n: 'Prestige Kalecik Karası' }, { n: 'Prestige Öküzgözü' }, { n: 'Prestige Boğazkere' }, { n: 'Pendore Syrah' },
          { n: 'Santa Helena Cab. Sav.', s: 'Şili' }, { n: 'Montes Merlot', s: 'Şili' }, { n: 'Montes Malbec', s: 'Şili' },
          { n: 'Bodega Calia Shiraz-Malbec', s: 'Arjantin' }, { n: 'Baron de Lastac', s: 'Bordeaux / Fransa' },
          { n: 'La Terra Chianti', s: 'İtalya' }, { n: 'Gato Negro Carmenere', s: 'Şili' },
          { n: 'La Folie Merlot-Cabernet Franc', s: 'Maison Kavaklıdere' },
          { n: 'Claud-Bellevue Merlot-Cabernet Franc', s: 'Maison Kavaklıdere' },
          { n: 'La Croix Lartique Merlot-Cabernet Franc', s: 'Maison Kavaklıdere' },
        ] },
        { id: 'beyaz', name: 'Beyaz Şarap', tag: 'Şişe', fx: ['75 cl'], k: 'wine', items: [
          { n: 'Angora Beyaz' }, { n: 'Çankaya', fx: [], o: [V('Şişe', ['37,5 cl', '75 cl'])] },
          { n: 'Ancyra Narince' }, { n: 'Ancyra Sultaniye Emir' }, { n: 'Ancyra Sauvignon Blanc' },
          { n: 'Vin-Art Narince-Chardonnay' }, { n: 'Vin-Art Sauvignon Blanc' }, { n: 'Selection Narince-Emir' },
          { n: 'Egeo Sauvignon Blanc' }, { n: 'Kavaklıdere Misket' }, { n: 'Kavaklıdere Emir' }, { n: 'Prestige Narince' },
          { n: "Cotes d'Avanos Chardonnay" }, { n: 'Santa Helena Chardonnay', s: 'Şili' },
          { n: 'Santa Helena Sauvignon Blanc', s: 'Şili' }, { n: 'Montes Sauvignon Blanc', s: 'Şili' },
          { n: 'Sartori Pinot Grigio', s: 'İtalya' },
        ] },
        { id: 'roze', name: 'Roze Şarap', tag: 'Şişe', fx: ['75 cl'], k: 'wine', items: [
          { n: 'Angora Roze' }, { n: 'Ancyra Blush' }, { n: 'Rosato' }, { n: 'Lal' }, { n: 'Egeo Roze' },
          { n: 'Casal Mendes', s: 'Portekiz' }, { n: 'Sartori Pinot Grigio Blush', s: 'İtalya' },
          { n: 'Blush by Moncigale', s: 'Fransa' },
        ] },
        { id: 'kopuklu', name: 'Köpüklü / Şampanya', tag: 'Şişe', fx: ['75 cl'], k: 'wine', items: [
          { n: 'İnci Damlası' }, { n: 'Cafe de Paris' }, { n: 'Cinzano Prosecco' }, { n: 'Henkel Trocken' },
          { n: 'Garrone Prosecco' }, { n: 'Martini Brüt' }, { n: 'Altın Köpük' }, { n: 'Luc Belaire', s: 'Rose' },
          { n: 'Mumm Cordon Rouge' }, { n: 'Moet Chandon' },
        ] },
      ],
    },
    // ======================= ALKOL =======================
    {
      id: 'alkol', name: 'Alkol', kind: 'drink', cats: [
        { id: 'aperatif', name: 'Rakı · Aperatif', o: [CL], items: [
          { n: 'Yeni Rakı' }, { n: 'Yeni Seri' }, { n: 'Tekirdağ Altın Seri' }, { n: 'Efe Gold' },
          { n: 'Garrone', o: [V('Çeşit', ['Bianco', 'Bitter', 'Dry', 'Rosso'])] },
          { n: 'Garrone Lemoncello' }, { n: 'Campari' },
        ] },
        { id: 'votka', name: 'Votkalar', o: [CL], items: [
          { n: 'Absolut', o: [V('Çeşit', ABS)] }, { n: 'Absolut Elyx' },
          { n: 'Standart İthal Votka', o: [V('Marka', ['Smirnoff', 'Finlandia'], 0)] },
          { n: 'Delux İthal Votka', o: [V('Marka', ['Grey Goose', 'Belvedere', 'Beluga', 'Stolichnaya Elit'], 0)] },
        ] },
        { id: 'viski', name: 'Viskiler', o: [CL], items: [
          { n: "Ballantine's" }, { n: "Ballantine's 7" }, { n: "Ballantine's 10" },
          { n: 'Chivas Regal 12' }, { n: 'Chivas Regal Smoky' }, { n: 'Chivas Regal XV' }, { n: 'Chivas Regal 18' },
          { n: 'Jameson' }, { n: 'Jameson Stout Edt.' }, { n: 'Jameson Black Barrel' },
          { n: 'Woodford Reserve' }, { n: 'Woodford Rye' }, { n: 'Standart Scotch' },
          { n: 'Delux Scotch', o: [V('Marka', ['JW Black Label', "Dewar's 12"])] },
          { n: 'American Whiskey', o: [V('Marka', AMER)] },
        ] },
        { id: 'cin', name: 'Cinler', o: [CL, TONIK], items: [
          { n: 'Beefeater' }, { n: 'Beefeater Pink' },
          { n: 'Standart İthal Cin', o: [V('Marka', ["Gordon's", 'Tanqueray', 'Bombay', 'Ford'], 0)] },
          { n: 'Malfy', o: [V('Çeşit', ['Originale', 'Rosa', 'Limona'])] }, { n: "Hendrick's" },
        ] },
        { id: 'rom', name: 'Romlar', o: [CL], items: [
          { n: 'Havana Club 3 Anos' }, { n: 'Havana Club 7 Anos' }, { n: 'Bumbu' }, { n: 'Standart İthal Rom' },
        ] },
        { id: 'likor', name: 'Likörler', o: [CL], items: [
          { n: 'Malibu' }, { n: 'Kahlua' }, { n: "Baker's Field" }, { n: 'Limoncello' }, { n: 'Jagermeister' },
          { n: "Jack Daniel's", o: [V('Çeşit', ['Apple', 'Honey', 'Fire'])] }, { n: 'Standart İthal Likör' },
        ] },
        { id: 'konyak', name: 'Konyaklar', o: [CL], items: [
          { n: 'Metaxa 5 Yıldız' }, { n: 'Metaxa 7 Yıldız' }, { n: 'Martel VS' }, { n: 'Cognag VS' },
          { n: 'Martel VSOP' }, { n: 'Cognag VSOP' }, { n: 'Martel XO' }, { n: 'Cognag XO' },
        ] },
        { id: 'tekila', name: 'Shot Tekila', tag: 'Shot 3 cl', items: [
          { n: 'Olmeca Blanco' }, { n: 'Olmeca Dark' }, { n: 'Olmeca Gold' },
          { n: 'Olmeca Altos Reposado' }, { n: 'Olmeca Altos Plata' },
          { n: 'Avion Silver' }, { n: 'Herradura Plata' }, { n: 'Don Julio' },
          { n: 'Avion Reposado' }, { n: 'Patron XO Cafe' }, { n: 'Patron Silver' }, { n: 'Patron Reposado' },
          { n: 'Herradura Anejo' }, { n: 'Patron Anejo' },
        ] },
        { id: 'shot', name: 'Shot İçki', tag: 'Shot 3 cl', items: [
          { n: 'Olmeca', o: [V('Çeşit', OLM)] }, { n: 'Absolut', o: [V('Çeşit', ABS)] },
          { n: 'Jameson' }, { n: 'Jagermeister' }, { n: 'Amerikan Viski', o: [V('Marka', AMER, 0)] },
        ] },
        { id: 'shotset', name: "6'lı Shot Set", tag: "6'lı Shot Set", items: [
          { n: 'Olmeca', o: [V('Çeşit', OLM.concat('Karışık'))] },
          { n: 'Absolut', o: [V('Çeşit', ABS.concat('Karışık'))] },
          { n: 'Jameson' }, { n: 'Jagermeister' }, { n: 'Amerikan Viski', o: [V('Marka', AMER.concat('Karışık'), 0)] },
        ] },
        { id: 'sise', name: 'Şişe Alkol', tag: 'Şişe', items: [
          { n: "Ballantine's", o: [SISE] }, { n: "Ballantine's 7", fx: ['70 cl'] }, { n: "Ballantine's 10", o: [SISE] },
          { n: 'Chivas Regal 12', o: [SISE] }, { n: 'Chivas Regal Smoky', o: [SISE] },
          { n: 'Chivas Regal XV Gold', fx: ['70 cl'] }, { n: 'Chivas Regal 18', fx: ['70 cl'] },
          { n: 'Jameson', o: [SISE] }, { n: 'Jameson Stout Edt.', fx: ['70 cl'] }, { n: 'Jameson Black Barrel', fx: ['70 cl'] },
          { n: 'Beefeater', o: [SISE, V('Çeşit', ['Beefeater', 'Beefeater Pink'])] },
          { n: 'Malfy', fx: ['70 cl'], o: [V('Çeşit', ['Originale', 'Rosa', 'Limona'])] },
          { n: 'Absolut', o: [SISE] }, { n: 'Absolut Elyx', fx: ['70 cl'] },
          { n: 'Olmeca', o: [SISE, V('Çeşit', ['Blanco', 'Dark', 'Gold'])] },
          { n: 'Olmeca Altos Reposado', fx: ['70 cl'] }, { n: 'Olmeca Altos Plata', fx: ['70 cl'] },
          { n: 'Avion Silver', fx: ['70 cl'] }, { n: 'Avion Reposado', fx: ['70 cl'] },
          { n: 'Havana Club 3 Anos', fx: ['70 cl'] }, { n: 'Havana Club 7 Anos', fx: ['70 cl'] },
          { n: 'Standart Scotch', fx: ['70 cl'] },
          { n: 'Delux Scotch', fx: ['70 cl'], o: [V('Marka', ['JW Black Label', "Dewar's 12"])] },
          { n: 'Standart Cin', fx: ['70 cl'], o: [V('Marka', ["Gordon's", 'Tanqueray', 'Bombay', 'Ford'])] },
          { n: "Hendrick's", fx: ['70 cl'] },
          { n: 'Standart Votka', fx: ['70 cl'], o: [V('Marka', ['Smirnoff', 'Finlandia'])] },
          { n: 'Delux İthal Votka', fx: ['70 cl'], o: [V('Marka', ['Grey Goose', 'Belvedere', 'Beluga', 'Stolichnaya Elit'])] },
          { n: 'Standart American Whiskey', fx: ['70 cl'], o: [V('Marka', AMER)] },
          { n: 'Jagermeister', fx: ['70 cl'] },
        ] },
      ],
    },
  ];

  // ROP 6 (kasa programı) sırası. Teyitli siparişte ürünler bu sırayla gruplanır ki ROP'a sırayla girilsin.
  //   kisayol: ROP'un ortadaki siyah panelindeki hazır butonlar (en başa gelir, panel sırasıyla)
  //   gruplar: ROP kategorileri; c = bu uygulamadaki kategori id'leri (menu.js'teki id)
  window.ROP_SIRA = {
    kisayol: [
      { n: 'Tuborg Gold', o: 'Fıçı 50 cl' }, { n: 'Carlsberg', o: 'Fıçı 50 cl' },
      { n: 'Tuborg Gold', o: 'Fıçı 33 cl' }, { n: 'Carlsberg', o: 'Fıçı 33 cl' },
      { n: 'Weihenstephan Hefeweissbier', o: 'Fıçı 50 cl' }, { n: 'Guinness', o: 'Fıçı 50 cl' },
      { n: 'Carlsberg', o: 'Şişe 50 cl' }, { n: 'Tuborg Gold', o: 'Şişe 33 cl' },
      { n: 'Sol' }, { n: 'Tuborg Filtresiz' }, { n: 'Türk Kahvesi' }, { n: 'Demleme Çay (Cam Bardak)' },
      { n: 'Premium Soda' }, { n: 'Soda Limon' }, { n: 'Coffee Latte' }, { n: 'Cappuccino' },
      { n: 'Su' }, { n: 'Demleme Çay (Kupa / Fincan)' }, { n: 'Fıstık' },
    ],
    gruplar: [
      { n: 'Başlangıçlar › Çorba ve Kahvaltı', c: ['corba'] },
      { n: 'Başlangıçlar › Başlangıç', c: ['baslangiclar'] },
      { n: 'Başlangıçlar › Ara Sıcaklar', c: ['arasicak', 'patates', 'ortaya', 'nachos', 'taco', 'quesadilla', 'cerez', 'sos'] },
      { n: 'Başlangıçlar › Salatalar', c: ['salata'] },
      { n: 'Başlangıçlar › Tatlılar', c: ['tatli'] },
      { n: 'Hamur İşleri', c: ['pizza', 'krep', 'durum'] },
      { n: 'Ana Yemekler', c: ['burger', 'makarna', 'et', 'tavuk', 'deniz', 'uzakdogu', 'sokak', 'kase', 'diyet'] },
      { n: 'Sıcak-Soğuk İçecek', c: ['cay', 'kahve', 'mesrubat', 'su'] },
      { n: 'Aperatif İçecekler', c: ['aperatif', 'biralar'] },
      { n: 'Kokteyller', c: ['sig1', 'sig2', 'intl', 'margarita', 'gintonic'] },
      { n: 'Şarap-Şampanya', c: ['kadeh', 'kirmizi', 'beyaz', 'roze', 'kopuklu', 'sangria'] },
      { n: 'Viskiler', c: ['viski'] },
      { n: 'Rom-Tequila', c: ['rom', 'tekila'] },
      { n: 'Cin-Vb.', c: ['cin', 'votka', 'likor', 'konyak', 'shot', 'shotset', 'sise'] },
    ],
  };
})();
