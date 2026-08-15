# EMBA

## LINK (marketing)

Consumer marketing website for the LINK academic pilot lives in [`website/`](./website/).

```bash
cd website
npm install
npm run dev
```

## ขบวนพร้อม (LINE LIFF product)

Trip coordination platform (LIFF + web) lives in [`mcg-convoy/`](./mcg-convoy/).

```bash
cd mcg-convoy
pnpm install
pnpm --filter @mcg-convoy/shared build
pnpm --filter @mcg-convoy/api start:demo
pnpm --filter @mcg-convoy/web dev
```

Open http://localhost:3000 — see [`mcg-convoy/README.md`](./mcg-convoy/README.md).
