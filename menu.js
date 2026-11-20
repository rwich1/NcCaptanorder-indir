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

  // [uygulamadaki ad, ROP'taki buton adı]
  const EKLER = [
    ['Maç Ücreti', 'Mac Ücreti'], ['Maç Ücreti (S)', 'Mac Ücreti (S)'],
    ['Ekstra Çıtır Tavuk 200 gr', 'Z.. Çıtır Tavuk 200 Gr'], ['Ekstra Et 100 gr', 'Z.. Et 100 gr'],
    ['Ekstra Ezine Peynir 1 adet', 'Z.. Ezine Peynir 1 Adet'], ['Ekstra Haşlanmış Sebze', 'Z.. Haşlanmış Sebze'],
    ['Ekstra Havuç Salatalık', 'Z.. Havuç Salatalık'], ['Ekstra Köfte 2 adet', 'Z.. Köfte 2 Adet'],
    ['Ekstra Levrek 100 gr', 'Z.. Levrek 100 Gr'], ['Ekstra Mozzarella Stick 2 adet', 'Z.. Mozzarella Stick 2 Adet'],
    ['Ekstra Paçanga 1 adet', 'Z.. Paçanga 1 Adet'], ['Ekstra Parmesan 1 dilim', 'Z.. Parmesan 1 Dilim'],
    ['Ekstra Patates 125 gr', 'Z.. Patates 125 gr'], ['Ekstra Peynir 2 dilim', 'Z.. Peynir 2 Dilim'],
    ['Ekstra Salam', 'Z.. Salam'], ['Ekstra Sigara Böreği 2 adet', 'Z.. Sigara Böreği 2 Adet'],
    ['Ekstra Simit 1 adet', 'Z.. Simit 1 Adet'], ['Ekstra Soğan Halkası 6 adet', 'Z.. Soğan Halkası 6 Adet'],
    ['Ekstra Somon Füme 30 gr', 'Z.. Somon Füme 30 Gr'], ['Ekstra Sosis 1 adet', 'Z.. Sosis 1 Adet'],
    ['Ekstra Sucuk (4/1)', 'Z.. Sucuk 4/1'], ['Ekstra Tavuk 100 gr', 'Z.. Tavuk 100 gr'],
    ['Ekstra Tavuk Nugget 1 adet', 'Z.. Tavuk Nugget 1 Adet'], ['Ekstra Trio Burger 1 adet', 'Z.. Trio Burger (1 Adet)'],
    ['Ekstra Turşu', 'Z.. Turşu'], ['Ekstra Yoğurt', 'Z.. Yoğurt'], ['Ekstra Zeytin', 'Z.. Zeytin'],
  ];
  const PRO = [
    ['Aberlour 12', '(Pro) Aberlour 12Y. 70 Cl'], ['Absolut', '(Pro) Absolut 70 Cl'],
    ['Beefeater', '(Pro) Beefeater 70 Cl'], ['Beefeater Pink', '(Pro) Beefeater Pink 70 Cl'],
    ['Chivas Regal 13', '(Pro) Chivas R.13Y.70 Cl'], ['Chivas Regal 15', '(Pro) Chivas R.15Y.70 Cl'],
    ['Chivas Regal 18', '(Pro) Chivas R.18Y.70 Cl'], ['Chivas Regal Smoky', '(Pro) Chivas R.Smoky 70 Cl'],
    ['Glenlivet Founders', '(Pro) Glenlivet Fonders 70 Cl'], ['Jameson', '(Pro) Jameson 70 Cl'],
    ['Jameson Black Barrel', '(Pro) Jameson Black 70 Cl'], ['Malfy Limone', '(Pro) Malfy Limone 70 Cl'],
    ['Malfy Originale', '(Pro) Malfy Originale 70 Cl'], ['Malfy Rosa', '(Pro) Malfy Rosa 70 Cl'],
    ['Olmeca', '(Pro) Olmeca 70 Cl'],
  ];
  const P51 = [
    ['1664 Blanc Şişe', '5+1 Blanc Şişe'], ['Budweiser', '5+1 Budweiser'], ['Carlsberg Luna Şişe', '5+1 C.Luna Şişe'],
    ['Carlsberg Elephant 50 cl', '5+1 Carlsberg Elephant Ş.50'], ['Carlsberg Şişe 33 cl', '5+1 Carlsberg Ş.33'],
    ['Carlsberg Şişe 50 cl', '5+1 Carlsberg Ş.50'], ['Desperados', '5+1 Desperados'], ['Frederik', '5+1 Frederik'],
    ['Glutensiz Bira', '5+1 Glutensiz'], ['Heineken', '5+1 Heineken'], ['Sol', '5+1 Sol Şişe'],
    ['Tuborg Filtresiz', '5+1 Tuborg Filtresiz'], ['Tuborg Ice', '5+1 Tuborg ICE'], ['Tuborg Smooth', '5+1 Tuborg Smooth 33 Cl'],
    ['Tuborg Şişe 33 cl', '5+1 Tuborg Şişe 33'], ['Tuborg Şişe 50 cl', '5+1 Tuborg Şişe 50'],
    ['Weihenstephan Vitus', '5+1 Weih. Vitus Şiş'], ['Weihenstephan Şişe', '5+1 Weihenstephan Şişe'],
  ];

  window.MENU = [
    // ======================= BAŞLANGIÇ =======================
    {
      id: 'baslangic', name: 'Başlangıç', kind: 'food', cats: [
        { id: 'corba', name: 'Çorbalar', items: [
          { n: 'Günün Çorbası' }, { n: 'Günün Çorbası (Yarım)' },
          { n: 'Minestrone Çorbası' }, { n: 'Minestrone Çorbası (Yarım)' },
        ] },
        { id: 'kahvalti', name: 'Kahvaltı', items: [
          { n: 'Kahvaltı', o: [V('Kişi', ['1 Kişilik', '2 Kişilik', '4 Kişilik'])] }, { n: 'Kahvaltı Tabağı' },
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
          { n: 'Kokteyl Sos' }, { n: 'Çikolata Sos' }, { n: 'Joker Sos (1 adet)' },
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
        { id: 'cocuk', name: 'Çocuk Menü', items: [
          { n: 'Çocuk Abur Cubur' }, { n: 'Çocuk Köfteli Spagetti' }, { n: 'Çocuk Mini Çıtır Tavuk' },
          { n: 'Çocuk Pizza Karışık' }, { n: 'Çocuk Pizza Margarita' }, { n: 'Çocuk Pizza Sosisli' },
          { n: 'Çocuk Sade Makarna' }, { n: 'Çocuk Sosis Keyfi' }, { n: 'Çocuk Şinitzel' }, { n: 'Çocuk Trio Burger' },
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
          { n: 'Fanta' }, { n: 'Sprite' },
          { n: 'Schweppes', o: [V('Çeşit', ['Tonik', 'Tonik Şekersiz', 'Lime', 'Mandarin', 'Zencefil'])] },
          { n: 'Fuse Tea', o: [V('Çeşit', ['Limon', 'Şeftali'])] },
          { n: 'Cappy Meyve Suyu', o: [V('Çeşit', ['Elma', 'Karışık', 'Portakal', 'Şeftali', 'Vişne'])] }, { n: 'Ayran', s: 'Sütaş cam şişe 300 ml' },
          { n: 'Red Bull', o: [V('Çeşit', ['Energy Drink', 'Sugarfree', 'Peach', 'Red', 'White', 'Blue'])] },
          { n: 'Red Bull Twist', o: [V('Çeşit', ['White', 'Blue'])] },
          { n: 'Stay Classic', s: 'Red Bull + Votka' },
        ] },
        { id: 'su', name: 'Su · Soda · Meyve Suyu', items: [
          { n: 'Su', s: 'Damla 330 ml' }, { n: 'Premium Soda', o: [V('Boy', ['250 ml', '750 ml'])] },
          { n: 'Meyveli Soda', o: [V('Çeşit', ['Çilek', 'Elma', 'Karpuz Çilek', 'Limon', 'Nar'])] }, { n: 'Soda Limon' }, { n: 'Soda Vişne' },
          { n: 'Limonata' }, { n: 'Meyveli Limonata', o: [V('Çeşit', ['Çilek', 'Elma', 'Nane', 'Orman Meyveli'])] }, { n: 'Alkolsüz Meyve Kokteyli' },
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
    // ======================= EKSTRA · PROMOSYON =======================
    // Ürün adı uygulamada tam yazılır; ROP'taki buton adı aşağıdaki ROP_SIRA'da (teyitten sonra o görünür).
    {
      id: 'ekstra', name: 'Ekstra · Promo', kind: 'food', cats: [
        { id: 'ekler', name: 'Ekler ve İlaveler', items: EKLER.map(x => ({ n: x[0] })) },
        { id: 'promosise', name: 'Promosyon Şişe (Pro)', tag: 'Promosyon', fx: ['Şişe 70 cl'], k: 'drink', items: PRO.map(x => ({ n: x[0] })) },
        { id: 'promo51', name: '5+1 Bira', tag: '5+1 Kampanya', k: 'drink', items: P51.map(x => ({ n: x[0] })) },
      ],
    },
  ];

  // ======================= ROP (kasa programı) =======================
  // Teyitli siparişte ürünler ROP'taki sekme › alt sekme sırasıyla gruplanır ve ROP'taki buton adıyla yazılır.
  // Sipariş alırken uygulamadaki tam ad kullanılır; ROP adı sadece sipariş ekranında / paylaşımda görünür.
  //   u: [uygulamadaki ürün, ROP buton adı]
  //      ürün yazımı: 'Ad'  ya da  'kategori>Ad'  (içkilerde aynı ad birden fazla kategoride olabilir)
  //      sonuna '|seçenek' eklenirse sadece o seçenek seçildiğinde eşleşir (örn. 'biralar>Carlsberg|Fıçı 50 cl')
  //   c: bu kategorilerin listede olmayan ürünleri de bu bölüme girer (ROP adı bilinmiyorsa uygulamadaki adla)
  const TO = (cat, list) => list.map(x => [cat + '>' + x[0], x[1]]);
  window.ROP_SIRA = { sekmeler: [
    { n: 'Başlangıçlar', alt: [
      { n: 'Çorba ve Kahvaltı', c: ['corba', 'kahvalti'], u: [
        ['Günün Çorbası', 'Çorba Günün'], ['Günün Çorbası (Yarım)', 'Çorba Günün Yarım'],
        ['Minestrone Çorbası', 'Çorba Minestrone'], ['Minestrone Çorbası (Yarım)', 'Çorba Minestrone Yarım'],
        ['Kahvaltı|1 Kişilik', 'Kahvaltı 1 Kişilik'], ['Kahvaltı|2 Kişilik', 'Kahvaltı 2 Kişilik'],
        ['Kahvaltı|4 Kişilik', 'Kahvaltı 4 Kişilik'], ['Kahvaltı Tabağı', 'Kahvaltı Tabağı'],
      ] },
      { n: 'Başlangıç', c: ['baslangiclar'], u: [
        ['Ezine Peynir Tabağı', 'Ezine Peynir Tabağı'], ['Kızarmış Hellim Tabağı', 'Kızartılmış Hellim Tabağı'],
        ['Mozzarella Caprese', 'Mozzarella Capresse'], ['Peynir Tabağı', 'Peynir Tabağı'],
      ] },
      { n: 'Ara Sıcaklar', c: ['arasicak', 'patates', 'ortaya', 'nachos', 'taco'], u: [
        ['Acılı Buffalo Soslu Tavuk', 'Acılı Buffalo S.Tavuk'], ['BBQ Soslu Çıtır Tavuk', 'BBQ Soslu Çıtır Tavuk'],
        ['Cajun Baharatlı Çıtır Tavuk', 'Cajun Bhratl.Ç.Tavuk'], ['Cheddar Soslu & Hellim Peynirli Patates Tava', 'Cheddar S.Hellim P.Tava'],
        ['Çıtır Levrek', 'Çıtır Levrek'], ['Çıtır Tavuk', 'Çıtır Tavuk'], ['Çıtır Tavuk Sepeti', 'Çıtır Tavuk Sepeti'],
        ['Glütensiz Çıtır Tavuk', 'Glütensiz Çıtır Tavuk'], ['Gökkuşağı', 'Gökkuşağı'], ['Gurme Tavuklar', 'Gurme Tavuk'],
        ['Halka Kalamar', 'Halka Kalamar'], ['Nacho Chips', 'Nachos Cips'], ['Nachos de Cheese', 'Nachos de Cheese'],
        ['Nachos de Beef', 'Nachos de Beef'], ['Nachos de Mince', 'Nachos de Mince'], ['Paçanga Böreği', 'Paçanga Böreği'],
        ['Anne Usulü Patates|Baharatlı', 'Patates Baharatlı Anne Usl.'], ['Anne Usulü Patates', 'Patates Anne Usulü'],
        ['Churros Patates', 'Patates Churros'], ['Gurme Patates', 'Patates Gurme'],
        ['Parmak Patates|Baharatlı', 'Patates Parmak Baharatlı'], ['Parmak Patates', 'Patates Parmak'],
        ['Peynirli Baharatlı Patates Tava', 'Peynirli B.Patates Tava'], ['Sıcak Sepeti', 'Sıcak Sepeti'],
        ['Sigara Böreği', 'Sigara Böreği'], ['Sohbet Arası', 'Sohbet Arası'],
        ['Etli Taco', 'Taco Etli'], ['Kıymalı Taco', 'Taco Kıymalı'], ['Tavuklu Taco', 'Taco Tavuklu'],
      ] },
      { n: 'Salatalar', c: ['salata', 'kase'], u: [
        ['Acılı Izgara Tavuk Salata', 'Acılı.I.Tavuk Salata'], ['Ankara Salata', 'Ankara Salatası'],
        ['Asya Esintili Salata', 'Asya Esintili Salata'], ['Çıtır Levrek Salata', 'Çıtır Levrek Salata'],
        ['Çıtır Tavuklu Salata', 'Çıtır Tavuklu Salata'], ['Ilık Peynirli Salata', 'Ilık Peynirli Salata'],
        ['Ilık Tavuklu Bademli Salata', 'Ilık Tavuklu Bademli Salata'], ['Izgara Etli Salata', 'Izgara Etli Salata'],
        ['Kızarmış Hellim Peynirli Salata', 'K.Hellim P.Salata'], ['Çıtır Levrek Kase', 'Kase Çıtır Levrek'],
        ['Çıtır Tavuklu Kase', 'Kase Çıtır Tavuklu'], ['Dana Etli Kase', 'Kase Dana Etli'], ['Köfteli Kase', 'Kase Köfteli'],
        ['Somonlu Kase', 'Kase Somonlu'], ['Sezar Salata', 'Sezar Salata'], ['Tavuklu Diyet Salata', 'Tavuklu Diyet Salata'],
      ] },
      { n: 'Tatlılar', c: ['tatli'], u: [
        ['Cheesecake|Çikolata', 'Cheesecake Çikolatalı'], ['Cheesecake|Frambuaz', 'Cheesecake Frambuazlı'],
        ['Cheesecake|Limon', 'Cheesecake Limonlu'], ['Churros (Tatlı)', 'Churros'], ['Diyabetik Cheesecake', 'Diyabetik Cheesecake'],
        ['Ilık Çikolatalı Kek', 'Ilık Çikolatalı Kek'], ['Kahveli Creme Brulee', 'Kahveli Creme Brulee'],
        ['Meyve Tabağı', 'Meyve Tabağı'], ['Orman Meyveli Beyaz Çikolatalı Profiterol', 'Orman M.Beyaz Ç.Profiterol'],
        ['Profiterol', 'Profiterol'], ['San Sebastian', 'San Sebastian'], ['Tiramisu', 'Tiramisu'],
      ] },
    ] },
    { n: 'Hamur İşleri', alt: [
      { n: 'Makarnalar', c: ['makarna'], u: [
        ['Çıtır Tavuklu Penne', 'Çıtır Tavuk Penne'], ['Çıtır Tavuklu Mac & Cheese', 'Çıtır.T.MacCheese'],
        ['Fettuccine Alfredo', 'Fettucini Alfredo'], ['Glütensiz Pirinç Makarna', 'Glutensiz Makarna'],
        ['Mac & Cheese', 'MacCheese'], ['Patlıcanlı Ravioli', 'Patlıcan Ravioli'], ["Penne All'arrabbiata", "Penne All'Arrabbiata"],
        ['Sinop Mantısı', 'Sinop Mantısı'], ['Spagetti Bolonez', 'Spagetti Bolenez'], ['Spagetti Napoliten', 'Spagetti Napoliten'],
      ] },
      { n: 'Pizzalar', c: ['pizza'], u: [
        ['A la Turca', 'A la Turca Pizza'], ['Alfredo Soslu Tavuk Pizza', 'Alfredo S.Tavuk Pizza'], ['Calzone', 'Calzone'],
        ['Formaggi Pizza', 'Formaggi Pizza'], ['Ispanaklı Lor Peynirli Pizza', 'Ispanak Lor Peynirli Pizza'],
        ['İstiridye Mantarlı Pizza', 'İstiridye Mantarlı Pizza'], ['Kıtır Tavuk Pizza', 'Kıtır Tavuklu Pizza'],
        ['Margherita Pizza', 'Margharita Pizza'], ['Robes Pierre', 'Robes Pierre'], ['Vejetaryen Pizza', 'Vejeteryan Pizza'],
      ] },
      { n: 'Dürümler / Sokak Lez.', c: ['durum', 'krep', 'sokak', 'quesadilla'], u: [
        ['Bagette Kokoreç', 'Bagette Kokoreç'], ['Bagette Sebzeli Kokoreç', 'Bagette Kokoreç Sebzeli'],
        ['Bagette Köfte', 'Bagette Köfte'], ['Bagette Levrek', 'Bagette Levrek'], ['Bagette Tavuk Şiş', 'Bagette Tavuk Şiş'],
        ['Acılı Çıtır Tavuklu Dürüm', 'Dürüm Acılı Çıtır Tavuk'], ['Izgara Etli Dürüm', 'Dürüm Izgara Etli'],
        ['Izgara Tavuklu Dürüm', 'Dürüm Izgara Tavuklu'], ['Etli Krep', 'Krep Etli'],
        ['Ispanaklı Lor Peynirli Krep', 'Krep Ispanaklı Lor Pynr'], ['Tavuklu Krep', 'Krep Tavuklu'],
        ['Etli Quesadilla', 'Quesadilla Etli'], ['Tavuklu Quesadilla', 'Quesadilla Tavuklu'], ['Tavuk-Pilav', 'Tavuk Pilav'],
      ] },
      { n: 'Burgerler', c: ['burger'], u: [
        ['Burger', 'Burger'], ['Cheeseburger', 'Cheeseburger'], ['Gurme Burger', 'Gurme Burger'],
        ['Hot Chili Burger', 'Hot Chili Burger'], ['Islak Burger', 'Islak Burger'],
        ['Mantarlı ve Kıtır Soğanlı Burger', 'Mantarlı ve Kıtır Soğanlı Burg.'], ['Tavuk Burger', 'Tavuk Burger'],
        ['Texas Burger', 'Texas Burger'], ['Trio Burger', 'Trio Burger'], ['Trüf Soslu Mantarlı Burger', 'Trüf S.Mntrl.Burger'],
        ['Vegan Burger', 'Vegan Burger'],
      ] },
    ] },
    { n: 'Ana Yemekler', alt: [
      { n: 'Tavuk', c: ['tavuk', 'uzakdogu'], u: [
        ['Asya Usulü Tavuk', 'Asya Usulü Tavuk'], ['Bademli Fesleğenli Tavuk', 'Bademli Fesleğenli Tavuk'],
        ['Cornflakes Şinitzel', 'Cornflakes Şinitzel'], ['Izgara Tavuk Şiş', 'Izgara Tavuk Şiş'],
        ['Kekikli Tavuk Külbastı', 'Kekikli Tavuk Külbastı'], ['Kore Usulü Kızarmış Tavuk', 'Kore Usulü Kızarmış Tavuk'],
        ['Köri Soslu Tavuk', 'Köri Soslu Tavuk'], ['Çıtır Tavuklu Noodle', 'Noodle Çıtır Tavuklu'],
        ['Köri Tavuklu Noodle', 'Noodle Köri Tavuklu'], ['Sebzeli Noodle', 'Noodle Sebzeli'], ['Tavuk Kulesi', 'Tavuk Kulesi'],
        ['Tavuk Şinitzel', 'Tavuk Şinitzel'], ['Teriyaki Soslu Tavuk', 'Tiryaki Soslu Tavuk'],
      ] },
      { n: 'Denizden', c: ['deniz'], u: [
        ['Fish and Chips', 'Fish and Chips'], ['Somon Izgara', 'Somon Izgara'],
      ] },
      { n: 'Diyetteyim', c: ['diyet'], u: [
        ['Buharda Tavukgöğsü', 'Buharda Tavuk Göğsü'],
      ] },
      { n: 'Et', c: ['et'], u: [
        ['Bonfile Fileminyon', 'Bonfile Fileminyon'], ['Café De Paris Soslu Bonfile', "Cafe'de Paris Soslu Bonfile"],
        ['Izgara Antrikot', 'Izgara Antrikot'], ['Izgara Köfte', 'Izgara Köfte'],
        ['Kekikli Dana Külbastı', 'Kekikli Dana Külbastı'], ['Pepper Steak', 'Pepper Steak'],
      ] },
      { n: 'Çocuk Menü', c: ['cocuk'], u: [
        ['Çocuk Abur Cubur', 'Çocuk Abur Cubur'], ['Çocuk Köfteli Spagetti', 'Çocuk Köfte Spagetti'],
        ['Çocuk Mini Çıtır Tavuk', 'Çocuk Mini Ç.Tavuk'], ['Çocuk Pizza Karışık', 'Çocuk P.Karışık'],
        ['Çocuk Pizza Margarita', 'Çocuk P.Margarita'], ['Çocuk Pizza Sosisli', 'Çocuk P.Sosisli'],
        ['Çocuk Sade Makarna', 'Çocuk Sade Makarna'], ['Çocuk Sosis Keyfi', 'Çocuk Sosis Keyfi'],
        ['Çocuk Şinitzel', 'Çocuk Şinitzel'], ['Çocuk Trio Burger', 'Çocuk Trio Burgers'],
      ] },
    ] },
    { n: 'Sıcak-Soğuk İçecek', alt: [
      { n: 'Soğuk İçecekler', c: ['mesrubat', 'su'], u: [
        ['Ayran', 'Ayran'],
        ['Cappy Meyve Suyu|Elma', 'Cappy Şişe Elma'], ['Cappy Meyve Suyu|Karışık', 'Cappy Şişe Karışık'],
        ['Cappy Meyve Suyu|Portakal', 'Cappy Şişe Portakal'], ['Cappy Meyve Suyu|Şeftali', 'Cappy Şişe Şeftali'],
        ['Cappy Meyve Suyu|Vişne', 'Cappy Şişe Vişne'],
        ['Coca-Cola', 'Coca Cola'], ['Coca-Cola Light', 'Coca Cola Light'], ['Coca-Cola Şekersiz', 'Coca Cola Zero'],
        ['Portakallı Havuç Suyu', 'Exotic Por. Havuç'], ['Portakallı Nar Suyu', 'Exotic Por. Nar'],
        ['Nar Suyu', 'Exotic Nar Suyu'], ['Portakal Suyu', 'Exotic Portakal'], ['Fanta', 'Fanta'],
        ['Fuse Tea|Limon', 'Fuse Tea Limon'], ['Fuse Tea|Şeftali', 'Fuse Tea Şeftali'],
        ['Meyveli Limonata|Çilek', 'Limonata Çilek'], ['Meyveli Limonata|Elma', 'Limonata Elma'],
        ['Meyveli Limonata|Nane', 'Limonata Nane'], ['Meyveli Limonata|Orman Meyveli', 'Limonata O.Meyveli'],
        ['Limonata', 'Limonata Sade'], ['Red Bull', 'RedBull'],
        ['Schweppes|Lime', 'Schweppes Lime'], ['Schweppes|Mandarin', 'Schweppes Mandrin'],
        ['Schweppes|Tonik Şekersiz', 'Schweppes Tonik Şekersiz'], ['Schweppes|Tonik', 'Schweppes Tonik'],
        ['Schweppes|Zencefil', 'Schweppes Zencefil'], ['Sprite', 'Sprite'], ['Su', 'Su'],
        ['Meyveli Soda|Çilek', 'ŞİŞE Uludağ Çilek'], ['Meyveli Soda|Elma', 'ŞİŞE Uludağ Elma'],
        ['Meyveli Soda|Karpuz Çilek', 'ŞİŞE Uludağ Karpuz Çilek'], ['Meyveli Soda|Limon', 'ŞİŞE Uludağ Limon'],
        ['Meyveli Soda|Nar', 'ŞİŞE Uludağ Nar'],
        ['Premium Soda|750 ml', 'Uludağ Premium 75 Ml'], ['Premium Soda', 'Uludağ Premium'],
        ['Soda Limon', 'Uludağ Premium Soda Limon'], ['Soda Vişne', 'Uludağ Premium Vişne'],
      ] },
      { n: 'Alkolsüz Kokteyler', u: [
        ['Alkolsüz Meyve Kokteyli', 'Alkolsüz Meyve Kokteyli'],
      ] },
      { n: 'Alkollü Kokteyller', c: ['sig1', 'sig2', 'intl', 'margarita', 'gintonic', 'sangria'], u: [] },
      { n: 'Sıcak İçecekler', c: ['cay', 'kahve'], u: [
        ['Türk Kahvesi', 'Türk Kahvesi'], ['Demleme Çay (Cam Bardak)', 'Demleme Çay'],
        ['Demleme Çay (Kupa / Fincan)', 'Demleme Çay Kupa'], ['Coffee Latte', 'Cafe Latte'], ['Cappuccino', 'Cappuccino'],
      ] },
      { n: 'Kuruyemiş', c: ['cerez'], u: [
        ['Fıstık', 'Tuzlu Fıstık'],
      ] },
    ] },
    { n: 'Aperatif İçecekler', alt: [
      { n: 'Biralar', c: ['biralar'], u: [
        ["5'li Tadım Seti", "5'li Tadım Seti"],
        ['1664 Blanc|Fıçı 25 cl', 'Blanc Fıçı 25 Cl'], ['1664 Blanc|Fıçı 33 cl', 'Blanc Fıçı 33 Cl'],
        ['1664 Blanc|Fıçı 50 cl', 'Blanc Fıçı 50 Cl'], ['1664 Blanc|Şişe 33 cl', 'Blanc ŞİŞE 33 Cl'],
        ['Budweiser', 'Budweiser ŞİŞE 33 Cl'], ['Carlsberg Luna', 'C.Luna ŞİŞE 50 Cl'],
        ['Carlsberg Elephant', 'Carlsberg Elephant 50 Cl'],
        ['Carlsberg|Şişe 33 cl', 'Carlsberg.33 Şişe'], ['Carlsberg|Şişe 50 cl', 'Carlsberg.50 Şişe'],
        ['Carlsberg|Fıçı 25 cl', 'Carlsberg.Fıçı 25 Cl'], ['Carlsberg|Fıçı 33 cl', 'Carlsberg.Fıçı 33 Cl'],
        ['Carlsberg|Fıçı 50 cl', 'Carlsberg.Fıçı 50 Cl'], ['Carlsberg|Fıçı 1 lt', 'Carlsberg.Fıçı 1 Lt'],
        ['Desperados', 'Desperados ŞİŞE'], ['Frederik Brown Ale', 'Frederik Brown Ale ŞİŞE'],
        ['Frederik India Pale Ale', 'Frederik India Pale ŞİŞE'], ['Frederik Local', 'Frederik Local ŞİŞE'],
        ['Frederik Marzen Lager', 'Frederik Marzen Lager ŞİŞE'], ['Frederik NEIPA', 'Frederik NEIPA ŞİŞE'],
        ['Frederik Tropic IPA', 'Frederik Tropic Ipa Şişe'], ['Frederik Wheat IPA', 'Frederik Wheat Ipa ŞİŞE'],
        ['Frederik Yakima IPA', 'Frederik Yakima Ipa'], ['Daura (Glutensiz)', 'Glutensiz ŞİŞE 33 Cl'],
        ['Guinness|Fıçı 25 cl', 'Guiness Fıçı 25 Cl'], ['Guinness|Fıçı 50 cl', 'Guiness Fıçı 50 Cl'],
        ['Heineken', 'Heineken ŞİŞE 33 Cl'], ['Sol', 'Sol ŞİŞE'], ['Tuborg Filtresiz', 'Tuborg Filtresiz 50 Cl'],
        ['Tuborg Ice', 'Tuborg ICE 33 Cl'], ['Tuborg Gold|Şişe 33 cl', 'Tuborg ŞİŞE 33 Cl'],
        ['Tuborg Gold|Fıçı 25 cl', 'Tuborg Fıçı 25 Cl'], ['Tuborg Gold|Fıçı 33 cl', 'Tuborg Fıçı 33 Cl'],
        ['Tuborg Gold|Fıçı 50 cl', 'Tuborg Fıçı 50 Cl'], ['Tuborg Gold|Fıçı 1 lt', 'Tuborg Fıçı 1 Lt'],
        ['Tuborg Smooth', 'Tuborg Smooth 33 Cl'],
        ['Weihenstephan Hefeweissbier|Fıçı 33 cl', 'Weihenstephan Fıçı 33 Cl'],
        ['Weihenstephan Hefeweissbier|Fıçı 50 cl', 'Weihenstephan Fıçı 50 Cl'],
        ['Weihenstephan Hefeweissbier|Şişe 33 cl', 'Weihenstephan ŞİŞE 33 Cl'],
        ['Weihenstephan Vitus', 'Weihenstephan Vitus ŞİŞE'],
      ] },
      { n: 'Konyaklar', c: ['konyak'], u: [] },
      { n: 'Likörler', c: ['likor'], u: [['aperatif>Garrone Lemoncello', null]] },
      { n: 'Rakılar', u: [
        ['aperatif>Yeni Rakı', null], ['aperatif>Yeni Seri', null], ['aperatif>Tekirdağ Altın Seri', null], ['aperatif>Efe Gold', null],
      ] },
      { n: 'Vermutlar', c: ['aperatif'], u: [] },
    ] },
    { n: 'Şarap-Şampanya', alt: [
      { n: 'Beyaz Şaraplar', c: ['beyaz'], u: TO('beyaz', [
        ['Ancyra Narince', 'Ancyra Narince'], ['Ancyra Sauvignon Blanc', 'Ancyra Sauv.Blanc'],
        ['Ancyra Sultaniye Emir', 'Ancyra Sultaniye-Emir'], ['Angora Beyaz', 'Angora Beyaz 75'],
        ["Cotes d'Avanos Chardonnay", "Cotes d'Avanos N.Chrdn"],
        ['Çankaya|37,5 cl', 'Çankaya 37,5'], ['Çankaya|75 cl', 'Çankaya 75'], ['Egeo Sauvignon Blanc', 'Egeo Sau.Blanc'],
        ['Kavaklıdere Misket', 'Kavaklıdere Misket'], ['Montes Sauvignon Blanc', 'Montes Sauvignon Blanc'],
        ['Prestige Narince', 'Prestige Narince'], ['Santa Helena Chardonnay', 'Santa Helena Chardonnay'],
        ['Santa Helena Sauvignon Blanc', 'Santa Helena Sau.Blanc'], ['Sartori Pinot Grigio', 'Sartori Pinot Grigio'],
        ['Selection Narince-Emir', 'Selection Beyaz'], ['Vin-Art Narince-Chardonnay', 'Vin Art Narince Chardonnay'],
      ]) },
      { n: 'Kırmızı Şaraplar', c: ['kirmizi'], u: TO('kirmizi', [
        ['Ancyra Boğazkere', 'Ancyra Boğazkere'], ['Ancyra Cabernet Sav. Syrah', 'Ancyra Cab.Sau.Syrah'],
        ['Ancyra Kalecik Karası', 'Ancyra Kalecik Karası'], ['Ancyra Merlot', 'Ancyra Merlot'],
        ['Ancyra Öküzgözü', 'Ancyra Öküzgözü'], ['Angora Kırmızı', 'Angora Kırmızı 75'],
        ['Baron de Lastac', 'Baron de Lestac'], ['Bodega Calia Shiraz-Malbec', 'Bodega Calia Shiraz-Malbec'],
        ['Claud-Bellevue Merlot-Cabernet Franc', 'Claud Bellevue'], ['Egeo Merlot Syrah Cabernet Sav.', 'Egeo Blend'],
        ['Egeo Cabernet Sav.', 'Egeo Cabernet Sau.'], ['Egeo Syrah', 'Egeo Syrah'], ['Gato Negro Carmenere', 'Gato Negro'],
        ['La Croix Lartique Merlot-Cabernet Franc', 'La Croix Lartigue'], ['La Folie Merlot-Cabernet Franc', 'La Folie'],
        ['La Terra Chianti', 'La Terra Chianti'], ['Montes Malbec', 'Montes Malbec'], ['Montes Merlot', 'Montes Merlot'],
      ]) },
      { n: 'Roze Şaraplar', c: ['roze'], u: TO('roze', [
        ['Ancyra Blush', 'Ancyra Blush'], ['Angora Roze', 'Angora Roze 75'], ['Blush by Moncigale', 'Blush By Moncigale'],
        ['Casal Mendes', 'Casal Mendes'], ['Egeo Roze', 'Egeo Roze'], ['Lal', 'Lal 75'], ['Rosato', 'Rosato'],
        ['Sartori Pinot Grigio Blush', 'Sartori Blush'],
      ]) },
      { n: 'Kadeh Şaraplar', c: ['kadeh'], u: TO('kadeh', [
        ['Ancyra Blush', 'Kadeh Ancyra Blush'], ['Angora Beyaz', 'Kadeh Angora Beyaz'], ['Angora Kırmızı', 'Kadeh Angora Kırmızı'],
        ['Angora Roze', 'Kadeh Angora Roze'], ['Ancyra Boğazkere', 'Kadeh Boğazkere'],
        ['Ancyra Kalecik Karası', 'Kadeh Kalecik Karası'], ['Lal', 'Kadeh Lal'], ['Ancyra Merlot', 'Kadeh Merlot'],
        ['Ancyra Narince', 'Kadeh Narince'], ['Ancyra Öküzgözü', 'Kadeh Öküzgözü'], ['Santa Helena S. Blanc', 'Kadeh Santa Helena'],
      ]) },
      { n: 'Şampanyalar', c: ['kopuklu'], u: TO('kopuklu', [
        ['Altın Köpük', 'Altınköpük'], ['Cinzano Prosecco', 'Cinzano Prosecco'], ['Mumm Cordon Rouge', 'Gorgon Rouge'],
        ['Henkel Trocken', 'Henkell Trocken'], ['İnci Damlası', 'İnci Damlası'], ['Martini Brüt', 'Martini Brüt'],
        ['Moet Chandon', 'Moet Chandon'],
      ]) },
    ] },
    { n: 'Malt Viskiler', alt: [] },
    { n: 'Viskiler', c: ['viski'], alt: [] },
    { n: 'Rom-Tequila', c: ['rom', 'tekila'], alt: [] },
    { n: 'Cin-Vb.', c: ['cin', 'votka', 'shot', 'shotset', 'sise'], alt: [
      { n: 'Ekler ve İlaveler', c: ['ekler', 'sos'], u: EKLER.concat([
        ['Acılı Buffalo Sos', 'Z. Acılı Buffalo Sos'], ['Avokado Sos', 'Z. Avokado Sos'], ['Cheddar Sos', 'Z. Cheddar Sos'],
        ['Çikolata Sos', 'Z. Çikolata'], ['Garlic Sos', 'Z. Garlik Sos'], ['Kokteyl Sos', 'Z. Kokteyl Sos'],
        ['Salsa Sos', 'Z. Salsa Sos'], ['Sour Cream Sos', 'Z. Sour Cream Sos'], ['Sweet Chili Sos', 'Z. Sweet Chili Sos'],
        ['Tartar Sos', 'Z. Tartar Sos'], ['Joker Sos (1 adet)', 'Z.. Sos 1 Joker'],
      ]) },
      { n: 'Promosyonlar İçki', c: ['promosise', 'promo51'], u: TO('promosise', PRO).concat(TO('promo51', P51), [
        ['mesrubat>Red Bull Twist', 'Redbull Twist'], ['mesrubat>Stay Classic', 'Stay Classic'],
      ]) },
    ] },
  ] };
})();
