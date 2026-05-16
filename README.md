# X

Projeto de disciplina: clone do X (Twitter) com Next.js.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma + SQLite
- Tailwind CSS
- Auth: JWT em cookie httpOnly + bcryptjs

## Funcionalidades

- Login / Cadastro
- Postar, editar, comentar
- Curtir
- Seguir / deixar de seguir
- Salvar postagens (bookmarks)
- DMs (mensagens diretas)

## Rodando localmente

```powershell
npm install
copy .env.example .env
npx prisma db push
npm run dev
```

Acesse `http://localhost:3000/login` ou `http://localhost:3000/register`.
