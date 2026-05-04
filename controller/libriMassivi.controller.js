const libriMassiviService = require('../services/libriMassivi.service');

const importaCSV = async (req, res, next) => {
    try{
        if(!req.file){
            return res.status(400).json({
                successo: false,
                errore: 'Nessun file ricevuto. Invia un file CSV corretto'
            })
        }
        console.log(`File Ricevuto: ${req.file.originalname}`)

        const risultato = await libriMassiviService.importaLibri(req.file.buffer);
        const status =  risultato.errori.length > 0 || risultato.saltato.length > 0 ? 207 : 201;
        res.status(status).json({
            successo: true,
            messaggio: 'Import completato',
            dati: risultato
        });
    } catch (err) { next(err)};
}

module.exports = { importaCSV }