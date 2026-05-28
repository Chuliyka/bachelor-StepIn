# StepIn

**Тема роботи:** Розроблення мобільного застосунку для організації спільного дозвілля та пошуку нових знайомств на основі геолокації та активних статусів користувачів.

| | |
|---|---|
| **Автор** | Чулій Іванна Євгенівна |
| **Науковий керівник** | Зибіна К.В., старший викладач |

---

## Про проєкт

**StepIn** — мобільний застосунок для організації спільного дозвілля та пошуку нових знайомств на основі геолокації та активних статусів користувачів. Застосунок дозволяє швидко знаходити людей поруч без тривалого листування. Працює на основі поточного місцезнаходження, спільних інтересів та готовності до взаємодії прямо зараз.

### Технологічний стек

| Шар | Технології |
|-----|------------|
| Мобільний клієнт | React Native (Expo), Expo Router |
| Сервер | NestJS, Prisma, WebSockets (Socket.IO) |
| База даних | PostgreSQL, PostGIS |
| Підбір за інтересами | Google Gemini API (семантичні ембедінги) |
| Захист геопозиції | Диференційована приватність, механізм Лапласа |

### Структура репозиторію

| Пакет | Шлях | Опис |
|-------|------|------|
| Мобільний застосунок | [`diploma/`](./diploma) | Клієнт StepIn (iOS / Android) |
| API | [`diploma-nest/`](./diploma-nest) | REST API, чат, карта, сповіщення |

---

## Інструкція зі встановлення та запуску

### Вимоги

| Інструмент | Версія | Примітка |
|------------|--------|----------|
| [Node.js](https://nodejs.org/) | **22+** | Потрібно для `diploma-nest` |
| [npm](https://www.npmjs.com/) | 10+ | Входить до складу Node.js |
| [Docker](https://www.docker.com/) | актуальна | Локальна БД PostGIS |
| [Expo Go](https://expo.dev/go) або dev build | — | Запуск мобільного застосунку |

**Додатково (за потреби):**

- [ngrok](https://ngrok.com/) — доступ до API з фізичного пристрою
- [Twilio](https://www.twilio.com/) — SMS-верифікація телефону
- [Google Cloud Console](https://console.cloud.google.com/) — вхід через Google
- [Google AI Studio](https://aistudio.google.com/) — ключ Gemini для семантичного підбору

Для `expo run:ios` / `expo run:android` замість Expo Go: Xcode (macOS) та/або Android Studio.

---

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd diploma
```

### 2. Запуск бази даних

```bash
cd diploma-nest
docker compose up -d postgres_db
```

Запускається **PostGIS** на порту `5432`:

- Користувач: `postgres`
- Пароль: `postgres`
- База: `diploma_db`

Переконайтеся, що контейнер у стані healthy: `docker compose ps`.

### 3. Налаштування та запуск API

```bash
# у каталозі diploma-nest/
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

API за замовчуванням доступний на **http://localhost:3000**.


### 4. Налаштування та запуск мобільного застосунку

У **другому терміналі**:

```bash
cd diploma
cp .env.example .env
npm install
npx expo start
```

- `i` — iOS Simulator  
- `a` — Android emulator  
- QR-код — Expo Go на телефоні  

---

## Змінні середовища

Не комітьте файли `.env` з реальними секретами. Скопіюйте шаблони:

```bash
cp diploma-nest/.env.example diploma-nest/.env
cp diploma/.env.example diploma/.env
```

### Backend — `diploma-nest/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diploma_db?schema=public"
PORT=3000

JWT_ACCESS_SECRET="change_me_access"
JWT_REFRESH_SECRET="change_me_refresh"

GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
GOOGLE_IOS_CLIENT_ID="your-ios-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_IDS="web-id.apps.googleusercontent.com,ios-id.apps.googleusercontent.com"

TWILIO_ACCOUNT_SID="ACxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_FROM_PHONE="+1234567890"

GEMINI_API_KEY=AIzaSyADLuXmEh8mh9qsj19m8zTPs1MZK-pjvto
MATCH_RADIUS_METERS=100
MATCH_SIMILARITY_THRESHOLD=0.75
MATCH_COOLDOWN_HOURS=24
```

### Мобільний застосунок — `diploma/.env`

```env
EXPO_PUBLIC_BASE_URL=http://localhost:3000

EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID="your-ios-client-id.apps.googleusercontent.com"
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID="your-expo-client-id.apps.googleusercontent.com"
```

Після зміни `.env` перезапустіть Expo: `npx expo start -c`.

---

## Запуск на фізичному пристрої

Симулятор бачить `http://localhost:3000`. **Телефон — ні.**

1. Запустіть API: `npm run start:dev` у `diploma-nest`.
2. Вкажіть доступну адресу в `EXPO_PUBLIC_BASE_URL`:
   - **ngrok:** `ngrok http 3000` → HTTPS-URL у `.env`
   - **LAN:** `http://<ip-компʼютера>:3000` (одна Wi‑Fi-мережа)
3. Перезапустіть Expo: `npx expo start -c`.

---

## Docker: база даних і API разом

```bash
cd diploma-nest
docker compose up -d
```

- API: http://localhost:3000  
- Postgres: localhost:5432  

У повному Docker-режимі `DATABASE_URL` у контейнері API має вказувати на хост `postgres_db`, а не `localhost`. Для локальної розробки зазвичай достатньо лише `postgres_db` через Compose, а API запускають на хості (`npm run start:dev`).

---


## Налаштування Google Sign-In

1. Проєкт у [Google Cloud Console](https://console.cloud.google.com/).
2. OAuth consent screen.
3. OAuth-клієнти:
   - **Web** — Expo / перевірка на backend
   - **iOS** — bundle ID: `com.chuliyka.diploma` (`diploma/app.json`)
4. Скопіюйте client ID у `diploma-nest/.env` та `diploma/.env`.

---

## Усунення несправностей

| Проблема | Рішення |
|----------|---------|
| Помилка підключення до БД | `docker compose up -d postgres_db`, порт `5432` вільний |
| Міграції PostGIS не проходять | Образ `postgis/postgis` з `docker-compose.yml` |
| Застосунок не бачить API на телефоні | `EXPO_PUBLIC_BASE_URL` → ngrok або LAN IP |
| Не надходить SMS-код | Twilio у `.env`; trial — лише верифіковані номери |
| Помилка Google-входу | Client ID для iOS/web збігаються з backend |
| Попередження `GEMINI_API_KEY` | Не критично; потрібно лише для AI-підбору |
| Помилки версії Node | Потрібен Node **22+** (`node -v`) |

---

## Структура каталогів

```
diploma/
├── README.md
├── diploma/                 ← StepIn (Expo)
│   ├── app/
│   ├── components/
│   └── .env
└── diploma-nest/            ← NestJS API
    ├── src/
    ├── prisma/
    ├── docker-compose.yml
    └── .env
```
