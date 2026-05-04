// ============================================================
// routes/utenti.routes.js — Route per utenti e autenticazione
// ============================================================

const router     = require('express').Router();
const { body, param } = require('express-validator');
const validate   = require('../middleware/validate');
const controller = require('../controller/utente.controller');
const { autenticato, soloAdmin, soloSéOAdmin } = require('../middleware/auth');
const limiter    = require('express-rate-limit');

// Rate limiter specifico per login e registrazione:
// max 10 tentativi al minuto per IP → rallenta i brute-force
const limiterAuth = limiter({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { successo: false, errore: 'Troppi tentativi, riprova tra qualche minuto' }
});

// ── Regole di validazione ─────────────────────────────────────

const regolaRegistra = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .isLength({ max: 100 }).withMessage('Il nome non può superare 100 caratteri'),

  body('cognome')
    .trim()
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .isLength({ max: 255 }).withMessage('Il cognome non può superare 255 caratteri'),

  body('email')
    .trim().toLowerCase()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Formato email non valido'),

  body('password').notEmpty().withMessage('La password è obbligatoria'),
  body('password').isLength({ min: 8 }).withMessage('La password deve avere almeno 8 caratteri'),
  body('password').isLength({ max: 100 }).withMessage('La password non può superare 100 caratteri'),
  body('password').custom(v => {
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~])/.test(v))
      throw new Error('La password deve contenere almeno una maiuscola, una minuscola, un numero e un carattere speciale');
    return true;
  }),

  // FIX #2 — il campo "ruolo" è stato rimosso dalla validazione.
  // Anche se il client lo invia, il service lo ignora e imposta sempre 'utente'.
  // Il ruolo si modifica solo tramite PATCH /:id da un admin autenticato.
];

const regolaLogin = [
  body('email')
    .trim().toLowerCase()
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Formato email non valido'),

  body('password')
    .notEmpty().withMessage('La password è obbligatoria'),
];

const regolaId = [
  param('id').isInt({ min: 1 }).withMessage('L\'id deve essere un numero intero positivo'),
];

const regolaAggiorna = [
  param('id').isInt({ min: 1 }).withMessage('L\'id deve essere un numero intero positivo'),

  body('nome')
    .optional().trim()
    .notEmpty().withMessage('Il nome non può essere vuoto')
    .isLength({ max: 100 }).withMessage('Il nome non può superare 100 caratteri'),

  body('cognome')
    .optional().trim()
    .notEmpty().withMessage('Il cognome non può essere vuoto')
    .isLength({ max: 255 }).withMessage('Il cognome non può superare 255 caratteri'),

  body('email')
    .optional().trim().toLowerCase()
    .isEmail().withMessage('Formato email non valido'),

  body('ruolo')
    .optional()
    .isIn(['utente']).withMessage('Il ruolo non puo essere cambiato'),
];

const regolaPromuovi = [
  param('id').isInt({ min: 1 }).withMessage('L\'id deve essere un numero intero positivo'),

  body('nome')
    .optional().trim()
    .notEmpty().withMessage('Il nome non può essere vuoto')
    .isLength({ max: 100 }).withMessage('Il nome non può superare 100 caratteri'),

  body('cognome')
    .optional().trim()
    .notEmpty().withMessage('Il cognome non può essere vuoto')
    .isLength({ max: 255 }).withMessage('Il cognome non può superare 255 caratteri'),

  body('email')
    .optional().trim().toLowerCase()
    .isEmail().withMessage('Formato email non valido'),

  body('ruolo')
    .optional()
    .isIn(['admin']).withMessage('Il ruolo non puo essere diverso da admin per la promozione'),
];

// ── Route pubbliche (senza autenticazione) ────────────────────
router.post('/registra', limiterAuth, regolaRegistra, validate, controller.registra);
router.post('/login',    limiterAuth, regolaLogin,    validate, controller.login);

// ── Route protette ────────────────────────────────────────────

// Solo admin può vedere la lista completa degli utenti
router.get('/', autenticato, soloAdmin, controller.getAll);

// FIX #6 — solo se Admin: solo l'utente stesso o un admin
// può leggere i dati di un profilo
router.get('/:id', autenticato, soloSéOAdmin, regolaId, validate, controller.getById);

// FIX #3 — solo se Admin: solo l'utente stesso o un admin
// può modificare un profilo
router.patch('/:id', autenticato, soloSéOAdmin, regolaAggiorna, validate, controller.aggiorna);

//FIX 7# endpoint dedicato per la promozione
router.patch('/:id/promuovi' , autenticato, soloAdmin, regolaPromuovi, validate, controller.aggiorna)

// Solo admin può eliminare un utente
router.delete('/:id', autenticato, soloAdmin, regolaId, validate, controller.elimina);

// ── Esportazione ──────────────────────────────────────────────
module.exports = router;
