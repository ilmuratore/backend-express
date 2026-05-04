const router = require('express').Router();
const multer = require('multer');
const upload = require('../middleware/upload');
const controller = require('../controller/libriMassivi.controller');
const { autenticato, soloAdmin } = require('../middleware/auth');


const gestisciErroriMulter = (err, req, res, next) => {
    if(err instanceof multer.MulterError){
        return res.status(400).json({
            successo: false,
            errore: `Errore upload`,
            codice: err.code
        });
    }
    if(err) {
        return res.status(400).json({
            successo: false,
            errore: err.message
        })
    }
    next()
}


router.post('/importLibri' , autenticato, soloAdmin, upload.csv.single('file'), gestisciErroriMulter, controller.importaCSV);


module.exports = router;