// ============================================================
// routes/prestiti.routes.js
// ============================================================

const router     = require('express').Router();
const { body, param } = require('express-validator');
const validate   = require('../middleware/validate');
const controller = require('../controller/prestiti.controller');
const { autenticato, soloAdmin } = require('../middleware/auth');

const regolaId = [
  param('id').isInt({ min: 1 }).withMessage('L\'id deve essere un numero intero positivo'),
];

const regolaCrea = [
  // FIX #4 — utente_id rimosso dalla validazione del body:
  // viene letto direttamente dal JWT nel controller (req.utente.id).
  // Anche se il client lo invia, il controller lo ignora.

  body('libro_id')
    .notEmpty().withMessage('Il libro_id è obbligatorio')
    .isInt({ min: 1 }).withMessage('libro_id deve essere un numero intero positivo'),

  body('data_restituzione_prevista')
    .notEmpty().withMessage('La data di restituzione è obbligatoria')
    .isDate().withMessage('Formato data non valido — usa YYYY-MM-DD')
    .custom((valore) => {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      if (new Date(valore) <= oggi) {
        throw new Error('La data di restituzione deve essere futura');
      }
      return true;
    }),
];

// Tutte le routes
router.post('/',                 autenticato, regolaCrea, validate, controller.crea);
router.get('/',                  autenticato, controller.getAll);
router.get('/:id',               autenticato, regolaId, validate, controller.getById);
router.patch('/:id/restituisci', autenticato, regolaId, validate, controller.restituisci);
router.delete('/:id',            autenticato, soloAdmin, regolaId, validate, controller.elimina);

module.exports = router;
