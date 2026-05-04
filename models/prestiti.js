const pool = require('../config/db');

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS prestiti (
    id                          SERIAL      PRIMARY KEY,
    utente_id                   INTEGER     NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
    libro_id                    INTEGER     NOT NULL REFERENCES libri(id)  ON DELETE CASCADE,
    data_prestito               DATE        NOT NULL DEFAULT CURRENT_DATE,
    data_restituzione_prevista  DATE        NOT NULL,
    data_restituzione_effettiva DATE,
    stato                       VARCHAR(20) NOT NULL DEFAULT 'attivo'
                                CHECK (stato IN ('attivo', 'restituito', 'in_ritardo')),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

// REFERENCES utenti(id) e REFERENCES libri(id) sono chiavi esterne (foreign key):
// significano che utente_id e libro_id devono esistere nelle rispettive tabelle.
// ON DELETE CASCADE: se un utente o un libro viene eliminato, spariscono anche i suoi prestiti.

const init = () => pool.query(CREATE_TABLE);

// Restituisce tutti i prestiti con i dettagli dell'utente e del libro collegati.
// JOIN ci permette di unire più tabelle in una sola risposta,
// così il frontend riceve tutto il necessario in una query sola.
const findAll = () =>
  pool.query(
    `SELECT
       p.*,
       u.nome || ' ' || u.cognome AS utente_nome,
       u.email                    AS utente_email,
       l.titolo                   AS libro_titolo,
       l.autore                   AS libro_autore,
       l.isbn                     AS libro_isbn
     FROM prestiti p
     JOIN utenti u ON u.id = p.utente_id
     JOIN libri  l ON l.id = p.libro_id
     ORDER BY p.data_prestito DESC`
  );

// Restituisce un singolo prestito con i dettagli di utente e libro
const findById = (id) =>
  pool.query(
    `SELECT
       p.*,
       u.nome || ' ' || u.cognome AS utente_nome,
       u.email                    AS utente_email,
       l.titolo                   AS libro_titolo,
       l.autore                   AS libro_autore
     FROM prestiti p
     JOIN utenti u ON u.id = p.utente_id
     JOIN libri  l ON l.id = p.libro_id
     WHERE p.id = $1`,
    [id]
  );

// Inserisce un nuovo prestito
const create = ({ utente_id, libro_id, data_restituzione_prevista }) =>
  pool.query(
    `INSERT INTO prestiti (utente_id, libro_id, data_restituzione_prevista)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [utente_id, libro_id, data_restituzione_prevista]
  );

// Segna un prestito come restituito, registrando la data di oggi
const restituisci = (id) =>
  pool.query(`
    UPDATE prestiti
    SET stato = 'restituito',
    data_restituzione_effettiva = CURRENT_DATE
    WHERE id = $1
    RETURNING *
    `,[id]
  );

// Aggiorna automaticamente lo stato a 'in_ritardo' per tutti i prestiti
// ancora 'attivi' la cui data di restituzione prevista è già passata.
// Viene chiamata ogni volta che si recupera la lista dei prestiti.
const aggiornaRitardi = () =>
  pool.query(
    `UPDATE prestiti
     SET stato = 'in_ritardo'
     WHERE stato = 'attivo'
       AND data_restituzione_prevista < CURRENT_DATE`
  );

// Elimina un prestito per id
const remove = (id) =>
  pool.query('DELETE FROM prestiti WHERE id = $1 RETURNING id', [id]);

module.exports = { init, findAll, findById, create, restituisci, aggiornaRitardi, remove };