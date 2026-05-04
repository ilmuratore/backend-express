// ============================================================
// middleware/errorHandler.js — Gestore globale degli errori
//
// In Express, un middleware di errore si riconosce dalla firma
// a QUATTRO parametri: (err, req, res, next).
// Express lo invoca automaticamente ogni volta che un controller
// chiama next(err) oppure lancia un'eccezione in un blocco async.
//
// Va registrato per ULTIMO in index.js, dopo tutte le route:
//   app.use(errorHandler);
// ============================================================

require('dotenv').config();

const errorHandler = (err, req, res, next) => {

  // err.statusCode viene impostato nei service quando creiamo errori personalizzati:
  //   const err = new Error('Email già presente');
  //   err.statusCode = 409;
  //   throw err;
  // Se non è stato impostato, usiamo 500 (Internal Server Error) come fallback.
  const status = err.statusCode || 500;

  // err.message è il testo passato a new Error('...').
  // Se manca, usiamo un messaggio generico per non esporre dettagli interni.
  const messaggio = err.message || 'Errore interno del server';

  // In sviluppo (NODE_ENV !== 'production') stampiamo i dettagli in console
  // per facilitare il debug. In produzione non lo facciamo per sicurezza:
  // non vogliamo esporre stack trace o dettagli interni nei log del server.
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${status} - ${messaggio}`);
    // Lo stack trace (il percorso delle chiamate che ha portato all'errore)
    // è utile solo per gli errori inaspettati (500), non per quelli che
    // noi stessi abbiamo lanciato intenzionalmente (404, 409, ecc.)
    if (status === 500) console.error(err.stack);
  }

  // Rispondiamo al client con il codice di stato e il messaggio di errore.
  // Il formato è coerente con tutte le altre risposte dell'API:
  //   { successo: false, errore: '...' }
  res.status(status).json({ successo: false, errore: messaggio });
};

// ── Esportazione ──────────────────────────────────────────────
module.exports = errorHandler;