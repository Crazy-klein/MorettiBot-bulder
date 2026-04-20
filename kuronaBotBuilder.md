# 📚 Guide de Maintenance et Personnalisation : KuronaBot Builder

Ce guide vous explique comment modifier l'apparence visuelle et comprendre le fonctionnement interne de votre plateforme **KuronaBot Builder**.

---

## 🎨 PARTIE 1 : Comment modifier le design du site

Le projet utilise **Tailwind CSS** pour le style rapide et un fichier **CSS personnalisé** pour les effets de luxe.

### 1.1 Les couleurs principales
Le thème est configuré directement dans le layout principal afin de permettre une personnalisation centralisée via la configuration Tailwind.

*   **Fichier :** `/src/views/layouts/main.ejs` (Section `<script>` de configuration Tailwind)
*   **Action :** Recherchez l'objet `colors` dans `tailwind.config`.

```javascript
/* Extrait de src/views/layouts/main.ejs */
colors: {
    gold: {
        DEFAULT: '#d4a373', // La couleur dorée principale (HEX)
        light: '#e5c07b',   // Version plus claire pour les bordures
        dark: '#c18a56',    // Version plus sombre pour les ombres
        glow: 'rgba(212, 163, 115, 0.4)' // Pour les effets de halo
    },
    dark: {
        DEFAULT: '#0B0E14', // Fond de page principal
        card: '#121417',    // Fond des cartes et boîtes
        sidebar: '#1A1E26'  // Fond de la barre latérale
    }
}
```

### 1.2 Les polices de caractères
L'application utilise la police **Inter** de Google Fonts.

