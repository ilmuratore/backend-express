// ============================================================
// middleware/validate.js — Raccolta e restituzione degli errori di validazione
//
// Questo middleware lavora insieme a express-validator.
// Il flusso è:
//   1. Nelle routes definiamo le regole (body(), param(), ecc.)
//   2. Le regole vengono eseguite automaticamente da Express
//   3. validate() raccoglie i risultati e, se ci sono errori, blocca la richiesta
//
// Esempio di utilizzo in una route:
//   router.post('/registra', regolaRegistra, validate, controller.registra)
//   ──────────────────────────────────┬─────────┬──────────────────────────
//                         regole ─────┘         └── validate blocca se errori
// ============================================================

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {

  // validationResult(req) raccoglie tutti gli errori prodotti dalle regole
  // definite prima di questo middleware (body(), param(), custom(), ecc.).
  // Restituisce un oggetto con il metodo isEmpty() e il metodo array().
  const errors = validationResult(req);

  // Se ci sono errori di validazione, blocchiamo la richiesta con 400 Bad Request
  // e restituiamo l'array degli errori al client.
  // Ogni errore nell'array ha la forma:
  //   { type: 'field', path: 'email', msg: 'Formato email non valido', ... }
  if (!errors.isEmpty()) {
    return res.status(400).json({
      successo: false,
      errori: errors.array()
      // Nota: usiamo "errori" (plurale) perché possono essere più di uno.
      // express-validator raccoglie TUTTI gli errori contemporaneamente,
      // non si ferma al primo. Questo è utile per il frontend, che può
      // mostrare tutti i campi sbagliati in una volta sola.
    });
  }

  // Nessun errore → passiamo al controller
  next();
};

// ── Esportazione ──────────────────────────────────────────────
module.exports = validate;