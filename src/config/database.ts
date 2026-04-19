import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

// Configuration de la base de données
db.pragma('journal_mode = WAL');

// Initialisation des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    username TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    resetPasswordToken TEXT,
    resetPasswordExpires DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    prefix TEXT DEFAULT '.',
    config TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    sessionId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS action_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bot_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    botId INTEGER NOT NULL,
    config TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (botId) REFERENCES bots(id) ON DELETE CASCADE
  );

  -- MODULE 1: COMMANDES ET ABONNEMENTS
  CREATE TABLE IF NOT EXISTS commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    isFree INTEGER DEFAULT 1,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    plan TEXT NOT NULL, -- 'free', 'pro'
    status TEXT NOT NULL, -- 'active', 'canceled', 'expired'
    paymentMethod TEXT,
    transactionId TEXT,
    startDate DATETIME,
    endDate DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    provider TEXT NOT NULL,
    transactionId TEXT UNIQUE,
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    planId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- MODULE 3: MARKETPLACE
  CREATE TABLE IF NOT EXISTS marketplace_bots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    logo TEXT,
    commandCount INTEGER,
    downloadType TEXT CHECK(downloadType IN ('github', 'mediafire', 'direct')),
    downloadUrl TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    botId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (botId) REFERENCES marketplace_bots(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  -- MODULE 4: FORUM
  CREATE TABLE IF NOT EXISTS forum_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    "order" INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS forum_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    isPinned INTEGER DEFAULT 0,
    isLocked INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topicId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topicId) REFERENCES forum_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS forum_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    replyId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved'
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (replyId) REFERENCES forum_replies(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Données initiales par défaut
const seed = () => {
  // Limite par défaut
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('free_commands_limit', '52')").run();

  // Commandes par défaut
  const defaultCommands = [
    { name: 'Intelligence Artificielle', category: 'IA', key: 'ai_chatgpt', description: 'Chat interactif avec Gemini/ChatGPT', isFree: 1 },
    { name: 'Téléchargement YouTube', category: 'Downloader', key: 'dl_youtube', description: 'Téléchargement de vidéos YouTube', isFree: 1 },
    { name: 'Téléchargement Instagram', category: 'Downloader', key: 'dl_insta', description: 'Téléchargement de reels Instagram', isFree: 1 },
    { name: 'Gestion de Groupe', category: 'Groupe', key: 'group_mod', description: 'Outils de modération (kick, add, etc)', isFree: 1 },
    { name: 'Antilink', category: 'Groupe', key: 'group_antilink', description: 'Protection contre les liens indésirables', isFree: 0 },
    { name: 'Commandes Fun', category: 'Fun', key: 'fun_games', description: 'Jeux et commandes humoristiques', isFree: 1 },
    { name: 'Recherche Google', category: 'Outils', key: 'tools_google', description: 'Effectuer des recherches en ligne', isFree: 1 },
  ];

  const insertCmd = db.prepare("INSERT OR IGNORE INTO commands (name, category, key, description, isFree, isActive) VALUES (?, ?, ?, ?, ?, 1)");
  for (const cmd of defaultCommands) {
    insertCmd.run(cmd.name, cmd.category, cmd.key, cmd.description, cmd.isFree);
  }

  // Catégories forum par défaut
  const categories = [
    { name: 'Général', description: 'Discussions autour de KuronaBot Builder', icon: 'message-square' },
    { name: 'Aide & Support', description: 'Besoin d\'aide ? Posez vos questions ici', icon: 'help-circle' },
    { name: 'Showcase', description: 'Montrez vos créations à la communauté', icon: 'layout' },
    { name: 'Marketplace', description: 'Discussions sur les bots du marketplace', icon: 'shopping-bag' },
  ];

  const insertCat = db.prepare("INSERT OR IGNORE INTO forum_categories (name, description, icon) VALUES (?, ?, ?)");
  for (const cat of categories) {
    insertCat.run(cat.name, cat.description, cat.icon);
  }
};

seed();

export default db;
