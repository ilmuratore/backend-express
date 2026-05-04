const multer = require('multer');
const path = require('path');


const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/tmp'));
    }, 
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName)
    }
})

const memoryStorage = multer.memoryStorage();

const filterCSV = (req, file, cb) => {
    const mimeOK = file.mimetype === 'text/csv' ||
                   file.mimetype === 'application/vnd.ms-excel';
    const extOk = path.extname(file.originalname).toLocaleLowerCase() === '.csv';

    if( mimeOK || extOk ){
        cb(null, true)
    } else {
        cb(new Error ('Formato non supportato: carica un file corretto'), false);
    }
}

const upload = {
    csv: multer({
        storage: diskStorage, 
        fileFilter: filterCSV,
        limits: { fileSize: 5 * 1024 * 1024} //5 MB
    })
}

module.exports = upload