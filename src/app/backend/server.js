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
app.get('/api/addresses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, phone, street, city, state, zip_code AS "zipCode", country, category FROM addresses',
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// DELETE: Adresse löschen
app.delete('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM addresses WHERE id = $1', [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend läuft auf http://localhost:3000'));
