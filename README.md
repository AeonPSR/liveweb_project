# Burgerito

Application e-commerce de burgers avec fonctionnalités temps réel (Next.js 14 + TypeScript + Tailwind CSS).

## Fonctionnalités
- Catalogue produits avec détails
- Authentification (NextAuth)
- Panier et gestion commandes
- Chat support temps réel (WebSocket)
- Suivi commande en direct (SSE) (Demo avec un changement d'état automatisée)

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- WebSocket (ws)
- NextAuth

## Installation
```bash
npm install
npm run dev
```
Ouvrir http://localhost:3000

**Demo**: https://liveweb-project.vercel.app/

## Structure
```
app/
  auth/              # Login/Register
  panier/            # Panier
  orders/[id]/       # Détail commande + suivi SSE
  profile/           # Profil utilisateur
  api/
    order-status/    # SSE endpoint
components/
  ChatSupport.tsx    # Chat client WebSocket
  OrderStatusTracker.tsx  # Suivi commande SSE
admin-support/       # Interface admin chat (HTML standalone)
server.js            # Serveur custom Node + WebSocket
```

## Chat Support
Le chat utilise WebSocket pour la messagerie temps réel entre utilisateurs et support.

**Admin**: Ouvrir `admin-support/index.html` dans un navigateur.

## API
Base URL: `https://node-eemi.vercel.app`

Endpoints:
- `GET /products` – liste produits
- `GET /products/:id` – détail produit
- `POST /api/orders` – créer commande
- `GET /api/orders` – historique commandes

---
> Projet M2 Web Temps Réel
