# Burgerito – Sprint 1

Squelette initial de l'application e‑commerce Burgerito (Next.js App Router + TypeScript + Tailwind CSS).

## Objectifs Sprint 1
- Structure App Router + layout (header, liens).
- Accueil avec liste des produits depuis l'API distante.
- Page détail produit `/product/[id]`.
- Gestion 404 + états de chargement.

## Stack
- Next.js 14 (App Router)
- TypeScript strict
- Tailwind CSS

## API
Base URL: `https://node-eemi.vercel.app`

Endpoints utilisés:
- `GET /products` – liste des produits
- `GET /products/:id` – détail produit

### Mode local temporaire
L'API étant indisponible actuellement, le catalogue utilise une **seed locale** (`data/products.ts`) avec 7 produits fictifs et des images PNG sous `public/img/burger` (ex: `burger1.png`). Le hero utilise `public/img/hero.png`. Retirer cette seed et réactiver les appels `listProducts()` dans `app/page.tsx` lorsque l'API sera opérationnelle.

## Démarrage (développement)
```bash
npm install
npm run dev
```
Ensuite ouvrir http://localhost:3000

## Structure principale
```
app/
  layout.tsx            # Layout global + Header
  page.tsx              # Liste produits
  loading.tsx           # Chargement racine
  not-found.tsx         # Page 404
  product/[id]/page.tsx # Détail produit
  product/[id]/loading.tsx
components/
  Header.tsx
  ProductCard.tsx
lib/
  api.ts                # Fonctions fetch (ISR 60s)
types/
  product.ts
```

## Prochaines étapes (Sprints futurs)
- Authentification (NextAuth)
- Panier & commande
- WebSocket (chat + suivi commande)
- Optimisations images & SEO supplémentaires

---
> Projet pédagogique – M2 Temps Réel.
