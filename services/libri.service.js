// ============================================================
// services/libri.service.js — Logica di business per i libri
//
// Il service sa COSA fare (regole, controlli, orchestrazione).
// Delega al model il COME farlo sul database.
// Questa separazione si chiama "separation of concerns":
//   model  → dati
//   service → regole di business
//   controller → parsing HTTP (req/res)
// ============================================================

const libriModel = require('../models/libri');

// Crea un nuovo libro dopo aver verificato che l'ISBN non sia già presente.
const crea = async (dati) => {
  if (dati.isbn) {
    const result = await libriModel.findByIsbn(dati.isbn);
    if (result.rows.length) {
      // 409 Conflict: il libro con questo ISBN esiste già
      const err = new Error('ISBN già presente');
      err.statusCode = 409;
      throw err;
    }
  }
  const libro = await libriModel.create(dati);
  return libro.rows[0];
};

// Restituisce tutti i libri
const getAll = async () => {
  const result = await libriModel.findAll();
  return result.rows;
};

// Restituisce un singolo libro per id.
// Lancia un 404 se non esiste — così controller e altri service
// possono fare semplicemente "await getById(id)" senza gestire i null.
const getById = async (id) => {
  const result = await libriModel.findById(id);
  if (!result.rows.length) {
    const err = new Error('Libro non trovato');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
};

// Restituisce un singolo libro per ISBN
const getByISBN = async (isbn) => {
  const result = await libriModel.findByIsbn(isbn);
  if (!result.rows.length) {
    const err = new Error('Libro non trovato');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
};

// Aggiorna i campi del libro (PATCH parziale grazie a COALESCE nel model)
const aggiorna = async (id, dati) => {
  await getById(id); // verifica esistenza prima di aggiornare
  const result = await libriModel.update(id, dati);
  return result.rows[0];
};

// Elimina un libro dal catalogo
const elimina = async (id) => {
  await getById(id); // verifica esistenza prima di eliminare
  await libriModel.remove(id);
  return { message: 'Libro eliminato' };
};

// ── Esportazione ──────────────────────────────────────────────
module.exports = { getAll, getById, crea, getByISBN, aggiorna, elimina };
