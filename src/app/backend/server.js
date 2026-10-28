const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Verbindungspool zur PostgreSQL-Datenbank herstellen
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'pg',
  port: 5432,
});
// WICHTIG: Setzt das Schema "addressbook" automatisch für alle Abfragen im Pool
pool.on('connect', (client) => {
  client.query('SET search_path TO addressbook, public')
    .catch(err => console.error('❌ Fehler beim Setzen des Schemas (search_path):', err.message));
});

// Teste die Datenbankverbindung beim Serverstart
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Fehler bei der Verbindung zu PostgreSQL:', err.stack);
  }
  console.log('✅ Erfolgreich mit der DB "postgres" im Schema "addressbook" verbunden!');
  release();
});
// GET: Alle Adressen laden
// GET: Alle Adressen abrufen mit Pagination & Sorting
app.get('/api/addresses', async (req, res) => {
  console.log('📥 GET /api/addresses mit Pagination aufgerufen. Parameter:', req.query);

  try {
    // 1. Parameter auslesen und Defaults setzen
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5; // Standardmäßig 5 Einträge pro Seite
    const offset = (page - 1) * limit;

    // Sortierungs-Erlaubnisliste (Whitelisting gegen SQL-Injection)
    const allowedSortFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      city: 'city',
      category: 'category'
    };
    const sortKey = req.query.sort || 'lastName';
    const sortColumn = allowedSortFields[sortKey] || 'last_name';

    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    // 2. Gesamtanzahl der Zeilen ermitteln (Wichtig für Pagination-Buttons)
    const countResult = await pool.query('SELECT COUNT(*) FROM addresses');
    const totalItems = parseInt(countResult.rows[0].count, 10);

    // 3. Paginierte und sortierte Daten aus der DB abfragen
    const queryText = `
      SELECT
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        phone,
        street,
        city,
        state,
        zip_code AS "zipCode",
        country,
        category
      FROM addresses
      ORDER BY ${sortColumn} ${order}
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(queryText, [limit, offset]);

    // 4. Strukturierte Antwort zurückgeben
    return res.json({
      data: result.rows,
      total: totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit)
    });

  } catch (err) {
    console.error('❌ Fehler in GET /api/addresses:', err.message);
    return res.status(500).json({ error: err.message });
  }
});


// POST: Neue Adresse hinzufügen
app.post('/api/addresses', async (req, res) => {
  const { firstName, lastName, email, phone, street, city, state, zipCode, country, category } =
    req.body;

  // DEBUG-LOG: Schauen, ob überhaupt Daten ankommen!
  console.log('Empfangene Daten im Backend:', req.body);

  try {
    const result = await pool.query(
      `INSERT INTO addresses (first_name, last_name, email, phone, street, city, state, zip_code, country, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [firstName, lastName, email, phone, street, city, state, zipCode, country, category],
    );

    // Wichtig: PostgreSQL gibt result.rows[0] zurück, nicht result.rows direkt
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('❌ CRITICAL DB ERROR:', err.message); // Das zeigt den Fehler im Terminal!
    res.status(500).json({ error: err.message });
  }
});
// PUT: Adresse aktualisieren
app.put('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, street, city, state, zipCode, country, category } =
    req.body;
  try {
    await pool.query(
      `UPDATE addresses SET first_name=$1, last_name=$2, email=$3, phone=$4, street=$5, city=$6, state=$7, zip_code=$8, country=$9, category=$10 WHERE id=$11`,
      [firstName, lastName, email, phone, street, city, state, zipCode, country, category, id],
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Adresse löschen (Fehlersicher mit explizitem Funktionsabbruch)
app.delete('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`📥 Backend: DELETE-Anfrage für ID: ${id}`);

  if (!id || id === 'undefined') {
    console.error('❌ Fehler: Keine gültige ID übergeben!');
    return res.status(400).json({ error: 'Ungültige oder fehlende ID' });
  }

  try {
    const queryText = 'DELETE FROM addresses WHERE id = $1::uuid';
    const result = await pool.query(queryText, [id]);

    if (result.rowCount === 0) {
      console.log(`⚠️ Keine Adresse mit der ID ${id} in der Datenbank gefunden.`);
      // Wichtig: return verwenden, damit die Funktion HIER stoppt!
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }

    console.log(`✅ Eintrag ${id} erfolgreich aus PostgreSQL gelöscht.`);

    // Wichtig: return verwenden, damit danach kein Code (z.B. im catch) ausgeführt wird!
    // Wir senden leeres JSON, das versteht der Angular HttpClient perfekt.
    return res.status(200).json({});

  } catch (err) {
    // Da oben überall 'return' steht, landen wir HIER nur, wenn pool.query wirklich abstürzt.
    console.error(`❌ ECHTER DB-FEHLER in DELETE /api/addresses/${id}:`, err.message);

    // Falls vor dem Absturz wider Erwarten doch schon Header gesendet wurden, bricht Express nicht mehr ab:
    if (res.headersSent) {
      return;
    }

    return res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => console.log('Backend läuft auf http://localhost:3000'));
