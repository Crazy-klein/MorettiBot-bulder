import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import dotenv from 'dotenv';
import fs from 'fs-extra';

// Routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import botRoutes from './routes/bots.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import notificationRoutes from './routes/api/notifications.js';

// Config
import { SESSION_SECRET, BOT_TYPES, APP_NAME } from './config/constants.js';
import db from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const SQLite = SQLiteStore(session);

// Création des dossiers nécessaires
const dirs = ['temp', 'sessions', 'bot-template/src/commands', 'bot-template/src/handlers', 'bot-template/src/lib'];
for (const dir of dirs) {
  fs.ensureDirSync(path.join(__dirname, '..', dir));
}

// Configuration EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  store: new SQLite({ db: 'sessions.sqlite', dir: path.join(__dirname, '..') }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 semaine
}));

// Middleware pour passer des variables globales aux vues
app.use((req, res, next) => {
  res.locals.user = (req.session as any).userId ? { id: (req.session as any).userId, username: (req.session as any).username, role: (req.session as any).isAdmin ? 'admin' : 'user' } : null;
  res.locals.isAdmin = (req.session as any).isAdmin || false;
  res.locals.APP_NAME = APP_NAME;
  res.locals.BOT_TYPES = BOT_TYPES;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(botRoutes);
app.use(adminRoutes);
app.use(profileRoutes);
app.use(notificationRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page non trouvée', 
    error: { status: 404 } 
  });
});

// Gestion des erreurs globales
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', { 
    message: err.message || 'Erreur serveur interne', 
    error: err 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server KuronaBot running on http://localhost:${PORT}`);
  
  // Nettoyage au démarrage : on marque tous les bots 'running' comme 'stopped'
  // car les processus sockets sont morts au redémarrage serveur
  try {
    const bots = db.prepare("SELECT id FROM bots WHERE status = 'running'").all() as { id: number }[];
    bots.forEach(bot => {
      db.prepare("UPDATE bots SET status = 'stopped' WHERE id = ?").run(bot.id);
    });
    if (bots.length > 0) {
      console.log(`[Startup] ${bots.length} sessions zombies ont été nettoyées.`);
    }
  } catch (e) {}
});
