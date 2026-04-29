#!/usr/bin/env bash
# Запусти один раз из корня проекта (~/Documents/exness-prep/ness-prep):
#   chmod +x init-and-push.sh && ./init-and-push.sh
#
# Скрипт делает:
#   1. Удаляет сломанный .git (если остался от моей попытки в сандбоксе)
#   2. git init + initial commit
#   3. push на github.com/Evgeni-Garifulin/ness-prep

set -euo pipefail

REPO_URL="https://github.com/Evgeni-Garifulin/ness-prep.git"

if [ -d .git ]; then
  echo "→ удаляю старую .git/"
  rm -rf .git
fi

echo "→ git init"
git init -b main >/dev/null

git config user.email "melegarifulin@gmail.com"
git config user.name "Evgenii Garifulin"

git add -A
git commit -m "Initial commit: Next.js + Prisma + Tailwind scaffold

- Next.js 14 App Router (TS) + Tailwind v3 + Prisma + Postgres
- Auth: HMAC-signed cookie, 2 users из env
- 30 секций / 1100+ вопросов парсятся из data/source/*.md в seed
- QuestionCard: автосохранение ответа, 2 подсказки + эталонный ответ
- Раздел заметок: создание / редактирование / закрепление
- Сброс ответов для секции и для всего прогресса
- robots.txt: Disallow + noindex meta
- README с инструкцией деплоя на Vercel free tier
"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo "→ push на $REPO_URL"
git push -u origin main
echo "✓ Готово"
