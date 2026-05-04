// ============================================================
// services/prestiti.service.js — Logica di business per i prestiti
// ============================================================

const prestitiModel = require('../models/prestiti');
const libriModel    = require('../models/libri');
const utenteModel   = require('../models/utenti');

// FIX #4 — utente_id non viene più letto dal body della richiesta,
// ma viene ricevuto come parametro esplicito dal controller,
// che lo legge da req.utente.id (il JWT verificato).
// In questo modo un utente non può creare prestiti a nome di altri.
const crea = async ({ libro_id, data_restituzione_prevista }, utente_id) => {
  const utente = await utenteModel.findById(utente_id);
  const libro  = await libriModel.findById(libro_id);

  if (!utente.rows.length || !libro.rows.length) {
    const err = new Error('Utente o Libro non trovato');
    err.statusCode = 404;
    throw err;
  }

  if (libro.rows[0].quantita === 0 || !libro.rows[0].disponibile) {
    const err = new Error('Libro non disponibile');
    err.statusCode = 409;
    throw err;
  }

  const prestito = await prestitiModel.create({ utente_id, libro_id, data_restituzione_prevista });
  await libriModel.decrementa(libro_id);
  return prestito.rows[0];
};

// Restituisce tutti i prestiti aggiornando prima i ritardi
const getAll = async () => {
  await prestitiModel.aggiornaRitardi();
  const result = await prestitiModel.findAll();
  return result.rows;
};

const getById = async (id) => {
  const result = await prestitiModel.findById(id);
  if (!result.rows.length) {
    const err = new Error('Prestito non trovato');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
};

const restituisci = async (id) => {
  const prestito = await getById(id);
  if (prestito.stato === 'restituito') {
    const err = new Error('Prestito già rientrato');
    err.statusCode = 409;
    throw err;
  }
  const result = await prestitiModel.restituisci(id);
  await libriModel.incrementa(prestito.libro_id);
  return result.rows[0];
};

const elimina = async (id) => {
  await getById(id);
  await prestitiModel.remove(id);
  return { message: 'Prestito eliminato' };
};

// ── Esportazione ──────────────────────────────────────────────
module.exports = { getAll, getById, crea, elimina, restituisci };