*   **Import :** `/src/views/layouts/main.ejs` (Ligne 11).
*   **Modification :** Remplacez le lien Google Fonts par celui de votre choix (ex: Poppins) :
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&display=swap" rel="stylesheet">
    ```
*   **Application :** Modifiez `fontFamily` dans la configuration Tailwind (Ligne 21 du même fichier) :
    ```javascript
    fontFamily: {
        sans: ['Poppins', 'sans-serif'],
    },
    ```

### 1.3 Le style Glassmorphism
L'effet "verre dépoli" est la signature visuelle du projet.

*   **Fichier :** `/src/public/css/custom.css`
*   **Ajustement :** Modifiez la classe `.glass` pour changer le flou ou la transparence.
    ```css
    .glass {
        background: rgba(255, 255, 255, 0.03); /* Transparence (0.01 à 0.1) */
        backdrop-filter: blur(20px); /* Intensité du flou (10px à 40px) */
        border: 1px solid rgba(255, 255, 255, 0.05); /* Liseré subtil */
    }
    ```
*   **Utilisation :** Appliquez simplement la classe `glass` à n'importe quelle `div` dans vos fichiers EJS.

### 1.4 Les animations et effets
Les animations sont gérées par CSS pour les effets continus et par **Alpine.js** pour les interactions.

*   **Animations CSS :** `/src/public/css/custom.css` (Ex: `pulse-gold` pour le halo doré).
*   **Animations d'Entrée :** Dans `/src/views/layouts/main.ejs`, l'indicateur de la sidebar utilise une courbe `cubic-bezier` pour un effet élastique :
    ```css
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    ```
*   **Vitesse :** Changez `duration-300` (lent) par `duration-100` (rapide) dans les classes Tailwind des éléments.

### 1.5 La mise en page globale (Layout)
Le layout est le squelette commun à toutes les pages (Sidebar, Header, Footer).

*   **Fichier :** `/src/views/layouts/main.ejs`
*   **Sidebar :** Définie après la balise `<body>`. Elle contient le menu de navigation.
*   **Header :** Ligne 196. Il contient les statistiques et le menu profil utilisateur.
*   **Footer :** Ligne 280. Contient les liens légaux et le copyright.

### 1.6 Les pages spécifiques
Le contenu de chaque page est injecté à la ligne 277 de `main.ejs` via `<%- body %>`.

*   **Accueil :** `/src/views/index.ejs`
*   **Dashboard :** `/src/views/dashboard.ejs`
*   **Config de Bot :** `/src/views/bot-config.ejs`
*   **Marketplace :** `/src/views/marketplace/index.ejs`
*   **Forum :** `/src/views/forum/index.ejs`

---

## 🗺️ PARTIE 2 : Informations clés sur le projet

### 2.1 Structure des dossiers
*   `src/config/` : Centralise les constantes, la DB et les variables d'environnement.
*   `src/models/` : Contient les requêtes SQL (Modeles de données). **C'est ici qu'on change la logique de données.**
*   `src/routes/` : Définit les URLs. Chaque fichier correspond à un module (Auth, Bots, Forum).
*   `src/services/` : La logique métier pure (Génération de ZIP, Connexion WhatsApp, Paiements).
*   `src/middlewares/` : Sécurité. Vérifie si un utilisateur est connecté ou s'il est Admin.
*   `src/views/` : Les interfaces HTML. Utilise EJS pour injecter les données du serveur.
*   `src/public/` : Fichiers accessibles par le navigateur (CSS, Images, Logos téléchargés).

### 2.2 Fichiers essentiels
1.  **`/src/app.ts`** : Le coeur du serveur. Initialise Express, les sessions et les routes.
2.  **`/src/config/database.ts`** : Définit la structure SQL. Si vous ajoutez une table, faites-le ici.
3.  **`/src/services/botGenerator.ts`** : Logique de création des fichiers ZIP pour les utilisateurs.
4.  **`/src/services/sessionManager.ts`** : Pilote la connexion Baileys (WhatsApp) et les QR Codes.
5.  **`/src/services/paymentService.ts`** : Point d'intégration des APIs de paiement (Orange, MTN, PayPal).

### 2.3 Variables d'environnement (`.env`)
Ces variables doivent être configurées dans votre environnement de déploiement.
*   `SESSION_SECRET` : Clé secrète pour les cookies (Indispensable).
*   `ADMIN_EMAIL` : Si un utilisateur s'inscrit avec cet email, il devient **Admin** automatiquement.
*   `DATABASE_URL` : (Facultatif) Pour définir un chemin spécifique pour la DB SQLite.
*   `MONEYFUSION_APP_KEY` : Clé pour le service de paiement (Requis pour le module Payment).

### 2.4 Base de données (SQLite)
*   **Fichier :** `database.sqlite` (créé à la racine au lancement).
*   **Tables Clés :**
    *   `users` : Profils, mots de passe hashés et rôles.
    *   `bots` : Configuration des instances créées par les utilisateurs.
    *   `commands` : Liste des modules activables (Admin).
    *   `marketplace_bots` : Bots soumis pour vente/partage.

### 2.5 Démarrage et scripts
Exécutez-les depuis votre terminal à la racine du projet :
*   `npm run dev` : Lance le projet avec rechargement automatique (Idéal pour coder).
*   `npm run build` : Compile le TypeScript en JavaScript pour la performance.
*   `npm start` : Démarre l'application compilée (Mode Production).
*   `npm run lint` : Analyse le code pour détecter des erreurs de syntaxe.

### 2.6 Points d'entrée
*   **Public :** Page d'accueil (`/`), Marketplace (`/marketplace`), Forum (`/forum`).
*   **Privé :** Dashboard (`/dashboard`), Création de bot (`/bots/new`).
*   **Admin :** Toutes les routes commençant par `/admin/`. (Vérifie le rôle 'admin' en base de données).

### 2.7 Personnalisation Rapide (Cheat Sheet)
1.  **Changer le Nom du Site :** Modifiez `APP_NAME` dans `/src/config/constants.ts`.
2.  **Changer le Logo de la Sidebar :** Remplacez l'URL de l'image à la ligne 128 de `/src/views/layouts/main.ejs`.
3.  **Ajuster la limite de commandes gratuites :** Modifiez la valeur par défaut `52` dans `/src/config/database.ts` (Fonction seed).
4.  **Ajouter un lien de menu :** Ajoutez un bloc `<a>` dans la balise `<nav>` du fichier `/src/views/layouts/main.ejs`.

---

**Note :** KuronaBot Builder est conçu pour être modulaire. Pour ajouter une nouvelle fonctionnalité, créez d'abord son **Modèle** (Données), puis son **Service** (Logique), ses **Routes** (URL) et enfin ses **Views** (Interface).
