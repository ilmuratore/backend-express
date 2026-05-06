// ============================================================
// index.js — Punto di ingresso dell'applicazione
// Qui configuriamo Express, i middleware globali e le route.
// Infine avviamo il server solo dopo aver inizializzato il DB.
// ============================================================

const express      = require('express');
const errorHandler = require('./middleware/errorHandler');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const seedAdmin    = require('./middleware/seeder');
const cors = require('cors'); // Decommentare quando si collega il frontend

require('dotenv').config(); // Carica le variabili da .env in process.env

// Importiamo i model SOLO per inizializzare le tabelle all'avvio.
// Non li usiamo direttamente qui: ci servono solo per chiamare .init()
const utenteModel   = require('./models/utenti');
const libriModel    = require('./models/libri');
const prestitiModel = require('./models/prestiti');

// Importiamo i router: ogni file routes gestisce un gruppo di endpoint
const utenteRoutes   = require('./routes/utenti.routes');
const libriRoutes    = require('./routes/libri.routes');
const prestitiRoutes = require('./routes/prestiti.routes');
const libriMassiviRoutes   = require('./routes/libriMassivi.routes');

const app  = express();
const port = process.env.PORT;

// ── Rate Limiter Globale ──────────────────────────────────────
// Limita ogni IP a 100 richieste ogni 15 minuti.
// Protegge da attacchi di tipo brute-force e DDoS basilari.
const limiterGlobale = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { successo: false, errore: 'Troppe richieste, riprova tra qualche minuto' }
});

// ── Middleware Globali ────────────────────────────────────────
// express.json() legge il body JSON delle richieste (POST, PATCH)
// e lo rende disponibile come req.body
app.use(express.json());

// helmet aggiunge header HTTP di sicurezza (anti-XSS, clickjacking, ecc.)
app.use(helmet());


// Cors controlla quali origini esterne possono chiamare le nostre API.
// Da decommentare e configurare quando il frontend è attivo.
app.use(cors({
  origin: 'http://localhost:5173',           // URL del frontend
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(limiterGlobale);

// ── Route di test ─────────────────────────────────────────────
// Endpoint rapido per verificare che il server sia raggiungibile
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend avviato: OK', status: '200' });
});

// ── Route principali ─────────────────────────────────────────
// Ogni router gestisce il proprio gruppo di URL con prefisso /api/...
app.use('/api/utente',   utenteRoutes);
app.use('/api/libri',    libriRoutes);
app.use('/api/prestiti', prestitiRoutes);
app.use('/api/import',   libriMassiviRoutes);


// ── Catch-all 404 ────────────────────────────────────────────
// Se nessuna route sopra ha risposto, l'endpoint richiesto non esiste.
app.use((req, res) => {
  res.status(404).json({ successo: false, errore: 'Endpoint non trovato' });
});

// ── Error Handler globale ─────────────────────────────────────
// Deve essere l'ULTIMO middleware: riceve tutti gli errori
// passati con next(err) da controller e middleware
app.use(errorHandler);

// ── Avvio asincrono del server ────────────────────────────────
// Aspettiamo che il DB sia pronto prima di ascoltare le richieste.
// L'ordine di init() è obbligatorio: prestiti ha FK verso utenti e libri,
// quindi quelle tabelle devono già esistere.
const start = async () => {
  try {
    await utenteModel.init();
    await libriModel.init();
    await prestitiModel.init();

    await seedAdmin();

    console.log('✅ Tabelle sincronizzate');

    app.listen(port, () =>
      console.log(`🚀 Server in ascolto su http://localhost:${port}`)
    );
  } catch (err) {
    console.error('❌ Errore di avvio:', err);
    process.exit(1); // Usciamo con codice errore se qualcosa va storto
  }
};

start();