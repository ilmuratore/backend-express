require('dotenv').config();

const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || 500;
    const messaggio = err.message || 'Errore interno del server';

    if(process.env.NODE_ENV !== 'production'){
        console.error(`[${new Date().toISOString()}] ${status} - ${messaggio}`);
        if(status === 500) console.error(err.stack);
    }
    res.status(status).json({successo: false, errore: messaggio});
}

module.exports = errorHandler;