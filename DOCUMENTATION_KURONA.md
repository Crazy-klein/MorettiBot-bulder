# 🏛️ KURONABOT BUILDER - DOCUMENTATION OFFICIELLE
## L'Excellence de l'Automatisation WhatsApp

---

### **PAGE 1 : PRÉSENTATION DES BOTS KURONA**
**KuronaBot_Builder** représente l'élite de la génération de bots sans code pour WhatsApp. Basés sur la technologie Baileys, nos bots sont conçus pour offrir une expérience utilisateur premium, alliant rapidité, sécurité et esthétique.

**Points Clés :**
- **Core Engine :** Architecture modulaire en TypeScript pour une stabilité maximale.
- **Identité Visuelle :** Formatage exclusif "Kurona Arsenal" pour toutes les réponses.
- **Flexibilité :** Déploiement instantané avec gestion de session QR Code sécurisée.
- **Performance :** Optimisation des ressources pour un temps de réponse minimal.

---

### **PAGE 2 : À PROPOS DU DÉVELOPPEUR - DEV KURONA**
**👑 CRAZY-KLEIN 👑**
*« Le pouvoir ne signifie rien sans la volonté de le manier. »*

✦ **Qui suis-je ?**
Étudiant camerounais autodidacte, passionné par l'informatique, la cybersphère et la création de bots. 

🔭 **Projets Actuels :** Travaille sur des écosystèmes web complexes et des intelligences distribuées pour WhatsApp et Telegram.
🌱 **En Apprentissage :** Perfectionnement HTML/CSS pour des interfaces toujours plus immersives.
💻 **Exploration :** Automatisation, APIs REST, et Intelligence Numérique.
⚙️ **Backstage :** Développement de projets personnels en Node.js, MySQL et architectures asynchrones dans l'ombre.

**🔥 Compétences :** JavaScript | NodeJS | MySQL

---

### **PAGE 3 : CATÉGORIE - SECURITY (LE BOUCLIER)**
La sécurité est la priorité absolue. Ce module transforme le bot en un modérateur infatigable.

- **antidelete.ts :** Détecte les messages supprimés et les restaure pour les administrateurs.
- **antilink.ts :** Intercepte et supprime tout lien WhatsApp ou Internet non autorisé.
- **antispam.ts :** Limite le flux de messages (rate limiting) pour prévenir le flood des serveurs.
- **antitag.ts :** Bannit automatiquement les utilisateurs abusant des mentions massives.
- **antword.ts :** Censure dynamiquement une liste noire de mots interdits personnalisable par groupe.
- **antisticker.ts :** Bloque l'envoi compulsif de stickers pour maintenir une discussion lisible.
- **antivideo.ts :** Restreint l'envoi de vidéos, idéal pour les groupes d'information.
- **antitransfer.ts :** Bloque les messages transférés pour éviter la propagation de fake news.
- **antibot.ts :** Détecte et exclut les autres instances de bots pour éviter les boucles infinies.

---

### **PAGE 4 : CATÉGORIE - GROUP (GESTIONNAIRE DE CERCLE)**
Outils indispensables pour gouverner une communauté WhatsApp avec précision.

- **kick.ts :** Expulsion immédiate d'un membre signalé ou cité.
- **kickall.ts :** Commande de nettoyage massif (Owner uniquement) avec délais de sécurité.
- **promote.ts / demote.ts :** Gestion des grades administrateurs en une commande.
- **setname.ts / setdesc.ts :** Mise à jour instantanée de l'identité visuelle et textuelle du groupe.
- **welcome.ts / goodbye.ts :** Automatisation des messages de bienvenue et de départ avec templates.
- **tagall.ts / tagadmin.ts :** Notifications ciblées pour attirer l'attention de l'ensemble des membres ou des staffs.
- **groupinfo.ts :** Rapport technique complet sur la santé et les paramètres du groupe.
- **vcfgroupe.ts :** Exportation de tous les contacts du groupe au format VCF pour une sauvegarde externe.
- **approveall.ts :** Validation en masse des demandes d'adhésion en attente.

---

### **PAGE 5 : CATÉGORIE - DOWNLOADER (L'ARCHIVISTE)**
Accès illimité aux contenus mondiaux, directement dans la discussion.

- **tiktok.ts :** Récupération de vidéos TikTok sans filigrane (HD).
- **facebook.ts :** Téléchargement de vidéos depuis les feeds et stories Facebook.
- **youtube.ts :** Extraction audio haute qualité (MP3) depuis n'importe quel lien YouTube.
- **play.ts :** Recherche intelligente et lecture directe de musique par titre.
- **playvid.ts :** Recherche et envoi de vidéos YouTube compressées pour WhatsApp.
- **instagram.ts (Core) :** (Intégration via API Kurona) Récupération de Reels et Posts.

