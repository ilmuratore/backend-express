// ============================================================
// middleware/auth.js — Autenticazione e autorizzazione
// ============================================================

const jwt        = require('jsonwebtoken');
const utenteModel = require('../models/utenti');

// ── autenticato ───────────────────────────────────────────────
// Verifica il token JWT e, dopo la firma, controlla nel DB che:
//   - l'utente esista ancora
//   - token_version nel token coincida con quella nel DB
//
// FIX #1 — questa query aggiuntiva risolve due scenari:
//   a) Utente eliminato: la riga non esiste → 401
//   b) Password cambiata: token_version è cambiata → 401
//
const autenticato = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ successo: false, errore: 'Token mancante' });
  }

  try {
    const token   = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica nel DB che l'utente esista ancora e che token_version coincida
    const result = await utenteModel.findById(payload.id);
    const utente = result.rows[0];

    if (!utente) {
      // L'utente è stato eliminato dopo l'emissione del token
      return res.status(401).json({ successo: false, errore: 'Utente non trovato' });
    }

    if (utente.token_version !== payload.token_version) {
      // La password è cambiata o il token è stato invalidato manualmente
      return res.status(401).json({ successo: false, errore: 'Token non più valido, effettua nuovamente il login' });
    }

    req.utente = payload;
    next();
  } catch (err) {
    res.status(401).json({ successo: false, errore: 'Token non valido o scaduto' });
  }
};

// ── soloAdmin ─────────────────────────────────────────────────
// Consente l'accesso solo agli utenti con ruolo "admin".
// Deve essere usato sempre DOPO autenticato.
const soloAdmin = (req, res, next) => {
  if (req.utente?.ruolo !== 'admin') {
    return res.status(403).json({
      successo: false,
      errore: 'Accesso riservato agli amministratori'
    });
  }
  next();
};

// ── solo se Admin ──────────────────────────────────────────────
// FIX #3 e #6 — Consente l'accesso solo se:
//   - l'utente sta operando su sé stesso (req.utente.id === req.params.id)
//   - oppure è un admin
//
// Senza questo middleware, qualsiasi utente autenticato potrebbe
// leggere o modificare i dati di qualsiasi altro utente.
const soloSéOAdmin = (req, res, next) => {
  const idRichiesto = parseInt(req.params.id);
  const isAdmin     = req.utente?.ruolo === 'admin';
  const isSéStesso  = req.utente?.id    === idRichiesto;

  if (!isAdmin && !isSéStesso) {
    return res.status(403).json({
      successo: false,
      errore: 'Non sei autorizzato ad accedere a questa risorsa'
    });
  }
  next();
};

// ── Esportazione ──────────────────────────────────────────────
module.exports = { autenticato, soloAdmin, soloSéOAdmin };
