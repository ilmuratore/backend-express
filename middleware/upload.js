const multer = require('multer');
const path   = require('path');

const memoryStorage = multer.memoryStorage();

const filterCSV = (req, file, cb) => {
    const mimeOK = file.mimetype === 'text/csv' ||
                   file.mimetype === 'application/vnd.ms-excel';
    const extOk  = path.extname(file.originalname).toLowerCase() === '.csv';

    // OR intenzionale: su Windows i CSV arrivano spesso con MIME 'application/vnd.ms-excel'.
    // Accettiamo se il MIME è corretto O se l'estensione è .csv.
    if (mimeOK || extOk) {
        cb(null, true);
    } else {
        cb(new Error('Formato non supportato: carica un file .csv'), false);
    }
};

const upload = {
    csv: multer({
        storage: memoryStorage,      
        fileFilter: filterCSV,
        limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
    })
};

module.exports = upload;