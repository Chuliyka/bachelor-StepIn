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
| API | [`diploma-nest/`](./diploma-nest) | REST API, чат, карта, сповіщення (код сервера) |

### Backend (вже запущений)

API доступний через ngrok — локально піднімати сервер **не потрібно**:

**https://pampers-tapioca-ceramics.ngrok-free.dev**

---

## Інструкція зі встановлення та запуску

### Вимоги

| Інструмент | Версія | Примітка |
|------------|--------|----------|
| [Node.js](https://nodejs.org/) | 18+ | Для Expo |
| [npm](https://www.npmjs.com/) | 10+ | Входить до складу Node.js |
| [Expo Go](https://expo.dev/go) або dev build | — | Запуск мобільного застосунку |

Для `expo run:ios` / `expo run:android` замість Expo Go: Xcode (macOS) та/або Android Studio.

---

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd diploma
```

### 2. Налаштування мобільного застосунку

```bash
cd diploma
cp .env.example .env
npm install
```

У файлі `diploma/.env` вкажіть адресу вже піднятого API:

```env
EXPO_PUBLIC_BASE_URL=https://pampers-tapioca-ceramics.ngrok-free.dev
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=102958596744-9evj2rlp9efaepfv8553kn139pjmrrm7.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=102958596744-14coem5e7l8kt37gne8b7dv222or3pbl.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=102958596744-14coem5e7l8kt37gne8b7dv222or3pbl.apps.googleusercontent.com
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieXVyaWlpbXl0a2kiLCJhIjoiY21vNzdnd2d4MDNtczJwcjY0YmkxOTZpOSJ9.SpIr6kMiHx0QHvK5VxTDGw
```

### 3. Запуск

```bash
npx expo start
```

- `i` — iOS Simulator  
- `a` — Android emulator  
- QR-код — Expo Go на телефоні  

Після зміни `.env` перезапустіть з очищенням кешу: `npx expo start -c`.

> На фізичному пристрої та в симуляторі використовуйте той самий `EXPO_PUBLIC_BASE_URL` з ngrok — `localhost` не потрібен.

---

## Корисні команди (`diploma/`)

| Команда | Опис |
|---------|------|
| `npx expo start` | Dev-сервер |
| `npx expo start -c` | Dev-сервер (очистити кеш) |
| `npm run ios` | Нативний запуск iOS |
| `npm run android` | Нативний запуск Android |
| `npm run lint` | ESLint |

---

## Протестувати роботоздатність застосунку можна, вказавши цей номер телефону як ваш особистий: 984329090. Важливе уточнення, номер телефону в формі авторизації/реєстрації потрібно вводити без коду країни(+380)!



## Усунення несправностей

| Проблема | Рішення |
|----------|---------|
| Застосунок не підключається до API | Перевірте `EXPO_PUBLIC_BASE_URL=https://pampers-tapioca-ceramics.ngrok-free.dev` і перезапустіть Expo (`-c`) |
| Помилка Google-входу | Client ID у `.env` відповідають налаштуванням Google Cloud |
| Застарілі дані після зміни `.env` | `npx expo start -c` |

---

## Структура каталогів

```
diploma/
├── README.md
├── diploma/                 ← StepIn (Expo) — запускається локально
│   ├── app/
│   ├── components/
│   └── .env
└── diploma-nest/            ← NestJS API (код; сервер уже на ngrok)
    ├── src/
    └── prisma/
```
