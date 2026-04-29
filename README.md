# ness-prep

Личный тренажёр для подготовки к собесу. Раскладывает 30 секций / 1100+ вопросов
из `data/source/*.md` в удобный UI: ввод ответа, скрытый правильный ответ, две
подсказки (лёгкая + полная), сброс прогресса, отдельный раздел заметок/черновиков.

Стек: **Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + Postgres**.
Хостится на Vercel free tier (Vercel Postgres или Neon тоже бесплатный).

## Что внутри

- `src/app/` — страницы (App Router)
  - `/login` — вход (2 пользователя из env)
  - `/` — список секций с прогрессом
  - `/sections/[slug]` — вопросы секции, ввод ответа, подсказки, сброс
  - `/notes` — заметки и черновики (создание / редактирование / закрепление)
  - `/api/auth/{login,logout}` — auth
  - `/api/answers`, `/api/answers/reset` — ответы
  - `/api/notes`, `/api/notes/[id]` — заметки
- `src/middleware.ts` — гонит неавторизованных на `/login`
- `prisma/schema.prisma` — модели `Section`, `Question`, `Answer`, `Note`
- `data/source/*.md` — исходные списки вопросов
- `data/questions.json` — распарсенный JSON, который идёт в seed
- `scripts/parse-md.mjs` — превращает markdown → JSON
- `public/robots.txt` — `Disallow: /` плюс `noindex`-meta в layout

## Локальный запуск

```bash
npm install
cp .env.example .env.local         # заполни значения
npm run parse                      # пересобрать data/questions.json
npx prisma db push                 # создать таблицы
npm run db:seed                    # засеять секции и вопросы
npm run dev
```

Открой http://localhost:3000, залогинься как `AUTH_USER_1` / `AUTH_PASS_1`.

## Деплой на Vercel (free tier)

1. **Создай Postgres**: Vercel → Storage → Create Database → Postgres (или
   Neon / Supabase). Подключи к проекту — переменные `POSTGRES_PRISMA_URL` и
   `POSTGRES_URL_NON_POOLING` появятся автоматически.
2. **Добавь env-переменные** в проект (Settings → Environment Variables):
   - `SESSION_SECRET` — `openssl rand -hex 32`
   - `AUTH_USER_1`, `AUTH_PASS_1`
   - `AUTH_USER_2`, `AUTH_PASS_2`
3. **Деплой**. Vercel сам подхватит `npm run build`, который запускает
   `prisma generate` перед `next build`.
4. **Однократно засей БД**. Локально:
   ```bash
   POSTGRES_PRISMA_URL=...        # значения из Vercel → Storage
   POSTGRES_URL_NON_POOLING=...
   npx prisma db push
   npm run db:seed
   ```
   Либо через Vercel CLI: `vercel env pull .env.local && npm run db:seed`.

## Подсказки и эталонные ответы

В первом коммите все вопросы импортированы без подсказок — поля `hintEasy`,
`hintFull`, `answer` пустые. Карточка вопроса показывает «Подсказки и эталонный
ответ ещё не заполнены» и при этом полностью функциональна (ввод ответа,
сохранение, сброс).

Заполнить контент можно тремя способами:

1. **Прямо в БД** через Prisma Studio: `npx prisma studio`.
2. **Через JSON**: дописать `hintEasy` / `hintFull` / `answer` в
   `data/questions.json` и пересеять — seed обновляет только непустые поля,
   так что ручные правки в БД не затрутся.
3. **Через Cowork-чат**: попросить Claude заполнить подсказки для конкретной
   секции. Запросом: «заполни подсказки и эталонные ответы для секции
   `must-have-blitz` и обнови `data/questions.json`».

## Безопасность по-минимуму

- `robots.txt: Disallow: /` + `noindex, nofollow` в `<meta>`.
- httpOnly + signed cookie (HMAC-SHA256 по `SESSION_SECRET`).
- Нет регистрации и сброса пароля — только логины из env.
- Каждый пользователь видит только свои `Answer` и `Note`.

## Скрипты

| Скрипт | Что делает |
| --- | --- |
| `npm run dev` | Next.js dev |
| `npm run build` | `prisma generate` + `next build` (запускается на Vercel) |
| `npm run start` | Production-сервер |
| `npm run parse` | Перепарсить `data/source/*.md` → `data/questions.json` |
| `npm run db:push` | Накатить схему Prisma на БД |
| `npm run db:seed` | Засеять секции и вопросы |
