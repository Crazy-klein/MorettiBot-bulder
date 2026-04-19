# KuronaBot Builder

Plateforme open source permettant de créer et gérer vos propres bots WhatsApp basés sur Baileys.

## 🚀 Installation

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Configurez les variables d'environnement :
   Copiez `.env.example` en `.env` et remplissez vos informations.

3. Lancez le serveur :
   ```bash
   npm run dev
   ```

## 🔐 Administration

Pour créer le premier administrateur, inscrivez-vous normalement, puis ouvrez votre base de données `database.sqlite` (avec DB Browser for SQLite par exemple) et changez le champ `role` de votre utilisateur à `admin`.

## ⚙️ Configuration requise

- Node.js 20+
- SQLite3
- Un compte Gmail (ou autre SMTP) pour l'envoi d'emails (optionnel pour la démo local).
