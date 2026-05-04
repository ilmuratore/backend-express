// ============================================================
// controller/utente.controller.js
// ============================================================

const utenteService = require('../services/utenti.service');

// POST /registra
const registra = async (req, res, next) => {
  try {
    const utente = await utenteService.registra(req.body);
    res.status(201).json({ successo: true, dati: utente });
  } catch (err) { next(err); }
};

// POST /login
const login = async (req, res, next) => {
  try {
    const token = await utenteService.login(req.body);
    res.json({ successo: true, dati: token });
  } catch (err) { next(err); }
};

// GET /
const getAll = async (req, res, next) => {
  try {
    const utenti = await utenteService.getAll();
    res.json({ successo: true, dati: utenti });
  } catch (err) { next(err); }
};

// GET /:id
const getById = async (req, res, next) => {
  try {
    // FIX #7 — parseInt converte la stringa URL in numero intero.
    // req.params.id è sempre una stringa: "5" !== 5 in JavaScript.
    // Senza parseInt il confronto req.utente.id === req.params.id
    // in solo se Admin fallirebbe sempre (number vs string).
    const id = parseInt(req.params.id);
    const utente = await utenteService.getById(id);
    res.json({ successo: true, dati: utente });
  } catch (err) { next(err); }
};

// PATCH /:id
const aggiorna = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const utente = await utenteService.aggiorna(id, req.body);
    res.json({ successo: true, dati: utente });
  } catch (err) { next(err); }
};

// DELETE /:id
const elimina = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const risultato = await utenteService.elimina(id);
    res.json({ successo: true, dati: risultato });
  } catch (err) { next(err); }
};

module.exports = { registra, login, getAll, getById, aggiorna, elimina };
