const utenteModel = require('../models/utenti');
const bcrypt = require('bcrypt');

const SALT_ROUND = 12;

const seedAdmin = async () => {
    const email    = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const nome     = process.env.ADMIN_NOME    || 'Admin';
    const cognome  = process.env.ADMIN_COGNOME || 'Sistema';

    if (process.env.NODE_ENV !== 'development') {
        console.warn('⚠️  Seeder saltato: NODE_ENV non è "development".');
        console.warn('   Per creare l\'admin, imposta NODE_ENV=development nel .env');
        return;
    }

    if (!email || !password) {
        console.warn('⚠️  Seeder admin saltato: ADMIN_EMAIL o ADMIN_PASSWORD mancanti nel .env');
        return;
    }

    try {
        const verificaUtente = await utenteModel.findByEmail(email);
        if (verificaUtente.rows.length) {
            console.log('ℹ️  Admin già presente, seeder saltato.');
            return;
        }

        const hash = await bcrypt.hash(password, SALT_ROUND);
        await utenteModel.create({ nome, cognome, email, password: hash, ruolo: 'admin' });
        console.log(`✅ Admin creato: ${email}`);
    } catch (err) {
        // Non blocchiamo l'avvio del server se il seeder fallisce
        console.error('❌ Errore nel seeder admin:', err.message);
    }
};

module.exports = seedAdmin;