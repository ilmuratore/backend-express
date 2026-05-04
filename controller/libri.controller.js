// ============================================================
// controller/libri.controller.js
// ============================================================

const libriService = require('../services/libri.service');

// POST /
const crea = async (req, res, next) => {
  try {
    const libro = await libriService.crea(req.body);
    res.status(201).json({ successo: true, dati: libro });
  } catch (err) { next(err); }
};

// GET /
const getAll = async (req, res, next) => {
  try {
    const libri = await libriService.getAll();
    res.json({ successo: true, dati: libri });
  } catch (err) { next(err); }
};

// GET /:id
const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id); // 🔒 FIX #7
    const libro = await libriService.getById(id);
    res.json({ successo: true, dati: libro });
  } catch (err) { next(err); }
};

// GET /isbn/:isbn
const getByISBN = async (req, res, next) => {
  try {
    const libro = await libriService.getByISBN(req.params.isbn);
    res.json({ successo: true, dati: libro });
  } catch (err) { next(err); }
};

// PATCH /:id
const aggiorna = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id); // 🔒 FIX #7
    const libro = await libriService.aggiorna(id, req.body);
    res.json({ successo: true, dati: libro });
  } catch (err) { next(err); }
};

// DELETE /:id
const elimina = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id); // 🔒 FIX #7
    await libriService.elimina(id);
    res.json({ successo: true });
  } catch (err) { next(err); }
};

module.exports = { crea, getAll, getById, getByISBN, aggiorna, elimina };
