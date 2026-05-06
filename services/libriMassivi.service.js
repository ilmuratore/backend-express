const libriModel = require('../models/libri');

const parseCSV = (buffer) => {
  const testo = buffer.toString('utf8');
  const righe = testo
    .split('\n')
    .map(r => r.trim())
    .filter(r => r.length > 0);

  if (righe.length < 2) {
    const err = new Error('Il CSV deve avere almeno una riga di intestazione e una di dati');
    err.statusCode = 400;
    throw err;
  }

  const intestazione = righe[0].split(',').map(h => h.trim().toLowerCase());

  const campiObbligatori = ['titolo', 'autore', 'isbn', 'anno_pubblicazione', 'genere', 'quantita'];
  for (const campo of campiObbligatori) {
    if (!intestazione.includes(campo)) {
      const err = new Error(`Campo obbligatorio mancante nell'intestazione: ${campo}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const libri = righe.slice(1).map((riga, indice) => {
    const valori = riga.split(',').map(v => v.trim());

    const libro = {};
    intestazione.forEach((col, i) => {
      libro[col] = valori[i] ?? '';
    });


    if (!libro.titolo) {
      const err = new Error(`Riga ${indice + 1}: titolo mancante`);
      err.statusCode = 400;
      throw err;
    }
    if (!libro.autore) {
      const err = new Error(`Riga ${indice + 1}: autore mancante`);
      err.statusCode = 400;
      throw err;
    }
    const quantitaParsata = parseInt(libro.quantita, 10);
    const quantita = !isNaN(quantitaParsata) && quantitaParsata >= 0
      ? quantitaParsata
      : 1;

    const annoParsato = parseInt(libro.anno_pubblicazione, 10);

    return {
      titolo:             libro.titolo,
      autore:             libro.autore,
      isbn:               libro.isbn               || null,
      anno_pubblicazione: !isNaN(annoParsato)       ? annoParsato : null,
      genere:             libro.genere              || null,
      quantita,
    };
  });

  return libri;
};

const importaLibri = async (buffer) => {
  const libri = parseCSV(buffer);
  const risultato = {
    totale:   libri.length,
    inseriti: 0,
    saltato:  [],
    errori:   [],
  };

  for (const libro of libri) {
    try {
      if (libro.isbn) {
        const esiste = await libriModel.findByIsbn(libro.isbn);
        if (esiste.rows.length) {
          risultato.saltato.push({
            titolo: libro.titolo,
            motivo: 'ISBN già presente nel DB',
          });
          continue;
        }
      }
      await libriModel.create(libro);
      risultato.inseriti++;
    } catch (err) {
      risultato.errori.push({
        titolo: libro.titolo,
        motivo: err.message,
      });
    }
  }

  return risultato;
};

module.exports = { importaLibri };