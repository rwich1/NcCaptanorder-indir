// Ürün içerikleri: sadece malzemeler (menüden) ve kalori. Anahtar: menu.js'teki ürün adı.
// Telefonda ⋮ → İçindekiler sayfasından yapılan değişiklikler bunun üzerine yazılır (telefonda saklanır).
(function () {
  const X = (t, kc) => ({ t: t || '', kc: kc ? String(kc) : '' });
  const cap = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const EKMEK = 'Susamlı hamburger ekmeği, 160gr burger köftesi';
  const BSON = 'göbek marul, burger sos, parmak patates, dip sos, hardallı lahana salatası';
  const NACHOS = 'mısır cipsi, sotelenmiş soğan, meksika fasulyesi, jalapeno, cheddar, taze maydanoz, avokado sos, salsa sos, sour cream sos';
  const TACO = 'meksika fasulyesi, jalapeno, taze maydanoz, küp domates, kırmızı soğan, cheddar, sour cream sos';
  const KASE = 'havuç, kabak, brokoli, pancar turşusu, nohut, pirinç makarnası, ızgara kuşkonmaz, meksika fasulyesi, karışık yeşillik, limon sos, pesto, tahinli yoğurt sos';
  const SOTE = 'soğan, mantar, domates sos, kaşar';
  const YAN = 'hardallı lahana salatası, anne usulü patates';
  const TURSU = 'jalapeno, kornişon, cin biber turşusu';
  const SALATA_SOS = 'pesto, zeytinyağı-limon sos';

  window.ICERIK = {
    // ---- Çorbalar
    'Günün Çorbası': X('Günün çorbası — mutfağa sorunuz'),
    'Günün Çorbası (Yarım)': X('Günün çorbası — mutfağa sorunuz'),
    'Minestrone Çorbası': X('', '450-480'),
    'Minestrone Çorbası (Yarım)': X('', '450-480'),
    // ---- Başlangıçlar
    'Mozzarella Caprese': X('Suda mozzarella, domates, pesto sos, kapari, karışık yeşillik', 750),
    'Kızarmış Hellim Tabağı': X('Kızarmış hellim, pesto, balzamik sirke, hardallı lahana salatası, marine domates, kapari, karışık yeşillik', 450),
    'Ezine Peynir Tabağı': X('Ezine peyniri, ceviz, kuru kayısı, kuru incir, yeşil elma, roka, karışık yeşillik', 700),
    'Peynir Tabağı': X('Keçi peyniri, rokfor, kuru domatesli sepet peyniri, çörek otlu sepet peyniri, kimyonlu isli peynir, ceviz, kuru kayısı, kuru incir, yeşil elma, karışık yeşillik', 1000),
    // ---- Salatalar
    'Sezar Salata': X('150gr ızgara tavuk, göbek marul, kiraz domates, sarımsaklı kruton, parmesan, sezar sos', 800),
    'Kızarmış Hellim Peynirli Salata': X('Kızarmış hellim, karışık yeşillik, kiraz domates, salatalık, taze nane, ' + SALATA_SOS, 800),
    'Çıtır Levrek Salata': X('150gr çıtır levrek, roka, kırmızı soğan, salatalık turşusu, kiraz domates, taze nane, tartar sos', 1100),
    'Çıtır Tavuklu Salata': X('120gr panelenmiş tavukgöğsü, göbek marul, kiraz domates, salatalık, dilim zeytin, taze nane, ' + SALATA_SOS + ', tahinli yoğurt sos', 1200),
    'Ilık Peynirli Salata': X('Kızarmış beyaz peynir, göbek marul, dereotu, kiraz domates, salatalık, taze nane, ' + SALATA_SOS, 800),
    'Ankara Salata': X('Panelenmiş keçi peyniri topları, roka, kiraz domates, salatalık, közlenmiş kapya biber, bruschetta, ceviz, taze nane, ' + SALATA_SOS + ', nar ekşisi', 800),
    'Izgara Etli Salata': X('180gr ızgara dana bonfile, taze nane, karışık yeşillik, kiraz domates, salatalık, mısır, dilim zeytin, ' + SALATA_SOS, 800),
    'Asya Esintili Salata': X('150gr tavukgöğsü, renkli biber, sarımsak, susam, maydanoz, BBQ sos, teriyaki sos, karışık yeşillik, kiraz domates, salatalık, mısır, taze nane, ' + SALATA_SOS, 400),
    'Ilık Tavuklu Bademli Salata': X('210gr tavukgöğsü, soya sos, badem, taze nane, karışık yeşillik, kiraz domates, salatalık, mısır, ' + SALATA_SOS, 1000),
    'Tavuklu Diyet Salata': X('210gr buharda tavukgöğsü, karışık yeşillik, kiraz domates, salatalık, mısır, dilim zeytin, ' + SALATA_SOS, 500),
    'Acılı Izgara Tavuk Salata': X('150gr tavukgöğsü, buffalo sos, karışık yeşillik, mısır, meksika fasulyesi, jalapeno, kiraz domates, salatalık, taze nane, ' + SALATA_SOS, 500),
    // ---- Ara sıcaklar
    'Sıcak Sepeti': X('Sigara böreği, mozzarella sticks, sosis, soğan halkası, anne usulü patates, dip sos', 1200),
    'Sigara Böreği': X('Sigara böreği, karışık yeşillik, dip sos', 1000),
    'Paçanga Böreği': X('Paçanga böreği, karışık yeşillik, dip sos', 1000),
    'Halka Kalamar': X('Panelenmiş kalamar, kiraz domates, roka, kırmızı soğan, limon, tartar sos', 750),
    'Çıtır Levrek': X('150gr panelenmiş levrek, parmak patates, kiraz domates, roka, limon, tartar sos', 1000),
    'Çıtır Tavuk': X('350gr çıtır tavuk', 750),
    'Glütensiz Çıtır Tavuk': X('180gr mısır cipsi ile panelenmiş tavuk, haşlanmış sebze, tahinli sos', 800),
    'BBQ Soslu Çıtır Tavuk': X('350gr çıtır tavuk, BBQ sos', 1200),
    'Acılı Buffalo Soslu Tavuk': X('350gr tavuk, acılı buffalo sos', 1200),
    'Cajun Baharatlı Çıtır Tavuk': X('350gr çıtır tavuk, cajun baharatı', 1050),
    'Çıtır Tavuk Sepeti': X('200gr panelenmiş tavuk, tavuk nugget, anne usulü patates, dip sos', 1350),
    'Fish and Chips': X('160gr panelenmiş mezgit fileto, anne usulü patates, kiraz domates, roka, limon, tartar sos', 990),
    // ---- Patatesler
    'Anne Usulü Patates': X('Anne usulü patates, baharat (isteğe bağlı)', 750),
    'Parmak Patates': X('Parmak patates, baharat (isteğe bağlı)', 750),
    'Gurme Patates': X('Kaşık patates, trüf aromalı yağ, baharat, toz parmesan, taze maydanoz, dip sos', 800),
    'Peynirli Baharatlı Patates Tava': X('Parmak patates, özel baharat, rende beyaz peynir, taze maydanoz', 900),
    'Cheddar Soslu & Hellim Peynirli Patates Tava': X('Patates, cheddar sos, ızgara hellim, taze maydanoz', 950),
    // ---- Ortaya karışık
    'Gurme Tavuklar': X('200gr BBQ soslu tavuk, 200gr çıtır tavuk, 200gr cajun baharatlı tavuk, 200gr acılı buffalo soslu tavuk, churros patates', 2850),
    'Gökkuşağı': X('Soğan halkası, sosis, mozzarella sticks, paçanga böreği, sigara böreği, 200gr çıtır tavuk, tavuk nugget, churros patates, dip sos', 2950),
    'Sohbet Arası': X('4 mini burger, churros patates, 200gr çıtır tavuk, panelenmiş keçi peyniri topları, soğan halkası, sosis, tavuk nugget, dip sos', 2450),
    // ---- Nachos
    'Nacho Chips': X('Mısır cipsi, cheddar sos, avokado sos, salsa sos', 600),
    'Nachos de Cheese': X(cap(NACHOS), 850),
    'Nachos de Mince': X('Kıyma, ' + NACHOS, 1450),
    'Nachos de Beef': X('Dana eti, ' + NACHOS, 1500),
    // ---- Soft taco
    'Tavuklu Taco': X('Tavuk, ' + TACO, 700),
    'Kıymalı Taco': X('Kıyma, ' + TACO, 750),
    'Etli Taco': X('Et, ' + TACO, 750),
    // ---- Quesadilla
    'Tavuklu Quesadilla': X('200gr tavuk, ' + SOTE + ', ' + YAN, 1000),
    'Etli Quesadilla': X('180gr dana eti, ' + SOTE + ', ' + YAN, 1100),
    // ---- Burgerler
    'Burger': X(EKMEK + ', turşu, domates, ' + BSON, 1300),
    'Cheeseburger': X(EKMEK + ', cheddar sos, turşu, domates, ' + BSON, 1400),
    'Mantarlı ve Kıtır Soğanlı Burger': X(EKMEK + ', mantar, kıtır soğan, cheddar sos, turşu, domates, ' + BSON, 1550),
    'Hot Chili Burger': X(EKMEK + ', chili sos, turşu, domates, ' + BSON, 1400),
    'Gurme Burger': X(EKMEK + ', cheddar sos, dana bacon, şefin özel sosu, domates, turşu, ' + BSON, 1550),
    'Tavuk Burger': X('Susamlı hamburger ekmeği, 200gr panelenmiş tavuk, kıtır soğan, turşu, domates, ' + BSON, 1250),
    'Trüf Soslu Mantarlı Burger': X(EKMEK + ', trüf sos, mantar, turşu, domates, ' + BSON, 1700),
    'Trio Burger': X('Susamlı roll ekmeği, mini 50gr burger, mini 50gr cheeseburger, mini 50gr kıtır soğanlı burger, domates, turşu, ' + BSON, 1300),
    'Islak Burger': X('Susamlı roll ekmeği, 3 adet mini 50gr burger, iskender sos, parmak patates, dip sos, hardallı lahana salatası', 1000),
    'Texas Burger': X(EKMEK + ', turşu, domates, göbek marul, burger sos, jalapeno, meksika fasulyesi, salsa sos, cheddar sos, nacho cips, soğan halkası, parmak patates, dip sos, hardallı lahana salatası', 1650),
    'Vegan Burger': X('Susamlı hamburger ekmeği, falafel köftesi, göbek marul, domates, salatalık, kıtır soğan, avokado sos, parmak patates', 1000),
    // ---- Pizzalar
    'Margherita Pizza': X('Mozzarella, pizza sos, pesto sos, domates, taze fesleğen', 900),
    'İstiridye Mantarlı Pizza': X('Mozzarella, pizza sos, istiridye mantar, taze fesleğen', 950),
    'Alfredo Soslu Tavuk Pizza': X('Mozzarella, alfredo sos, tavukgöğsü, mantar, taze fesleğen', 1400),
    'Calzone': X('Mozzarella, pizza sos, beyaz peynir, parmesan, maydanoz, çörekotu, kiraz domates, karışık yeşillik, limon', 950),
    'Kıtır Tavuk Pizza': X('Mozzarella, pizza sos, kıtır tavuk, jalapeno, acı sos, roka', 1900),
    'Vejetaryen Pizza': X('Mozzarella, pizza sos, mantar, kabak, havuç, mısır, brokoli, renkli biber, taze fesleğen', 1000),
    'Ispanaklı Lor Peynirli Pizza': X('Mozzarella, pizza sos, ıspanak, lor peyniri, çörekotu', 1000),
    'Formaggi Pizza': X('Mozzarella, krema sos, rokfor, keçi peyniri, parmesan, roka', 950),
    'A la Turca': X('Mozzarella, pizza sos, sucuk, sosis, salam, istiridye mantar, mısır, dilim zeytin, renkli biber, kekik, taze fesleğen', 1350),
    'Robes Pierre': X('Mozzarella, pizza sos, dana bonfile, kiraz domates, roka', 1100),
    // ---- Makarnalar
    "Penne All'arrabbiata": X('Penne, acılı domates sos, parmesan, fesleğen', 1000),
    'Çıtır Tavuklu Penne': X('Penne, paneli tavuk, dilim zeytin, parmesan, kremalı sos, fesleğen', 2200),
    'Spagetti Napoliten': X('Spagetti, domates sos, parmesan, fesleğen', 900),
    'Spagetti Bolonez': X('Spagetti, dana kıyma, domates sos, parmesan, fesleğen', 1100),
    'Mac & Cheese': X('Pipette makarna, krema, kaşar, cheddar sos, kiraz domates, fesleğen', 1400),
    'Çıtır Tavuklu Mac & Cheese': X('Pipette makarna, paneli tavuk, krema, kaşar, cheddar sos, kiraz domates, fesleğen', 1800),
    'Patlıcanlı Ravioli': X('Patlıcan dolgulu ravioli, kiraz domates, kremalı sos, parmesan, fesleğen', 900),
    'Sinop Mantısı': X('Sinop mantısı, tereyağı, ceviz, yoğurt', 1400),
    'Fettuccine Alfredo': X('Fettuccine, mantar, tavukgöğsü, kremalı sos, parmesan, fesleğen', 1450),
    'Glütensiz Pirinç Makarna': X('Pirinç makarnası, domates sos, havuç, brokoli, karnabahar, parmesan, fesleğen', 700),
    // ---- Et yemekleri
    'Izgara Köfte': X('250gr ızgara köfte, pirinç pilavı, ızgara domates, ızgara biber, parmak patates', 720),
    'Bonfile Fileminyon': X('220gr dana bonfile, haşlanmış sebze, buğday risotto, fileminyon sos', 920),
    'Kekikli Dana Külbastı': X('220gr dana bonfile, kekik, haşlanmış sebze, buğday risotto', 880),
    'Café De Paris Soslu Bonfile': X('220gr ızgara dana bonfile, Café de Paris sos, anne usulü patates', 1100),
    'Izgara Antrikot': X('250gr dana antrikot, haşlanmış sebze, buğday risotto', 1000),
    'Pepper Steak': X('220gr ızgara dana bonfile, haşlanmış sebze, buğday risotto, özel sos', 1050),
    // ---- Tavuk yemekleri
    'Buharda Tavukgöğsü': X('210gr buharda tavuk, haşlanmış sebze, pesto sos', 380),
    'Tavuk Şinitzel': X('210gr panelenmiş tavukgöğsü, fileminyon sos, limon, churros patates', 800),
    'Cornflakes Şinitzel': X('210gr mısır gevreği ile panelenmiş tavukgöğsü, fileminyon sos, limon, churros patates', 850),
    'Bademli Fesleğenli Tavuk': X('210gr ızgara tavuk, haşlanmış sebze, buğday risotto, bademli fesleğenli sos', 900),
    'Kekikli Tavuk Külbastı': X('210gr ızgara tavuk, haşlanmış sebze, buğday risotto', 800),
    'Izgara Tavuk Şiş': X('250gr tavuk şiş, lavaş, ızgara domates, ızgara biber, parmak patates', 650),
    'Tavuk Kulesi': X('210gr ızgara tavuk, kremalı ıspanak, mantar, kaşar, jü sos', 700),
    // ---- Denizden
    'Somon Izgara': X('220gr marine somon, kremalı ıspanak, roka, kırmızı soğan, kapari, ızgara kuşkonmaz, kiraz domates, limon, supreme sos', 750),
    // ---- Uzakdoğu
    'Asya Usulü Tavuk': X('210gr tavukgöğsü, renkli biber, sarımsak, susam, maydanoz, BBQ sos, teriyaki sos, köri soslu kremalı penne, parmak patates', 900),
    'Köri Soslu Tavuk': X('210gr tavuk, mantar, soğan, sarımsak, kremalı köri sos, kiraz domates, pirinç pilavı, parmak patates', 900),
    'Teriyaki Soslu Tavuk': X('250gr tavuk but, renkli biber, maydanoz, teriyaki sos, kremalı köri soslu penne, parmak patates', 1000),
    'Kore Usulü Kızarmış Tavuk': X('200gr panelenmiş tavuk but, soya soslu sebzeli pirinç makarnası, asia prime sos', 950),
    'Çıtır Tavuklu Noodle': X('Noodle, panelenmiş tavuk, brokoli, karnabahar, havuç, kıtır soğan, soya sos', 800),
    'Köri Tavuklu Noodle': X('Noodle, tavukgöğsü, mantar, kıtır soğan, köri, pesto soslu krema', 900),
    'Sebzeli Noodle': X('Noodle, brokoli, karnabahar, havuç, kıtır soğan, soya sos', 550),
    // ---- Dürümler
    'Izgara Tavuklu Dürüm': X('200gr tavuk, ' + SOTE + ', ' + YAN, 1000),
    'Acılı Çıtır Tavuklu Dürüm': X('200gr çıtır tavuk, jalapeno, kaşar, acı sos, mayonez, ' + YAN, 1200),
    'Izgara Etli Dürüm': X('180gr dana eti, ' + SOTE + ', ' + YAN, 1100),
    // ---- Krepler
    'Tavuklu Krep': X('200gr tavuk, ' + SOTE + ', beşamel sos, ' + YAN, 1100),
    'Etli Krep': X('180gr dana eti, ' + SOTE + ', beşamel sos, ' + YAN, 1200),
    'Ispanaklı Lor Peynirli Krep': X('Ispanak, lor peyniri, soğan, kaşar, beşamel sos, ' + YAN, 800),
    // ---- Sokak lezzetleri
    'Bagette Kokoreç': X('Baget ekmek, 160gr kokoreç, ' + TURSU, 750),
    'Bagette Sebzeli Kokoreç': X('Baget ekmek, 160gr kokoreç, kırmızı soğan, domates, maydanoz, ' + TURSU, 750),
    'Bagette Levrek': X('Baget ekmek, 135gr mısır unlu levrek, roka, havuç, sumaklı soğan, domates, ' + TURSU, 450),
    'Bagette Köfte': X('Baget ekmek, 250gr ızgara köfte, sumaklı soğan, domates, ' + TURSU + ', iskender sos', 850),
    'Bagette Tavuk Şiş': X('Baget ekmek, 200gr tavuk but, sumaklı soğan, domates, ' + TURSU + ', iskender sos', 700),
    'Tavuk-Pilav': X('Nohutlu pilav, tavuk, cin biber turşusu', 710),
    // ---- Sağlıklı kaseler
    'Çıtır Tavuklu Kase': X('150gr çıtır tavuk, ' + KASE, 1000),
    'Köfteli Kase': X('150gr ızgara köfte, ' + KASE, 900),
    'Çıtır Levrek Kase': X('150gr çıtır levrek, ' + KASE, 900),
    'Somonlu Kase': X('150gr ızgara somon, ' + KASE, 850),
    'Dana Etli Kase': X('180gr dana eti, ' + KASE, 800),
    // ---- Tatlılar
    'Ilık Çikolatalı Kek': X('Çikolatalı kek, vanilyalı dondurma, vanilya sos', 700),
    'San Sebastian': X('San Sebastian cheesecake, çikolata sos', 600),
    'Profiterol': X('Profiterol, çikolata sos, vanilyalı dondurma', 750),
    'Orman Meyveli Beyaz Çikolatalı Profiterol': X('Profiterol, beyaz çikolata, orman meyvesi, frambuaz sos, vanilyalı dondurma', 700),
    'Tiramisu': X('Tiramisu, frambuaz sos', 750),
    'Cheesecake': X('Cheesecake, limon / frambuaz / çikolata sos', 450),
    'Diyabetik Cheesecake': X('Diyabetik cheesecake, frambuaz sos', 220),
    'Kahveli Creme Brulee': X('', 350),
    'Churros (Tatlı)': X('Churros, vanilya sos, çikolata sos', 1000),

    // ======== KOKTEYLLER ========
    // Signature 1
    'Reyhan Gin Sour': X('Malfy Gin, Aperol, Reyhan, Lime'),
    'Red Hand': X('Orman meyveli Jameson Whisky, Safari'),
    'Gold Irish': X('Jameson Whisky, Safari, Mango sos'),
    'Baileys Espresso Martini': X('Baileys, Kahlua, Amaretto, Chocolate'),
    'Exotic Lady': X('Pasoa, Gin, Pineapple, Cordial'),
    'Gin Fresh': X('Pink Beefeater Gin, Aperol, Safari, Cranberry, Grapefruit'),
    'Chilli Pasion': X('Chili biberli Havana Club Rum, Pasion, Orange'),
    'Pixie': X('Beefeater Pink Gin, Melon, Strawberry, Basil, Pasion'),
    'Kuzukulağı Gin Sour': X('Malfy Gin, Limoncello, Kuzu Kulağı, Bitter Mix, Sweet Mix'),
    'Moonlight': X('Beefeater Pink Gin, Aperol, Vanilla Likör, Mango sos'),
    'Peach Heredot': X('Malfy Gin, Skinos, Arches, Peach Cream'),
    // Signature 2
    'Pink Spritz': X('Beefeater Pink Gin, Şampanya, Aperol'),
    'Kuzu Kulağı Apple Sour': X('Absolut Votka, Sour Apple Likör, Kuzu Kulağı'),
    'La Perla': X('Mangolu Havana Club Rum, Aperol, Melon Likör, Satsuma'),
    'Mr. Boss': X('Tarçınlı Whisky, Citrus Blend, Aperol'),
    'Siesta': X('Çilekli Olmeca Tequila, St Germain, Campari'),
    'Del Corno': X('Bumbu Rum, Vanilla Likör, Aperol, Peach Cream'),
    'Elixir': X('Beefeater Pink Gin, Aperol, Satsuma, Berry, Peach Cream'),
    'Chili Berry': X('Orman meyveli Jameson Whisky, Chili Pepper, Tarçın, Likör'),
    'Whisper': X('Orman meyveli Beefeater Gin, Pasoa, Lychee, Satsuma'),
    'Smoke Honey Sour': X('Smoke Whisky, Honey Likör, Citrus Blend, Honey sos'),
    'Cosmo Magic': X('Absolut Raspberry Vodka, Malibu, Cranberry, Coconut Cream'),
    'Red': X('Absolut Raspberry Vodka, Cranberry, Aperol, Peach Liqueur, Sweet & Sour Mix'),
    'XL Negroni': X('Malfy Gin, Aperol, Rosso, Limoncello, Campari, Citrus'),
    'Texas Tea': X('Havana Club Rum, Beefeater Gin, Olmeca Tequila, Cointreau, Absolut Vodka, Tennessee Whiskey'),
    'Berry Club': X("J.P. Wiser's Bourbon Whisky, Jagermeister, Ginger Berry"),
    // International (uluslararası standart IBA ölçüleri)
    'Long Island Ice Tea': X('Havana Club Rum 1,5 cl, Beefeater Gin 1,5 cl, Orange Liqueur 1,5 cl, Olmeca Tequila 1,5 cl, Absolut Vodka 1,5 cl, limon suyu 2,5 cl, şeker şurubu 3 cl, kola'),
    'Lynchburg Lemonade': X('Tennessee Whiskey 3 cl, Orange Liqueur 3 cl, Sweet & Sour Mix 3 cl, Sprite'),
    'Aperol Spritz': X('Aperol 6 cl, Prosecco 9 cl, maden suyu'),
    'Black Jack': X('Tennessee Whisky, Cointreau, Sweet Sour Mix'),
    'Old Fashioned': X("J.P. Wiser's Bourbon Whisky 4,5 cl, Angostura Bitter, 1 küp şeker, portakal kabuğu"),
    'Whisky Sour': X("J.P. Wiser's Bourbon Whisky 4,5 cl, lime suyu 2,5 cl, sour mix 2 cl"),
    'Cosmopolitan': X('Absolut Vodka 4 cl, Cointreau 1,5 cl, lime suyu 1,5 cl, cranberry suyu 3 cl'),
    'Pina Colada': X('Ananaslı Havana Club Rum 5 cl, Malibu, hindistan cevizi kreması 3 cl'),
    'Negroni': X('Campari 3 cl, Malfy Gin 3 cl, Garrone Rosso Vermut 3 cl'),
    'Espresso Martini': X('Absolut Vodka 5 cl, Kahlua 3 cl, 1 shot espresso'),
    'Mojito': X('Havana Club Rum 4,5 cl, lime suyu 2 cl, 2 çay kaşığı şeker, taze nane, soda'),
    'Apple Mojito': X('Havana Club Rum, Sour Apple, Lime'),
    'Mango Mojito': X('Mangolu Havana Club Rum, Mango sos, Lime, Nane'),
    'Cool Lime Mojito': X('Havana Club Rum, Cool Lime, Cordial, Nane'),
    'Strawberry Coconut Mojito': X('Havana Club Rum, Malibu, Strawberry Liqueur, Coconut Milk'),
    // Tequila specials
    'Margarita Classic': X('Olmeca Blanco Tequila 5 cl, triple sec 2 cl, lime suyu 1,5 cl'),
    'Margarita Lime': X('Olmeca Blanco Tequila 5 cl, triple sec 2 cl, lime suyu 1,5 cl'),
    'Blue Margarita': X('Olmeca Blanco Tequila, Blue Curaçao Liqueur, Fresh Lime'),
    'Chili Pasion Margarita': X('Olmeca Blanco Tequila, Cointreau, Passion Fruit, Chilli Pepper'),
    'Strawberry Margarita': X('Olmeca Blanco Tequila, Cointreau, Strawberry, Fresh Lime'),
    'Satsuma Margarita': X('Olmeca Blanco Tequila, Likör, Satsuma'),
    'Mango Margarita': X('Olmeca Blanco Tequila, Limoncello, Mango'),
    // Gin tonic
    'Basil Gin Tonic': X('Malfy Gin, Tonic, Fesleğen sos'),
    'Cool Lime Gin Tonic': X('Malfy Gin, Menta Cubana sos, Fresh Lime, Tonic'),
    'Satsuma Gin Tonic': X('Malfy Gin, Tonic, Satsuma Fresh, Satsuma sos'),
    'Satsuma Berry Gin Tonic': X('Orman meyveli Malfy Gin, Satsuma, Berry sos'),
    'Ginger Berry Gin Tonic': X('Malfy Gin, Ginger, Berry sos'),
    'Berry Gin Tonic': X('Orman meyveli Malfy Gin, Lime sos'),
    // Sangria
    'Classic Sangria': X('Red Wine, Peach Liqueur, Cranberry, Fresh Fruit'),
    'White Sangria': X('White Wine, Cardinal Melon, Pineapple, Fresh Fruit'),
    'Rose Sangria': X('Rose Wine, Malibu, Cranberry, Fresh Fruit'),
    'Blush Sangria': X('Blush Wine, Aperol, Passion Fresh Grapefruit, Fruit'),
    // Diğer
    'Stay Classic': X('Red Bull Energy Drink, Votka'),
    'Red Bull Twist': X('Red Bull White / Blue Edition, limon suyu, buz, soda'),
  };
})();