---

### **PAGE 6 : CATÉGORIE - TOOLS (LA BOÎTE À OUTILS)**
Améliore les capacités natives de WhatsApp avec des fonctions inédites.

- **getid.ts / getpp.ts :** Extraction des données techniques (JID/LID) et des avatarsHD.
- **location.ts :** Recherche géographique et envoi de positionnement GPS en temps réel.
- **qr.ts :** Transformation instantanée de textes ou URLs en codes QR scannables.
- **tts.ts / voice.ts :** Synthèse vocale multilingue pour transformer le texte en notes vocales humaines.
- **vv.ts :** Le bypass ultime pour visualiser les messages à vue unique de manière permanente.
- **store.ts / getmedia.ts :** Système de stockage local pour archiver des fichiers importants directement sur le serveur du bot.
- **newsletter.ts :** Analyse des canaux WhatsApp pour extraire ID et métadonnées d'audience.

---

### **PAGE 7 : CATÉGORIE - CONVERTER (LE STUDIO CRÉATIF)**
Transformez vos médias en formats optimisés.

- **sticker.ts :** Conversion instantanée Image/Vidéo en Stickers WhatsApp HD.
- **toimg.ts :** Extraction de l'image source à partir d'un sticker.
- **takesticker.ts :** Modification des métadonnées (Pack/Auteur) d'un sticker existant.
- **tg.ts :** Importation de packs de stickers complets depuis Telegram vers WhatsApp.

---

### **PAGE 8 : CATÉGORIE - AUTOMATION (L'INTELLIGENCE SILENCIEUSE)**
Laissez le bot travailler pour vous pendant que vous dormez.

- **autoreact.ts :** Réagit automatiquement aux messages avec des emojis contextuels.
- **autovu.ts :** Visionne et "like" les statuts de vos contacts automatiquement.
- **autotype.ts :** Simule l'écriture ou l'enregistrement vocal pour une présence discrète.
- **responder.ts :** Création de réponses intelligentes basées sur des déclencheurs textuels (FAQ automatique).

---

### **PAGE 9 : CATÉGORIE - OWNER (LE TRÔNE DU CRÉATEUR)**
Commandes de contrôle total sur le système.

- **setprefix.ts :** Change le symbole de déclenchement du bot (ex: . / !).
- **setpp.ts :** Met à jour la photo de profil du robot depuis le chat.
- **setpublic.ts / setprivate.ts :** Bascule l'accès au bot pour tout le monde ou exclusivement pour vous.
- **block.ts / unblock.ts :** Gestion de la liste noire globale des utilisateurs.
- **sudo.ts :** Délégation temporaire de pouvoirs d'administrateur système à un autre utilisateur.
- **gitclone.ts :** Déploiement automatique de projets GitHub directement via le bot.
- **setmenuaudio.ts / setmenuvideo.ts :** Personnalisation de l'ambiance sonore et visuelle du menu principal.

---

### **PAGE 10 : CATÉGORIE - SEARCH & AI (L'ORACLE)**
L'accès à la connaissance infinie.

- **ai.ts :** Intégration avancée de Google Gemini pour des conversations intelligentes et résolution de problèmes.
- **weather.ts :** Bulletin météo complet pour n'importe quelle ville du monde.
- **lyrics.ts :** Recherche et affichage des paroles de chansons.
- **searchimage.ts :** Moteur de recherche d'images haute résolution intégré.

---

### **PAGE 11 : ARCHITECTURE TECHNIQUE (DEV ONLY)**
Le projet est structuré selon les standards modernes du développement :
- **src/lib/utils.ts :** Le cœur névralgique regroupant tous les managers (AntiSpam, Permissions, JSONDatabase).
- **src/handlers/messageHandler.ts :** Le dispatchneur ultra-rapide traitant le flux de messages.
- **database/ :** Stockage persistant des configurations individuelles par chat.

---

### **PAGE 12 : VISION ET FUTUR**
**KuronaBot Builder** ne cesse d'évoluer. Nos prochaines mises à jour incluront :
- **Intégration Blockchain :** Pour des paiements sécurisés via le bot.
- **Plugin System :** Permettant aux utilisateurs d'ajouter leurs propres fonctions sans toucher au code source.
- **Deep Learning :** Reconnaissance d'image avancée pour une modération encore plus fine.

**Le projet KuronaBot est votre porte d'entrée vers la souveraineté numérique.** ⚔️
