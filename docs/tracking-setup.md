# Проследяване и реклами: регистрация стъпка по стъпка

Ръководство за PlantyHub (plantyhub.com). Всички услуги са **безплатни**. Плаща се само бюджетът за реклами, ако решиш да пускаш.

> Менютата на Google и Meta се местят от време на време. Ако някой бутон е с малко по-различно име, търси най-близкото по смисъл. Ако не го намираш, прати screenshot.

---

## Съдържание

0. [Преди да започнеш](#0-преди-да-започнеш)
1. [Google Analytics 4](#1-google-analytics-4)
2. [Google Tag Manager](#2-google-tag-manager)
3. [Настройка на таговете в GTM](#3-настройка-на-таговете-в-gtm)
4. [Meta Pixel (Facebook и Instagram)](#4-meta-pixel-facebook-и-instagram)
5. [Microsoft Clarity](#5-microsoft-clarity)
6. [Google Search Console](#6-google-search-console)
7. [Въвеждане на ID-тата и деплой](#7-въвеждане-на-id-тата-и-деплой)
8. [Тестване](#8-тестване)
9. [Публикуване в GTM](#9-публикуване-в-gtm)
10. [След първите покупки](#10-след-първите-покупки)
11. [Google Ads (когато решиш да пускаш реклами)](#11-google-ads-когато-решиш-да-пускаш-реклами)
12. [Google Merchant Center (по желание)](#12-google-merchant-center-по-желание)
13. [Чеклист](#13-чеклист)

---

## 0. Преди да започнеш

Трябват ти:

| Какво | Защо | Бележка |
|---|---|---|
| **Google акаунт** | GA4, GTM, Search Console, Google Ads, Merchant Center | Използвай един и същ акаунт навсякъде. Най-добре е фирмен (напр. `marketing@plantyhub.com` или Gmail само за бизнеса), а не личният ти. |
| **Личен Facebook профил** | Meta изисква личен профил, за да създадеш бизнес акаунт | Профилът не се показва публично в рекламите. |
| **Достъп до DNS на plantyhub.com** | За потвърждаване на домейна в Google и Meta | Там, където си добавил `media.plantyhub.com` (вероятно Cloudflare). |
| **Microsoft или Google акаунт** | За Clarity | Може и същият Google акаунт. |

Отвори си бележка и записвай ID-тата, докато минаваш стъпките:

```
GA4 Measurement ID:   G-__________
GTM Container ID:     GTM-_______
Meta Pixel ID:        ________________
Clarity Project ID:   __________
```

---

## 1. Google Analytics 4

**Какво е:** мястото, където виждаш колко хора влизат, откъде идват и какво купуват.

### 1.1. Създаване на акаунт и property

1. Отвори **https://analytics.google.com** и влез с бизнес Google акаунта.
2. Натисни **Start measuring**. Ако вече имаш акаунт: долу вляво **Admin** (зъбчатото колело) → **Create** → **Account**.
3. **Account name:** `PlantyHub` → остави отметките за споделяне на данни както са → **Next**.
4. **Property name:** `plantyhub.com`
   - **Reporting time zone:** `Bulgaria`
   - **Currency:** `Euro (€)`
   - → **Next**
5. **Business details:**
   - Industry category: `Home & Garden`
   - Business size: `Small`
   - → **Next**
6. **Business objectives:** отметни **Drive online sales** (може и **Understand web and/or app traffic**) → **Create**.
7. Приеми условията (**Terms of Service**). Избери държава **Bulgaria** и отметни GDPR условията (Data Processing Terms).

### 1.2. Data stream (връзката със сайта)

1. На въпроса **Choose a platform** избери **Web**.
2. **Website URL:** `https` → `plantyhub.com`
3. **Stream name:** `PlantyHub Web`
4. **Enhanced measurement** трябва да е **включено** (синьо).
5. Натисни зъбчатото колело до Enhanced measurement и провери, че е включено **Page changes based on browser history events**. Така GA4 хваща смяната на страници в сайта. Сайтът е React и не презарежда страниците.
6. **Create stream** (или **Create & continue**).
7. Ще излезе прозорец с инструкции за инсталиране. **Не копирай кода.** Затвори прозореца.
8. Горе вдясно в **Stream details** има **Measurement ID** във вида `G-XXXXXXXXXX`. **Запиши го.**

> GA4 ID-то **не** отива в `.env.production`. То се въвежда само в GTM (стъпка 3). Иначе всичко ще се брои два пъти.

### 1.3. Важни настройки (Admin)

1. **Admin → Data collection and modification → Data retention**
   - **Event data retention:** смени от `2 months` на **`14 months`** → **Save**.
   - По подразбиране Google пази подробните данни само 2 месеца.
2. **Admin → Data collection and modification → Data collection**
   - **Google signals data collection:** включи го (**Get started → Continue → Activate**).
   - Нужно е за ремаркетинг и демографски данни по-късно.
3. **Admin → Data display → Data filters** (по желание)
   - Тук може да изключиш собствените си посещения. Засега не е нужно.

---

## 2. Google Tag Manager

**Какво е:** кутия, в която държиш скриптовете за проследяване. На сайта стои само GTM, а той зарежда GA4, Google Ads и други.

1. Отвори **https://tagmanager.google.com** със същия Google акаунт.
2. **Create Account**.
3. **Account Setup:**
   - Account Name: `PlantyHub`
   - Country: `Bulgaria`
   - Отметката за споделяне на данни е по избор.
4. **Container Setup:**
   - Container name: `plantyhub.com`
   - Target platform: **Web**
5. **Create** → приеми условията (**Yes**). Отметни и GDPR Data Processing Terms, ако те пита.
6. Ще излезе прозорец **Install Google Tag Manager** с код. **Не го копирай.** Сайтът вече зарежда GTM сам, след като клиентът приеме бисквитките. Затвори прозореца.
7. Горе на екрана, до името на контейнера, има ID във вида **`GTM-XXXXXXX`**. **Запиши го.**

---

## 3. Настройка на таговете в GTM

Работиш в **Workspace** на контейнера `plantyhub.com`. Ще направиш **2 тага и 1 тригер**.

### 3.1. Таг „GA4 – Google Tag“ (основната връзка с GA4)

1. Ляво меню → **Tags** → **New**.
2. Горе вляво смени името от `Untitled Tag` на **`GA4 – Google Tag`**.
3. **Tag Configuration** → **Google Tag**.
4. **Tag ID:** твоето `G-XXXXXXXXXX`.
5. **Triggering** → избери **Initialization - All Pages**.
6. **Save**.

### 3.2. Тригер „Ecommerce събития“

Сайтът праща тези събития в GTM: `view_item`, `view_cart`, `add_to_cart`, `begin_checkout` и `purchase`. Тригерът казва на GTM да реагира на тях.

1. Ляво меню → **Triggers** → **New**.
2. Име: **`Ecommerce събития`**.
3. **Trigger Configuration** → **Custom Event**.
4. **Event name:**
   ```
   ^(view_item|view_cart|add_to_cart|begin_checkout|purchase)$
   ```
5. Отметни **Use regex matching**.
6. **This trigger fires on:** **All Custom Events**.
7. **Save**.

### 3.3. Таг „GA4 – Ecommerce“ (праща покупките и количката към GA4)

1. **Tags** → **New**.
2. Име: **`GA4 – Ecommerce`**.
3. **Tag Configuration** → **Google Analytics** → **Google Analytics: GA4 Event**.
4. **Measurement ID:** твоето `G-XXXXXXXXXX`.
5. **Event Name:** натисни иконката с блокчето вдясно от полето → избери **Event**. Полето ще стане `{{Event}}`.
   - Ако **Event** липсва в списъка: **Variables** → **Built-In Variables** → **Configure** → отметни **Event**.
6. Разгъни **More Settings** → **Ecommerce** → отметни **Send Ecommerce data** → **Data source:** **Data Layer**.
7. **Triggering** → избери **`Ecommerce събития`**.
8. **Save**.

### 3.4. Какво **не** трябва да правиш в GTM

- **Не** добавяй Meta Pixel в GTM. Той е вграден в кода на сайта и ще се дублира.
- **Не** добавяй Microsoft Clarity в GTM по същата причина.
- **Не** прави отделен таг за `page_view`. GA4 ги хваща сам (стъпка 1.2, точка 5).
- **Не** натискай още **Submit / Publish**. Първо тестваме (стъпка 8).

---

## 4. Meta Pixel (Facebook и Instagram)

**Какво е:** казва на Facebook и Instagram кой е разгледал и купил, за да оптимизират рекламите.

### 4.1. Бизнес портфолио (Business Manager)

1. Отвори **https://business.facebook.com** и влез с личния си Facebook профил.
2. Ако нямаш бизнес портфолио: **Create a business portfolio** (или **Create account**).
   - Business portfolio name: `PlantyHub`
   - Your name: твоето име
   - Business email: бизнес имейлът (напр. `support@plantyhub.com`)
   - → **Submit** и потвърди имейла от писмото, което ще получиш.
3. По желание свържи Facebook страницата и Instagram профила на PlantyHub: **Settings** (зъбчатото колело) → **Accounts** → **Pages** / **Instagram accounts** → **Add**.

### 4.2. Създаване на Pixel

1. Отвори **https://business.facebook.com/events_manager2** (Events Manager).
2. Ляво зелено **+** → **Connect data** (или **Connect data sources**).
3. Избери **Web** → **Connect**.
4. Име на dataset/pixel: **`PlantyHub Pixel`** → **Create**.
5. Ако пита за адрес на сайта: `https://plantyhub.com` → **Check**.
6. Ако пита как да свържеш: **Meta Pixel only**, после **Install code manually**. **Не копирай кода**, сайтът вече го има. Затвори прозореца.
7. В Events Manager избери пиксела. Под името му има **Dataset ID** или **Pixel ID**, само цифри (около 15–16). **Запиши го.**

### 4.3. Задължителни настройки на Pixel-а

Events Manager → избери `PlantyHub Pixel` → таб **Settings**:

1. **Automatic advanced matching:** **ИЗКЛЮЧИ го.**
   - Иначе Meta сам събира имейла и телефона от формата за поръчка. В политиката за поверителност пише, че не ги изпращаме.
2. **Track events automatically without code** (Automatic events / Automatic configuration): **изключи го.**
   - Сайтът сам праща правилните събития. Това само добавя шум.
3. **Cookie settings → First-party cookies:** остави **включено**.

### 4.4. Потвърждаване на домейна

Нужно е, за да оптимизираш реклами по покупки.

1. **https://business.facebook.com/settings** → **Brand safety and suitability** → **Domains** → **Add** → `plantyhub.com` → **Add domain**.
2. Избери метод **DNS TXT record**. Meta ще покаже стойност като `facebook-domain-verification=xxxxxxxx`.
3. В DNS панела (Cloudflare → `plantyhub.com` → **DNS** → **Records** → **Add record**):
   - Type: **TXT**
   - Name: **@**
   - Content: стойността от Meta
   - → **Save**
4. Върни се в Meta → **Verify domain**. Ако не стане веднага, пробвай пак след 10–30 минути.
5. След потвърждението: в същия екран **Connected assets** → **Add assets** → свържи `PlantyHub Pixel` с домейна.

### 4.5. Разширение за браузъра (за тест)

Инсталирай **Meta Pixel Helper** от Chrome Web Store. Ще ти показва какво праща Pixel-ът на всяка страница.

---

## 5. Microsoft Clarity

**Какво е:** записва как хората се движат по сайта, като видео, и показва къде кликат. Безплатно, без лимит.

1. Отвори **https://clarity.microsoft.com** → **Sign up / Sign in** (с Google или Microsoft акаунт).
2. **New project** (или **Add new project**):
   - Name: `PlantyHub`
   - Website URL: `https://plantyhub.com`
   - Site category: `E-commerce` (или най-близкото)
   - → **Add new project**
3. Ще пита как да инсталираш: **Install manually**. **Не копирай кода.**
4. **Settings** → **Overview** → **Project ID** (около 10 букви и цифри). **Запиши го.**
5. **Settings → Masking:** провери, че е **Balanced** или **Strict**, **не** `Relaxed`. Така в записите не се виждат имейли, телефони и адреси.
6. По желание: **Settings → Setup → Google Analytics integration** → свържи с GA4 property-то.

---

## 6. Google Search Console

**Какво е:** показва по какви думи те намират в Google и дали Google вижда страниците. Не е свързано с бисквитките и не изисква код.

1. Отвори **https://search.google.com/search-console** със същия Google акаунт.
2. **Add property** → избери лявата опция **Domain** → `plantyhub.com` → **Continue**.
3. Ще получиш TXT запис: `google-site-verification=xxxxxxxx`.
4. В DNS панела (Cloudflare → **DNS** → **Records** → **Add record**):
   - Type: **TXT**
   - Name: **@**
   - Content: стойността от Google
   - → **Save**
5. Върни се в Search Console → **Verify**. Ако не стане, пробвай пак след 10–30 минути.
6. Ляво меню → **Sitemaps** → въведи `sitemap.xml` → **Submit**.
   - Сайтът вече има sitemap на `https://plantyhub.com/sitemap.xml`.
7. По желание свържи Search Console с GA4: **GA4 → Admin → Product links → Search Console links → Link**.

---

## 7. Въвеждане на ID-тата и деплой

1. Отвори `plantyhub.ui/.env.production` и попълни:
   ```
   VITE_GTM_ID=GTM-XXXXXXX
   VITE_GA_MEASUREMENT_ID=
   VITE_META_PIXEL_ID=123456789012345
   VITE_CLARITY_PROJECT_ID=abcde12345
   ```
   - `VITE_GA_MEASUREMENT_ID` **остава празно**, защото GA4 е в GTM.
   - Без кавички и без интервали.
2. Деплойни както обикновено: **Deploy PlantyHub.command**.
3. Ако ползваш и GitHub Pages: в GitHub → репото → **Settings → Secrets and variables → Actions → Variables** добави същите `VITE_GTM_ID`, `VITE_META_PIXEL_ID` и `VITE_CLARITY_PROJECT_ID`.

---

## 8. Тестване

Направи го **преди** да публикуваш в GTM.

### 8.1. GTM Preview

1. В GTM горе вдясно → **Preview**.
2. Въведи `https://plantyhub.com` → **Connect**. Ще се отвори сайтът в нов прозорец.
3. На сайта натисни **„Приемам“** в банера за бисквитки. Без това нищо не се зарежда, и така трябва.
4. Отвори продукт, добави в количката, отвори количката, мини към поръчката и **направи тестова поръчка** (наложен платеж). После я откажи от админ панела.
5. В прозореца на Tag Assistant вляво трябва да видиш събитията:
   - `view_item` → таг **GA4 – Ecommerce** е под **Tags Fired**
   - `add_to_cart` → същото
   - `view_cart` → същото
   - `begin_checkout` → същото
   - `purchase` → същото
6. Натисни `purchase` → таб **Data Layer**. Трябва да има `transaction_id`, `value`, `currency: "EUR"` и `items`.

### 8.2. GA4 DebugView

1. GA4 → **Admin** → **Data display** → **DebugView**.
2. Докато Preview режимът е включен, събитията се появяват тук до около минута.

### 8.3. Meta Test Events

1. Events Manager → `PlantyHub Pixel` → таб **Test events**.
2. Въведи `https://plantyhub.com` → **Open website** → приеми бисквитките.
3. Мини същия път. Трябва да видиш: **PageView**, **ViewContent**, **AddToCart**, **InitiateCheckout**, **Purchase**.
4. Meta Pixel Helper (иконката в браузъра) трябва да показва зелено.

### 8.4. Проверка на отказа

1. Отвори сайта в **частен прозорец** (Incognito).
2. Натисни **„Отказвам“**.
3. Meta Pixel Helper не трябва да намира Pixel, а в GTM Preview не трябва да има тагове.

---

## 9. Публикуване в GTM

Ако тестът е минал:

1. GTM → горе вдясно **Submit**.
2. **Version name:** `v1 – GA4 + ecommerce`
3. **Publish**.

> Без **Publish** таговете работят само в Preview режим, но не и за истинските клиенти.

---

## 10. След първите покупки

### 10.1. Маркиране на покупката като цел в GA4

Събитието `purchase` се появява в списъка до 24 часа след първата покупка.

1. GA4 → **Admin** → **Data display** → **Events**.
2. На реда `purchase` включи звездичката или ключа **Mark as key event**.

### 10.2. Къде гледаш продажбите в GA4

- **Reports → Monetization → Ecommerce purchases:** кои продукти се продават.
- **Reports → Acquisition → Traffic acquisition:** откъде идват хората (Google, Facebook, директно).
- **Reports → Engagement → Pages and screens:** кои страници се гледат.

---

## 11. Google Ads (когато решиш да пускаш реклами)

1. Отвори **https://ads.google.com** със същия Google акаунт.
2. Google ще те води към създаване на кампания. Търси малкия линк **Switch to Expert Mode** долу, после **Create an account without a campaign**.
3. Държава **Bulgaria**, часова зона **Bulgaria**, валута **EUR** → **Submit**.
4. **Billing:** добави карта. Няма такса, докато не пуснеш кампания.
5. **Свързване с GA4:** GA4 → **Admin** → **Product links** → **Google Ads links** → **Link** → избери Google Ads акаунта → включи **Enable personalized advertising** → **Submit**.
6. **Импорт на покупките:** Google Ads → **Goals** → **Conversions** → **Summary** → **+ New conversion action** → **Import** → **Google Analytics 4 properties** → **Web** → отметни **purchase** → **Import and continue** → **Done**.
7. **Auto-tagging:** Google Ads → **Admin** → **Account settings** → **Auto-tagging** → провери, че е включено.
8. **Ремаркетинг:** GA4 → **Admin** → **Data display** → **Audiences**. Създадените аудитории се появяват в Google Ads автоматично след свързването.

Таговете в GTM не трябва да се пипат, защото покупките отиват в Google Ads през GA4. Ако по-късно искаш директен таг за конверсии в Google Ads, кажи ми.

---

## 12. Google Merchant Center (по желание)

**Какво е:** продуктите ти излизат в таба „Пазаруване“ в Google със снимка и цена, **безплатно**.

1. **https://merchants.google.com** → **Get started** → бизнес име `PlantyHub`, сайт `plantyhub.com`.
2. Потвърди сайта. Ако Search Console е свързан със същия Google акаунт, обикновено става автоматично.
3. Попълни **доставка** (цени и срокове) и **връщания** (14 дни).
4. Трябва ти **списък с продуктите (feed)**. Кажи ми и ще направя адрес `https://plantyhub.com/feed/google.xml`, който се генерира автоматично от базата.

---

## 13. Чеклист

| # | Задача | Готово |
|---|---|---|
| 1 | GA4 property + Web stream, записан `G-...` | ☐ |
| 2 | GA4: Data retention 14 месеца, Google signals | ☐ |
| 3 | GTM контейнер, записан `GTM-...` | ☐ |
| 4 | GTM: таг GA4 – Google Tag | ☐ |
| 5 | GTM: тригер Ecommerce събития | ☐ |
| 6 | GTM: таг GA4 – Ecommerce | ☐ |
| 7 | Meta бизнес портфолио | ☐ |
| 8 | Meta Pixel, записан ID | ☐ |
| 9 | Meta: **изключен** Automatic advanced matching | ☐ |
| 10 | Meta: потвърден домейн (DNS TXT) | ☐ |
| 11 | Clarity проект, записан ID, masking Balanced/Strict | ☐ |
| 12 | Search Console: потвърден домейн + sitemap | ☐ |
| 13 | `.env.production` попълнен (без GA ID) | ☐ |
| 14 | Деплой | ☐ |
| 15 | Тест: GTM Preview + GA4 DebugView + Meta Test events | ☐ |
| 16 | Тест: „Отказвам“ спира всичко | ☐ |
| 17 | GTM **Publish** | ☐ |
| 18 | GA4: `purchase` маркиран като key event | ☐ |
| 19 | (по-късно) Google Ads + импорт на `purchase` | ☐ |
| 20 | (по-късно) Merchant Center + feed | ☐ |

---

## Какво вече е направено в кода

- GTM, Meta Pixel и Clarity се зареждат **само** след „Приемам“ в банера. При „Отказвам“ бисквитките се изтриват.
- Събития към GTM (`dataLayer`) и Meta Pixel:

| Действие | GTM / GA4 | Meta |
|---|---|---|
| Отваря продукт | `view_item` | `ViewContent` |
| Добавя в количката | `add_to_cart` | `AddToCart` |
| Отваря количката | `view_cart` | — |
| Започва поръчка | `begin_checkout` | `InitiateCheckout` |
| Завършва поръчка | `purchase` | `Purchase` |
| Смяна на страница | автоматично от GA4 | `PageView` |

- Покупката се отчита само веднъж, веднага след поръчката. Ако клиентът презареди страницата, не се брои отново.
- Към Google и Meta не се пращат име, имейл, телефон и адрес.
- Политиката за поверителност и политиката за бисквитки на 4-те езика описват всичко това.
- Кодът е в `plantyhub.ui/src/measure/`.
