// ============================================================
// controller/prestiti.controller.js
// ============================================================

const prestitiService = require('../services/prestiti.service');

// POST /
const crea = async (req, res, next) => {
  try {
    // FIX #4 — utente_id viene letto da req.utente.id (il JWT verificato),
    // NON dal body della richiesta. In questo modo un utente non può
    // creare un prestito intestato a un altro utente.
    const utente_id = req.utente.id;
    const prestito = await prestitiService.crea(req.body, utente_id);
    res.status(201).json({ successo: true, dati: prestito });
  } catch (err) { next(err); }
};

// GET /
const getAll = async (req, res, next) => {
  try {
    const prestiti = await prestitiService.getAll();
    res.json({ successo: true, dati: prestiti });
  } catch (err) { next(err); }
};

// GET /:id
const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id); // 🔒 FIX #7
    const prestito = await prestitiService.getById(id);
    res.json({ successo: true, dati: prestito });
  } catch (err) { next(err); }
};

// PATCH /:id/restituisci
const restituisci = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id); // 🔒 FIX #7
    const prestito = await prestitiService.restituisci(id);
    res.json({ successo: true, dati: prestito });
  } catch (err) { next(err); }
};

// DELETE /:id
const elimina = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id); // 🔒 FIX #7
    await prestitiService.elimina(id);
    res.json({ successo: true });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, crea, elimina, restituisci };
