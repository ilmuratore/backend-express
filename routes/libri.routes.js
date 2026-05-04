const router = require('express').Router();
const { body, param } = require('express-validator');
const validate   = require('../middleware/validate');
const controller = require('../controller/libri.controller');
const { autenticato, soloAdmin } = require('../middleware/auth');

const regolaId = [
  param('id').isInt({ min: 1 }).withMessage('L\'id deve essere un numero intero positivo'),
];

const regolaCrea = [
  body('titolo')
    .trim()
    .notEmpty().withMessage('Il titolo è obbligatorio')
    .isLength({ max: 255 }).withMessage('Il titolo non può superare 255 caratteri'),

  body('autore')
    .trim()
    .notEmpty().withMessage('L\'autore è obbligatorio')
    .isLength({ max: 255 }).withMessage('L\'autore non può superare 255 caratteri'),

  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 }).withMessage('ISBN non valido'),

  body('anno_pubblicazione')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`L'anno deve essere tra 1000 e ${new Date().getFullYear()}`),

  body('genere')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Il genere non può superare 100 caratteri'),

  body('quantita')
    .optional()
    .isInt({ min: 1 }).withMessage('La quantità deve essere almeno 1'),
];

const regolaAggiorna = [
  param('id').isInt({ min: 1 }).withMessage('L\'id deve essere un numero intero positivo'),

  body('titolo')
    .optional()
    .trim()
    .notEmpty().withMessage('Il titolo non può essere vuoto')
    .isLength({ max: 255 }).withMessage('Il titolo non può superare 255 caratteri'),

  body('autore')
    .optional()
    .trim()
    .notEmpty().withMessage('L\'autore non può essere vuoto')
    .isLength({ max: 255 }).withMessage('L\'autore non può superare 255 caratteri'),

  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 }).withMessage('ISBN non valido'),

  body('anno_pubblicazione')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(`L'anno deve essere tra 1000 e ${new Date().getFullYear()}`),

  body('genere')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Il genere non può superare 100 caratteri'),
];

// Tutte le routes
router.post('/', autenticato, soloAdmin, regolaCrea, validate, controller.crea);
router.get('/', autenticato, controller.getAll);
router.get('/isbn/:isbn', autenticato, controller.getByISBN);
router.get('/:id', autenticato, regolaId, validate, controller.getById);
router.patch('/:id', autenticato, regolaAggiorna, validate, controller.aggiorna);
router.delete('/:id', autenticato, soloAdmin, regolaId, validate, controller.elimina);

module.exports = router;